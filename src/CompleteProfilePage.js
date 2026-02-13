import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './CompleteProfilePage.css'; // Assuming a new CSS file for styling

function CompleteProfilePage({ user, profile, profileComplete, onProfileUpdate }) {
  const [fullName, setFullName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // If profile data is already available and complete, redirect
    if (profileComplete === true) {
      navigate('/dashboard');
      return; // Ensure to return after navigation to prevent further execution
    }

    // Pre-fill form if profile data exists
    if (profile) {
      setFullName(profile.full_name || '');
      setAcademicYear(profile.academic_year || '');
      setBranch(profile.branch || '');
    }
  }, [user, navigate, profile, profileComplete]); // Added onProfileUpdate to dependency array

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!fullName || !academicYear || !branch) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        academic_year: academicYear,
        branch: branch,
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updates);

      if (updateError) {
        console.error("Profile update failed:", updateError);
        throw updateError;
      }

      setSuccess('Profile updated successfully!');

      // Re-fetch the updated profile to ensure we have the latest state
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*') // Select all fields
        .eq('id', user.id)
        .single(); // Use single() here as we expect the profile to exist now

      if (fetchError) {
        console.error("Error re-fetching profile after update:", fetchError.message); // Log error.message
        setError('Profile updated, but failed to re-verify. Please refresh.');
        setLoading(false);
        return;
      }

      // Only redirect to dashboard if the newly fetched profile is complete (non-null and non-empty)
      if (updatedProfile &&
          updatedProfile.full_name && updatedProfile.full_name.trim() !== '' &&
          updatedProfile.academic_year && updatedProfile.academic_year.trim() !== '' &&
          updatedProfile.branch && updatedProfile.branch.trim() !== '') {
        navigate('/dashboard');
      } else {
        setError('Profile updated, but still incomplete. Please fill in all fields.');
      }
    } catch (err) {
      console.error('Error updating profile:', err.message);
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [fullName, academicYear, branch, user, navigate]); // Removed onProfileUpdate from dependency array

  if (!user || profileComplete === true) {
    // Should be redirected by useEffect, but handle defensively
    return null;
  }

  return (
    <div className="complete-profile-page-container">
      <div className="complete-profile-form-card">
        <h2>Complete Your Profile</h2>
        <p className="profile-subtitle">Please provide the following details to access the dashboard.</p>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="academicYear">Academic Year</label>
            <select
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select Year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="branch">Branch/Major</label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="save-profile-button" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfilePage;
