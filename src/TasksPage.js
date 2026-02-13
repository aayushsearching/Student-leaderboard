import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed as it's not used
import { supabase } from './supabaseClient';
import './TasksPage.css';

const STATUS_DISPLAY_MAP = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  pending_review: 'Pending Approval',
  completed: 'Completed',
  rejected: 'Rejected',
};

const getStatusLabel = (status) => STATUS_DISPLAY_MAP[status] || 'Unknown';

const getTaskCardClassName = (status) => {
  let className = 'task-card';
  if (status === 'completed') className += ' task-completed';
  if (status === 'rejected') className += ' task-rejected';
  return className;
};

function TasksPage({ user }) {
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  // const navigate = useNavigate(); // Removed as it's not used

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Fetch all tasks from the 'tasks' table
      const { data: allTasks, error: tasksFetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksFetchError) throw tasksFetchError;

      // Fetch user-specific task progress from 'user_tasks'
      const { data: userProgress, error: userProgressError } = await supabase
        .from('user_tasks')
        .select('task_id, status, rejection_message, id') // Select only relevant user_tasks fields
        .eq('user_id', user.id);

      if (userProgressError) throw userProgressError;

      // Map user progress to a more accessible format
      const userProgressMap = new Map(userProgress.map(progress => [progress.task_id, progress]));

      // Combine all tasks with user-specific progress, defaulting status
      const combinedTasks = allTasks.map(task => {
        const progress = userProgressMap.get(task.id);
        return {
          ...task, // Global task details
          user_task_id: progress?.id || null, // ID of the user_tasks entry, if it exists
          status: progress?.status || 'not_started',
          rejection_message: progress?.rejection_message || null,
        };
      });

      setUserTasks(combinedTasks);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('Failed to load your tasks: ' + err.message);
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
  }, [fetchTasks, user]);

  const openTaskDetailsModal = (task) => setSelectedTask(task);
  const closeTaskDetailsModal = useCallback(() => setSelectedTask(null), []);

  const handleStatusChange = useCallback(async () => {
    if (!selectedTask) return;
    const currentStatus = selectedTask.status;

    try {
      if (currentStatus === 'not_started') {
        // If status is 'not_started', create a new user_task entry
        const { data, error: upsertError } = await supabase
          .from('user_tasks')
          .upsert({
            user_id: user.id,
            task_id: selectedTask.id,
            status: 'in_progress',
          }, { onConflict: 'user_id,task_id' })
          .select('id, status, rejection_message')
          .single();

        if (upsertError) throw upsertError;

        await fetchTasks(); // Re-fetch all tasks to get the updated list
        setSelectedTask(prev => ({
          ...prev,
          user_task_id: data.id, // Set the new user_task_id
          status: data.status,
          rejection_message: data.rejection_message,
        }));
      } else if (currentStatus === 'in_progress') {
        // If status is 'in_progress', prepare for submission (show proof modal)
        if (selectedTask.user_task_id) {
          setTaskToComplete(selectedTask);
          setShowProofModal(true);
        } else {
          // This should ideally not happen if 'in_progress' means an entry exists, but good to handle defensively
          setError('Cannot submit task: User task entry not found for submission.');
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('Failed to update task status: ' + err.message);
    }
  }, [selectedTask, user?.id, fetchTasks]);

  const handleSubmitForApproval = useCallback(async () => {
    if (!taskToComplete) return;
    try {
      const { error: updateError } = await supabase
        .from('user_tasks')
        .update({ status: 'pending_review', submitted_at: new Date().toISOString() })
        .eq('id', taskToComplete.user_task_id);
      if (updateError) throw updateError;
      
      setSuccessMessage('Task submitted for approval! Your points will be credited shortly.');
      await fetchTasks();
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('Failed to submit task for approval: ' + err.message);
    } finally {
      setShowProofModal(false);
      setTaskToComplete(null);
      closeTaskDetailsModal();
    }
  }, [taskToComplete, fetchTasks, closeTaskDetailsModal]);

  const handleRetryTask = useCallback(async () => {
    if (!selectedTask) return;
    try {
      const { error: updateError } = await supabase
        .from('user_tasks')
        .update({ status: 'in_progress', rejection_message: null })
        .eq('id', selectedTask.user_task_id);
      if (updateError) throw updateError;
      await fetchTasks();
      closeTaskDetailsModal(); // Close the modal after retrying
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('Failed to retry task: ' + err.message);
    }
  }, [selectedTask, fetchTasks, closeTaskDetailsModal]);

  return (
    <div className="tasks-page-container">
      {!user ? (
        <p className="text-center text-gray-500">Please log in to view your tasks.</p>
      ) : (
        <>
          {successMessage && <p className="success-message">{successMessage}</p>}
          <div className="tasks-header">
            <h2>My Tasks</h2>
            <p className="muted-text">Overview of your assigned tasks</p>
          </div>

          {loading && <p className="loading-message">Loading tasks...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && userTasks.length === 0 && (
            <p className="muted-text" style={{textAlign: 'center'}}>No tasks assigned to you yet.</p>
          )}

          {!loading && !error && (
            <div className="tasks-grid">
              {userTasks.map((userTask) => (
                <div key={userTask.id} className={getTaskCardClassName(userTask.status)}>
                  <h4>{userTask.title || 'Task details not found'}</h4>
                  <div className="task-details">
                    <span>Status: {userTask.status === 'rejected' ? '❌ Rejected' : getStatusLabel(userTask.status)}</span>
                    <span>Points: {userTask.points || 0}</span>
                  </div>
                  {userTask.rejection_message && (
                    <div className="rejection-box">
                      <strong>Admin Feedback:</strong> {userTask.rejection_message}
                    </div>
                  )}
                  <button type="button" className="show-details-button" onClick={() => openTaskDetailsModal(userTask)}>Show Details</button>
                </div>
              ))}
            </div>
          )}

          {selectedTask && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{selectedTask.title}</h3>
                <p><strong>Status:</strong> {getStatusLabel(selectedTask.status)}</p>
                {selectedTask.rejection_message && <p className="error-message"><strong>Admin Feedback:</strong> {selectedTask.rejection_message}</p>}
                <p><strong>Description:</strong> {selectedTask.description}</p>
                {selectedTask.tasks_url && <p><strong>URL:</strong> <a href={selectedTask.tasks_url} target="_blank" rel="noopener noreferrer">{selectedTask.tasks_url}</a></p>}
                <p><strong>Points:</strong> {selectedTask.points}</p>
                {selectedTask.due_date && <p><strong>Deadline:</strong> {new Date(selectedTask.due_date).toLocaleString()}</p>}
                
                {(selectedTask.status === 'not_started' || selectedTask.status === 'in_progress') && (
                  <button type="button" onClick={handleStatusChange} className="change-status-button">
                    Change Status to "{selectedTask.status === 'not_started' ? 'In Progress' : 'Submit for Approval'}"
                  </button>
                )}

                {selectedTask.status === 'rejected' && (
                  <button type="button" onClick={handleRetryTask} className="change-status-button">
                    Retry Task
                  </button>
                )}

                <button type="button" onClick={closeTaskDetailsModal} className="modal-close-button">Close</button>
              </div>
            </div>
          )}

          {showProofModal && (
            <div className="modal-overlay">
              <div className="modal-content proof-modal">
                <h3>Proof of Work</h3>
                <p>Have you sent the proof of work to the mail?</p>
                <div className="modal-actions">
                  <button type="button" onClick={handleSubmitForApproval} className="yes-button">Yes, I have</button>
                  <a 
                    href={`mailto:tasksquare@duck.com?subject=Proof of Work: ${taskToComplete?.title}&body=Paste your proof of work here.`}
                    className="no-button"
                    onClick={() => setShowProofModal(false)}
                  >
                    No, take me to email
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TasksPage;
