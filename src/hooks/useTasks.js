import { useCallback, useEffect, useState } from 'react';
import {
  fetchTasksWithProgress,
  retryRejectedTask,
  startUserTask,
  submitTaskForApproval,
} from '../services/taskService';

/**
 * Task board state + actions for student task lifecycle.
 * @param {{ id: string } | null | undefined} user
 */
export function useTasks(user) {
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const { allTasks, userProgress } = await fetchTasksWithProgress(user.id);
      const userProgressMap = new Map(userProgress.map((progress) => [progress.task_id, progress]));
      const combinedTasks = allTasks.map((task) => {
        const progress = userProgressMap.get(task.id);
        return {
          ...task,
          user_task_id: progress?.id || null,
          status: progress?.status || 'not_started',
          rejection_message: progress?.rejection_message || null,
        };
      });

      setUserTasks(combinedTasks);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') return;
      setError('Failed to load your tasks: ' + fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserTasks([]);
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [user, fetchTasks]);

  const closeTaskDetailsModal = useCallback(() => setSelectedTask(null), []);

  const handleStatusChange = useCallback(async () => {
    if (!selectedTask || !user) return;
    const currentStatus = selectedTask.status;

    try {
      if (currentStatus === 'not_started') {
        const { data, error: upsertError } = await startUserTask({
          userId: user.id,
          taskId: selectedTask.id,
        });

        if (upsertError) throw upsertError;

        await fetchTasks();
        setSelectedTask((previousTask) => ({
          ...previousTask,
          user_task_id: data.id,
          status: data.status,
          rejection_message: data.rejection_message,
        }));
      } else if (currentStatus === 'in_progress') {
        if (selectedTask.user_task_id) {
          setTaskToComplete(selectedTask);
          setShowProofModal(true);
        } else {
          setError('Cannot submit task: User task entry not found for submission.');
        }
      }
    } catch (statusError) {
      if (statusError.name === 'AbortError') return;
      setError('Failed to update task status: ' + statusError.message);
    }
  }, [selectedTask, user, fetchTasks]);

  const handleSubmitForApproval = useCallback(async () => {
    if (!taskToComplete) return;
    try {
      const { error: updateError } = await submitTaskForApproval(taskToComplete.user_task_id);
      if (updateError) throw updateError;

      setSuccessMessage('Task submitted for approval! Your points will be credited shortly.');
      await fetchTasks();
    } catch (submitError) {
      if (submitError.name === 'AbortError') return;
      setError('Failed to submit task for approval: ' + submitError.message);
    } finally {
      setShowProofModal(false);
      setTaskToComplete(null);
      closeTaskDetailsModal();
    }
  }, [taskToComplete, fetchTasks, closeTaskDetailsModal]);

  const handleRetryTask = useCallback(async () => {
    if (!selectedTask) return;
    try {
      const { error: updateError } = await retryRejectedTask(selectedTask.user_task_id);
      if (updateError) throw updateError;
      await fetchTasks();
      closeTaskDetailsModal();
    } catch (retryError) {
      if (retryError.name === 'AbortError') return;
      setError('Failed to retry task: ' + retryError.message);
    }
  }, [selectedTask, fetchTasks, closeTaskDetailsModal]);

  return {
    userTasks,
    loading,
    error,
    selectedTask,
    setSelectedTask,
    showProofModal,
    setShowProofModal,
    taskToComplete,
    successMessage,
    handleStatusChange,
    handleSubmitForApproval,
    handleRetryTask,
    closeTaskDetailsModal,
  };
}

