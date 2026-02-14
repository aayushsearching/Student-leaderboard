import React from 'react';
import './TasksPage.css';
import TaskCard from '../components/TaskList/TaskCard';
import { useTasks } from '../hooks/useTasks';
import { getTaskCardClassName, getTaskStatusLabel } from '../utils/helpers';

/**
 * Student task lifecycle page.
 * @param {{ user: { id: string } | null }} props
 */
function TasksPage({ user }) {
  const {
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
  } = useTasks(user);

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
            <p className="muted-text" style={{ textAlign: 'center' }}>
              No tasks assigned to you yet.
            </p>
          )}

          {!loading && !error && (
            <div className="tasks-grid">
              {userTasks.map((userTask) => (
                <TaskCard
                  key={userTask.id}
                  task={userTask}
                  className={getTaskCardClassName(userTask.status)}
                  statusLabel={getTaskStatusLabel(userTask.status)}
                  onShowDetails={() => setSelectedTask(userTask)}
                />
              ))}
            </div>
          )}

          {selectedTask && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{selectedTask.title}</h3>
                <p>
                  <strong>Status:</strong> {getTaskStatusLabel(selectedTask.status)}
                </p>
                {selectedTask.rejection_message && (
                  <p className="error-message">
                    <strong>Admin Feedback:</strong> {selectedTask.rejection_message}
                  </p>
                )}
                <p>
                  <strong>Description:</strong> {selectedTask.description}
                </p>
                {selectedTask.tasks_url && (
                  <p>
                    <strong>URL:</strong>{' '}
                    <a href={selectedTask.tasks_url} target="_blank" rel="noopener noreferrer">
                      {selectedTask.tasks_url}
                    </a>
                  </p>
                )}
                <p>
                  <strong>Points:</strong> {selectedTask.points}
                </p>
                {selectedTask.due_date && (
                  <p>
                    <strong>Deadline:</strong> {new Date(selectedTask.due_date).toLocaleString()}
                  </p>
                )}

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

                <button type="button" onClick={closeTaskDetailsModal} className="modal-close-button">
                  Close
                </button>
              </div>
            </div>
          )}

          {showProofModal && (
            <div className="modal-overlay">
              <div className="modal-content proof-modal">
                <h3>Proof of Work</h3>
                <p>Have you sent the proof of work to the mail?</p>
                <div className="modal-actions">
                  <button type="button" onClick={handleSubmitForApproval} className="yes-button">
                    Yes, I have
                  </button>
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


