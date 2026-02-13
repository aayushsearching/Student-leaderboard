import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { supabase } from './supabaseClient'; // Import Supabase client
import './ProfilePage.css';

function ProfilePage({ user }) { // Accept user prop
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [branch, setBranch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect to login if no user
      return;
    }
    setLoading(true);
    setFullName(user.user_metadata?.full_name || '');
    setAcademicYear(user.user_metadata?.academic_year || '');
    setBranch(user.user_metadata?.branch || '');
    setLoading(false);
  }, [user, navigate]);

  const updateProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (user) {
        const updates = {
          data: {
            full_name: fullName,
            academic_year: academicYear,
            branch: branch,
          },
        };

        const { error: updateUserError } = await supabase.auth.updateUser(updates);

        if (updateUserError) throw updateUserError;

        setSuccess('Profile updated successfully!');
      } else {
        setError('No active session. Please log in.');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error updating profile:', err.message);
      setError('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user, fullName, academicYear, branch]);

  return (
    <div className="profile-page-container">
      <div className="profile-form-card">
        <h2>Your Profile</h2>
        <p className="profile-subtitle">Manage your personal information</p>

        {loading ? (
          <p>Loading profile...</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile();
            }}
          >
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                maxLength={50} // Limit full name to 50 characters
              />
            </div>

            <div className="form-group">
              <label htmlFor="academicYear">Academic Year</label>
              <input
                type="text"
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                disabled={loading}
                maxLength={10} // Limit academic year to 10 characters (e.g., "2023-2024")
              />
            </div>

            <div className="form-group">
              <label htmlFor="branch">Branch/Major</label>
              <input
                type="text"
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={loading}
                maxLength={50} // Limit branch/major to 50 characters
              />
            </div>

            <button type="submit" className="save-profile-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
