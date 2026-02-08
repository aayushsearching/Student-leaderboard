import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { supabase } from './supabaseClient';
import './TasksPage.css';

function TasksPage({ user }) { // Accept user prop
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if no user
      return;
    }
    fetchTasks();
  }, [user, navigate]); // Depend on user and navigate

  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);

      // const { data: { session }, error: sessionError } = await supabase.auth.getSession(); // No longer needed
      // if (sessionError) throw sessionError;

      if (!user) { // Use the user prop directly
        setError('User not logged in.'); // This case should be handled by the useEffect above
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id) // Use user.id from prop
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;

      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tasks-page-container">
      <div className="tasks-header">
        <h2>My Tasks</h2>
        <p className="muted-text">Overview of your assigned tasks</p>
      </div>

      {loading && <p className="loading-message">Loading tasks...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="tasks-grid">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="task-card">
                <h4>Task: {task.title}</h4>
                <p className="muted-text">{task.description}</p>
                <div className="task-details">
                  <span>Status: {task.status}</span>
                  {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                  <span>Points: {task.points}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="muted-text" style={{textAlign: 'center', gridColumn: '1 / -1'}}>No tasks assigned yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TasksPage;
