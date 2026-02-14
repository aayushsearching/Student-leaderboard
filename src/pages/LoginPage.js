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
      <div className="login-form-card">
        <h2>Welcome Back!</h2>
        <p className="login-subtitle">Sign in to your MentorFlow account</p>
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