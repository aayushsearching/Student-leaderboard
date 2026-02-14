/**
 * Check whether a profile has required fields for completion.
 * @param {{ full_name?: string, academic_year?: string, branch?: string } | null | undefined} profileData
 */
export const isProfileComplete = (profileData) =>
  Boolean(profileData?.full_name && profileData?.academic_year && profileData?.branch);

/**
 * Build common class names for task card status.
 * @param {string} status
 */
export const getTaskCardClassName = (status) => {
  let className = 'task-card';
  if (status === 'completed') className += ' task-completed';
  if (status === 'rejected') className += ' task-rejected';
  return className;
};

/**
 * Convert task status code to display label.
 * @param {string} status
 */
export const getTaskStatusLabel = (status) =>
  (
    {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      pending_review: 'Pending Approval',
      completed: 'Completed',
      rejected: 'Rejected',
    }[status] || 'Unknown'
  );

