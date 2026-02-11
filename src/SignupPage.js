import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './SignupPage.css';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        // Insert user into leaderboard with initial score
        const { error: leaderboardError } = await supabase
          .from('leaderboard')
          .insert([
            { user_id: data.user.id, score: 0, rank: 0, badge_tier: 'novice', badge_division: 1 }
          ]);

        if (leaderboardError) {
          throw leaderboardError; // Throw the error so it's caught by the outer catch block
        } else {
          console.log('User successfully added to leaderboard.');
        }
      }

      setSuccessMessage('Success! Please check your email for a confirmation link.');
    } catch (error) {
      if (error.name === 'AbortError') return; // Silently ignore AbortError
      console.log('Supabase signup error:', error); // Log the full error object for debugging
      // Check for specific error message indicating user already exists
      if (error.message.includes('User already registered') || error.message.includes('duplicate key value violates unique constraint')) {
        setErrorMessage('User already existed, please log in');
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2>Join MentorFlow!</h2>
        <p className="login-subtitle">Create your account to get started</p>
        <form onSubmit={handleSubmit}>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
              className={emailError ? 'input-error' : ''}
              disabled={loading}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="login-footer">
          <a href="/login">Already have an account? Log In</a>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
