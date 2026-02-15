import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { getCurrentSession, signInWithPassword } from '../services/authService';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutes

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockoutMessage, setLockoutMessage] = useState('');
  const navigate = useNavigate();

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
    setLockoutMessage('');

    const now = Date.now();
    const lockData = JSON.parse(localStorage.getItem('login_lock') || '{}');

    // Check if locked
    if (lockData.lockUntil && now < lockData.lockUntil) {
      const remaining = Math.ceil((lockData.lockUntil - now) / 1000);
      setLockoutMessage(`Too many failed attempts. Try again in ${remaining} seconds.`);
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');

    try {
      setLoading(true);

      const { error } = await signInWithPassword({ email, password });

      if (error) {
        let attempts = lockData.attempts || 0;
        attempts++;

        if (attempts >= MAX_ATTEMPTS) {
          const lockUntil = now + LOCK_TIME_MS;
          localStorage.setItem(
            'login_lock',
            JSON.stringify({ attempts: 0, lockUntil })
          );
          setLockoutMessage('Too many failed attempts. Account temporarily locked.');
        } else {
          localStorage.setItem(
            'login_lock',
            JSON.stringify({ attempts, lockUntil: null })
          );
          setErrorMessage('ID or password is incorrect');
        }

        return;
      }

      // Success → reset lock
      localStorage.removeItem('login_lock');
      navigate('/dashboard');

    } catch (error) {
      if (error.name === 'AbortError') return;
      setErrorMessage('Login failed. Please try again.');
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
      <Link to="/signup" className="top-action-button">Get Started</Link>

      <div className="login-header">
        <div className="login-logo">MentorFlow</div>
      </div>

      <div className="login-form-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Enter your details below</p>
        <form onSubmit={handleSubmit}>
          {lockoutMessage && <p className="error-message">{lockoutMessage}</p>}
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
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="forgot-password">
          <a href="#forgot-password">Forgot your password?</a>
        </div>

        <div className="login-footer">
          <Link to="/signup">Don't have an account? Sign Up</Link>
        </div>

        <div className="divider-section">
          <div className="divider-line"></div>
          <span className="divider-text">or continue with</span>
          <div className="divider-line"></div>
        </div>

        <div className="social-login-container">
          <button type="button" className="social-button" onClick={() => alert('Google login not implemented')}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button" className="social-button" onClick={() => alert('Phone login not implemented')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Phone</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;