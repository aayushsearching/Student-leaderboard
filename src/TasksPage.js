import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed as it's not used
import { supabase } from './supabaseClient';
import './TasksPage.css';

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
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    const { data, error: fetchError } = await supabase
      .from('user_tasks')
      .select(`
        id,
        status,
        rejection_message,
        tasks (
          title,
          description,
          points,
          due_date,
          tasks_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Failed to load your tasks: ' + fetchError.message);
    } else {
      setUserTasks(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openTaskDetailsModal = (task) => setSelectedTask(task);
  const closeTaskDetailsModal = useCallback(() => setSelectedTask(null), []);

  const statusDisplayMap = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    pending_review: 'Pending Approval',
    completed: 'Completed',
    rejected: 'Rejected',
  };

  const handleStatusChange = useCallback(async () => {
    if (!selectedTask) return;
    const currentStatus = selectedTask.status;
    
    // If status is 'not_started', change to 'in_progress'
    // If status is 'in_progress', change to 'pending_review'
    if (currentStatus === 'not_started' || currentStatus === 'in_progress') {
      const nextStatus = currentStatus === 'not_started' ? 'in_progress' : 'pending_review';
      
      if (nextStatus === 'pending_review') {
        setTaskToComplete(selectedTask);
        setShowProofModal(true);
      } else { // This path is for changing from 'not_started' to 'in_progress'
        try {
          const { error: updateError } = await supabase
            .from('user_tasks')
            .update({ status: nextStatus, rejection_message: null })
            .eq('id', selectedTask.id);
          if (updateError) throw updateError;
          await fetchTasks();
          setSelectedTask(prev => ({ ...prev, status: nextStatus, rejection_message: null }));
        } catch (err) {
          setError('Failed to update task status: ' + err.message);
        }
      }
    }
  }, [selectedTask, fetchTasks]);

  const handleSubmitForApproval = useCallback(async () => {
    if (!taskToComplete) return;
    try {
      const { error: updateError } = await supabase
        .from('user_tasks')
        .update({ status: 'pending_review', submitted_at: new Date().toISOString() })
        .eq('id', taskToComplete.id);
      if (updateError) throw updateError;
      
      setSuccessMessage('Task submitted for approval! Your points will be credited shortly.');
      await fetchTasks();
    } catch (err) {
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
        .eq('id', selectedTask.id);
      if (updateError) throw updateError;
      await fetchTasks();
      closeTaskDetailsModal(); // Close the modal after retrying
    } catch (err) {
      setError('Failed to retry task: ' + err.message);
    }
  }, [selectedTask, fetchTasks, closeTaskDetailsModal]);

  return (
    <div className="tasks-page-container">
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
            <div key={userTask.id} className={`task-card ${userTask.status === 'completed' ? 'task-completed' : ''} ${userTask.status === 'rejected' ? 'task-rejected' : ''}`}>
              <h4>{userTask.tasks?.title || 'Task details not found'}</h4>
              <div className="task-details">
                <span>Status: {userTask.status === 'rejected' ? '❌ Rejected' : (statusDisplayMap[userTask.status] || 'Unknown')}</span>
                <span>Points: {userTask.tasks?.points || 0}</span>
              </div>
              {userTask.rejection_message && (
                <div className="rejection-box">
                  <strong>Admin Feedback:</strong> {userTask.rejection_message}
                </div>
              )}
              <button className="show-details-button" onClick={() => openTaskDetailsModal(userTask)}>Show Details</button>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedTask.tasks?.title}</h3>
            <p><strong>Status:</strong> {statusDisplayMap[selectedTask.status]}</p>
            {selectedTask.rejection_message && <p className="error-message"><strong>Admin Feedback:</strong> {selectedTask.rejection_message}</p>}
            <p><strong>Description:</strong> {selectedTask.tasks?.description}</p>
            {selectedTask.tasks?.tasks_url && <p><strong>URL:</strong> <a href={selectedTask.tasks?.tasks_url} target="_blank" rel="noopener noreferrer">{selectedTask.tasks.tasks_url}</a></p>}
            <p><strong>Points:</strong> {selectedTask.tasks?.points}</p>
            {selectedTask.tasks?.due_date && <p><strong>Deadline:</strong> {new Date(selectedTask.tasks.due_date).toLocaleString()}</p>}
            
            {(selectedTask.status === 'not_started' || selectedTask.status === 'in_progress') && (
              <button onClick={handleStatusChange} className="change-status-button">
                Change Status to "{selectedTask.status === 'not_started' ? 'In Progress' : 'Submit for Approval'}"
              </button>
            )}

            {selectedTask.status === 'rejected' && (
              <button onClick={handleRetryTask} className="change-status-button">
                Retry Task
              </button>
            )}

            <button onClick={closeTaskDetailsModal} className="modal-close-button">Close</button>
          </div>
        </div>
      )}

      {showProofModal && (
        <div className="modal-overlay">
          <div className="modal-content proof-modal">
            <h3>Proof of Work</h3>
            <p>Have you sent the proof of work to the mail?</p>
            <div className="modal-actions">
              <button onClick={handleSubmitForApproval} className="yes-button">Yes, I have</button>
              <a 
                href={`mailto:tasksquare@duck.com?subject=Proof of Work: ${taskToComplete?.tasks?.title}&body=Paste your proof of work here.`}
                className="no-button"
                onClick={() => setShowProofModal(false)}
              >
                No, take me to email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;