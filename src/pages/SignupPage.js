import React, { useState, useEffect } from 'react';
import './SignupPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentSession, signUpWithPassword } from '../services/authService';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // ✅ Strong password validator
  const validatePassword = (password) => {
    const minLength = password.length >= 10;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

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

    if (isSubmitting) return;

    setErrorMessage('');
    setSuccessMessage('');

    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    // ✅ Enforce strong password
    if (!validatePassword(password)) {
      setErrorMessage(
        "Password must be at least 10 characters and include uppercase, lowercase, number and special character."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      const { error } = await signUpWithPassword({ email, password });
      if (error) throw error;

      setSuccessMessage('Success! Please check your email for a confirmation link.');
    } catch (error) {
      if (error.name === 'AbortError') return;

      console.log('Supabase signup error:', error);

      if (
        error.message.includes('User already registered') ||
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        setErrorMessage('User already existed, please log in');
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
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

          <button type="submit" className="login-button" disabled={loading || isSubmitting}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/login">Already have an account? Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;