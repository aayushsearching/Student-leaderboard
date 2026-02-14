import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginPage.css';
import { getCurrentSession, signInWithPassword } from '../services/authService';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const checkSession = async () => {
      const session = await getCurrentSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');

    try {
      setLoading(true);
      const { error } = await signInWithPassword({ email, password });
      if (error) {
        // Supabase often returns a specific message for invalid credentials
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid email or password')) {
          setErrorMessage('ID or password is incorrect');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }
      // Logged in successfully, redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      if (error.name === 'AbortError') return; // Silently ignore AbortError
      console.log('Supabase login error:', error); // Log the full error object for debugging
      setErrorMessage(error.message || 'Login failed. Please try again.');
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
        <h2>Welcome Back!</h2>
        <p className="login-subtitle">Sign in to your MentorFlow account</p>
        <form onSubmit={handleSubmit}>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
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
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="login-footer">
          <a href="#forgot-password">Forgot Password?</a>
          <span> | </span>
          <Link to="/signup">Don't have an account? Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;


