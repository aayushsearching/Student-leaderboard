import React from 'react';

/**
 * Student task summary card.
 * @param {{
 *   task: any,
 *   statusLabel: string,
 *   className: string,
 *   onShowDetails: () => void
 * }} props
 */
function TaskCard({ task, statusLabel, className, onShowDetails }) {
  return (
    <div className={className}>
      <h4>{task.title || 'Task details not found'}</h4>
      <div className="task-details">
        <span>Status: {task.status === 'rejected' ? 'Rejected' : statusLabel}</span>
        <span>Points: {task.points || 0}</span>
      </div>
      {task.rejection_message && (
        <div className="rejection-box">
          <strong>Admin Feedback:</strong> {task.rejection_message}
        </div>
      )}
      <button type="button" className="show-details-button" onClick={onShowDetails}>
        Show Details
      </button>
    </div>
  );
}

export default TaskCard;

