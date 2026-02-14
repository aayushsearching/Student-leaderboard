import { supabase } from './supabaseClient';

/**
 * Fetch all task templates.
 */
export const fetchTaskTemplates = () =>
  supabase.from('tasks').select('*').order('created_at', { ascending: false });

/**
 * Create a task template.
 * @param {Record<string, unknown>} payload
 */
export const createTaskTemplate = (payload) =>
  supabase.from('tasks').insert([payload]);

/**
 * Update a task template.
 * @param {string} taskId
 * @param {Record<string, unknown>} payload
 */
export const updateTaskTemplate = (taskId, payload) =>
  supabase.from('tasks').update(payload).eq('id', taskId);

/**
 * Delete a task template.
 * @param {string} taskId
 */
export const deleteTaskTemplate = (taskId) =>
  supabase.from('tasks').delete().eq('id', taskId);

/**
 * Fetch all tasks and user-specific progress rows.
 * @param {string} userId
 */
export const fetchTasksWithProgress = async (userId) => {
  const { data: allTasks, error: tasksFetchError } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (tasksFetchError) throw tasksFetchError;

  const { data: userProgress, error: userProgressError } = await supabase
    .from('user_tasks')
    .select('task_id, status, rejection_message, id')
    .eq('user_id', userId);
  if (userProgressError) throw userProgressError;

  return { allTasks, userProgress };
};

/**
 * Start an in-progress user task (upsert).
 * @param {{ userId: string, taskId: string }} params
 */
export const startUserTask = ({ userId, taskId }) =>
  supabase
    .from('user_tasks')
    .upsert(
      {
        user_id: userId,
        task_id: taskId,
        status: 'in_progress',
      },
      { onConflict: 'user_id,task_id' }
    )
    .select('id, status, rejection_message')
    .single();

/**
 * Submit an in-progress task for approval.
 * @param {string} userTaskId
 */
export const submitTaskForApproval = (userTaskId) =>
  supabase
    .from('user_tasks')
    .update({ status: 'pending_review', submitted_at: new Date().toISOString() })
    .eq('id', userTaskId);

/**
 * Retry a rejected task.
 * @param {string} userTaskId
 */
export const retryRejectedTask = (userTaskId) =>
  supabase
    .from('user_tasks')
    .update({ status: 'in_progress', rejection_message: null })
    .eq('id', userTaskId);

/**
 * Fetch tasks pending review for admin approval.
 */
export const fetchPendingReviewTasks = () =>
  supabase
    .from('user_tasks')
    .select(
      `
      id,
      user_id,
      status,
      submission_url,
      submitted_at,
      tasks (
        title,
        points
      ),
      profiles (
        full_name,
        email
      )
    `
    )
    .eq('status', 'pending_review')
    .order('submitted_at', { ascending: true });

/**
 * Approve task and update user score.
 * @param {{ userTaskId: string, userId: string, points: number }} params
 */
export const approveTaskAndUpdateScore = ({ userTaskId, userId, points }) =>
  supabase.rpc('approve_task_and_update_score', {
    p_user_task_id: userTaskId,
    p_user_id: userId,
    p_points_to_add: points,
  });

/**
 * Reject task with feedback.
 * @param {{ userTaskId: string, feedback: string }} params
 */
export const rejectTaskWithFeedback = ({ userTaskId, feedback }) =>
  supabase.rpc('reject_task_with_feedback', {
    p_user_task_id: userTaskId,
    p_feedback: feedback,
  });

