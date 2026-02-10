import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed as it's not used
import { supabase } from './supabaseClient';
import './AdminPage.css';

function AdminPage() { // Removed user prop
  // const navigate = useNavigate(); // Removed as it's not used
  const [templateTasks, setTemplateTasks] = useState([]);
  // const [allProfiles, setAllProfiles] = useState([]); // Removed as it's not used
  
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(10);
  const [dueDate, setDueDate] = useState('');
  const [tasksUrl, setTasksUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for custom notifications
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState('');

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (fetchError) setError('Failed to fetch task templates: ' + fetchError.message);
    else setTemplateTasks(data);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);
  
  const clearForm = useCallback(() => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPoints(10);
    setDueDate('');
    setTasksUrl('');
  }, []);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setFormLoading(true);
    const taskData = { title, description, points, due_date: dueDate, tasks_url: tasksUrl };
    let response;
    if (editingTask) {
      response = await supabase.from('tasks').update(taskData).eq('id', editingTask.id);
    } else {
      if (!title || !description || !points) {
        setError('Please fill out all required fields.');
        setFormLoading(false);
        return;
      }
      response = await supabase.from('tasks').insert([taskData]);
    }
    if (response.error) setError(`Failed to ${editingTask ? 'update' : 'create'} template: ${response.error.message}`);
    else {
      setSuccess(`Task template ${editingTask ? 'updated' : 'created'} successfully!`);
      clearForm();
      await fetchAdminData();
    }
    setFormLoading(false);
  }, [editingTask, title, description, points, dueDate, tasksUrl, clearForm, fetchAdminData]);

  const handleEditClick = useCallback((task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPoints(task.points);
    const formattedDueDate = task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '';
    setDueDate(formattedDueDate);
    setTasksUrl(task.tasks_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteClick = useCallback(async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task template?')) {
      setLoading(true);
      const { error: deleteError } = await supabase.from('tasks').delete().eq('id', taskId);
      if (deleteError) setError('Failed to delete template: ' + deleteError.message);
      else {
        setSuccess('Task template deleted successfully!');
        await fetchAdminData();
      }
      setLoading(false);
    }
  }, [fetchAdminData]);

  // Handle sending custom admin notifications
  const handleSendNotification = useCallback(async (e) => {
    e.preventDefault();
    setNotificationError('');
    setNotificationSuccess('');
    setSendingNotification(true);

    if (!notificationTitle || !notificationMessage) {
      setNotificationError('Title and Message cannot be empty.');
      setSendingNotification(false);
      return;
    }

    try {
      const { error: rpcError } = await supabase.rpc('send_admin_notification', {
        p_title: notificationTitle,
        p_message: notificationMessage
      });

      if (rpcError) {
        setNotificationError('Failed to send notification: ' + rpcError.message);
      } else {
        setNotificationSuccess('Notification sent successfully to all normal users!');
        setNotificationTitle('');
        setNotificationMessage('');
      }
    } catch (err) {
      setNotificationError('An unexpected error occurred: ' + err.message);
    } finally {
      setSendingNotification(false);
    }
  }, [notificationTitle, notificationMessage]);

  if (loading) return <p>Loading Admin Dashboard...</p>;
  
  return (
    <div className="admin-grid-layout">
      <div className="admin-card task-list-panel">
        <h3>Task Templates</h3>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <div className="task-list-container">
          <table className="tasks-table">
            <thead><tr><th>Title</th><th>Points</th><th>Actions</th></tr></thead>
            <tbody>
              {templateTasks.length > 0 ? templateTasks.map(task => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.points}</td>
                  <td className="task-actions">
                    <button className="edit-btn" onClick={() => handleEditClick(task)} disabled={formLoading}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteClick(task.id)} disabled={formLoading}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="3" style={{ textAlign: 'center' }}>No task templates found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card form-panel">
        <h3>{editingTask ? 'Edit Template' : 'Create Task Template'}</h3>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group"><label htmlFor="title">Task Title</label><input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div className="form-group"><label htmlFor="description">Task Description</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
          <div className="form-row">
            <div className="form-group"><label htmlFor="points">Points</label><input type="number" id="points" value={points} onChange={(e) => setPoints(Number(e.target.value))} min="0" required /></div>
            <div className="form-group"><label htmlFor="dueDate">Due Date (Optional)</label><input type="datetime-local" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>
          <div className="form-group"><label htmlFor="tasksUrl">Task URL (Optional)</label><input type="url" id="tasksUrl" value={tasksUrl} onChange={(e) => setTasksUrl(e.target.value)} /></div>
          <button type="submit" className="admin-submit-button" disabled={formLoading}>{formLoading ? (editingTask ? 'Updating...' : 'Creating...') : (editingTask ? 'Update Template' : 'Create Template')}</button>
          {editingTask && <button type="button" className="cancel-edit-button" onClick={clearForm} disabled={formLoading}>Cancel Edit</button>}
        </form>

        {/* Custom Notification Section */}
        <div className="admin-card">
          <h3>Send Custom Notification</h3>
          <form onSubmit={handleSendNotification}>
            <div className="form-group">
              <label htmlFor="notificationTitle">Notification Title</label>
              <input type="text" id="notificationTitle" value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="notificationMessage">Notification Message</label>
              <textarea id="notificationMessage" value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} required />
            </div>
            <button type="submit" className="admin-submit-button" disabled={sendingNotification}>
              {sendingNotification ? 'Sending...' : 'Send Announcement'}
            </button>
            {notificationError && <p className="error-message">{notificationError}</p>}
            {notificationSuccess && <p className="success-message">{notificationSuccess}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;