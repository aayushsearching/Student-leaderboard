import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import './PointSystemPage.css';

function PointSystemPage({ user }) {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPendingTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Using the exact query structure as requested
    const { data, error: fetchError } = await supabase
      .from('user_tasks')
      .select(`
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
      `)
      .eq('status', 'pending_review')
      .order('submitted_at', { ascending: true });

    if (fetchError) {
      setError('Failed to fetch tasks for approval: ' + fetchError.message);
    } else {
      setPendingTasks(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // This page is protected by ProtectedRoute, so we can assume the user is an admin.
    fetchPendingTasks();
  }, [fetchPendingTasks]);

  const handleApprove = async (userTask) => {
    setLoading(true);
    
    const { error: rpcError } = await supabase.rpc('approve_task_and_update_score', {
      p_user_task_id: userTask.id, // This is the ID of the row in user_tasks
      p_user_id: userTask.user_id, // The ID of the user who submitted it
      p_points_to_add: userTask.tasks.points // The points from the joined tasks table
    });

    if (rpcError) {
      setError('Failed to approve task: ' + rpcError.message);
    } else {
      setSuccess(`Task "${userTask.tasks.title}" approved for ${userTask.profiles.full_name}.`);
      await fetchPendingTasks(); // Refresh the list
    }
    setLoading(false);
  };

  const handleReject = async (userTask) => {
    const reason = window.prompt('Please provide a reason for rejecting this task:');
    if (reason) {
      setLoading(true);
      const { error: rpcError } = await supabase.rpc('reject_task_with_feedback', {
        p_user_task_id: userTask.id,
        p_feedback: reason
      });

      if (rpcError) {
        setError('Failed to reject task: ' + rpcError.message);
      } else {
        setSuccess(`Task "${userTask.tasks.title}" rejected for ${userTask.profiles.full_name}.`);
        await fetchPendingTasks(); // Refresh the list
      }
      setLoading(false);
    }
  };

  return (
    <div className="point-system-container">
      <div className="admin-header">
        <h1>Points Approval System</h1>
        <p>Review and award points for completed tasks.</p>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <div className="admin-card">
        <h3>Tasks Pending Approval</h3>
        {loading && <p>Loading tasks...</p>}
        {!loading && pendingTasks.length === 0 && <p>No tasks are currently pending approval.</p>}
        
        <div className="task-approval-list">
          {pendingTasks.map(userTask => (
            <div key={userTask.id} className="approval-card">
              <div className="card-header">
                {/* Use nested data: userTask.tasks.title */}
                <h4>{userTask.tasks?.title || 'Unknown Task'}</h4>
                <span className="points-badge">
                  {userTask.tasks?.points || 0} Points
                </span>
              </div>
              <p className="user-info">
                Submitted by: <strong>{userTask.profiles?.full_name || 'Unknown User'}</strong>
                {userTask.profiles?.email && ` (${userTask.profiles.email})`}
              </p>
              {userTask.submission_url && <p><a href={userTask.submission_url} target="_blank" rel="noopener noreferrer">View Submission URL</a></p>}
              <p className="submission-time">
                Submitted: {userTask.submitted_at ? new Date(userTask.submitted_at).toLocaleString() : 'N/A'}
              </p>
              <div className="card-actions">
                <button onClick={() => handleApprove(userTask)} className="approve-btn" disabled={loading}>Approve</button>
                <button onClick={() => handleReject(userTask)} className="reject-btn" disabled={loading}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PointSystemPage;
