import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SignupPage from './pages/SignupPage';
import * as authService from './services/authService';

const mockNavigate = jest.fn();

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => mockNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  }),
  { virtual: true }
);

jest.mock('./services/authService', () => ({
  getCurrentSession: jest.fn(),
  signUpWithPassword: jest.fn(),
}));

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.getCurrentSession.mockResolvedValue(null);
  });

  it('stops submit when passwords do not match', async () => {
    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Passwords do not match!')).toBeInTheDocument();
    expect(authService.signUpWithPassword).not.toHaveBeenCalled();
  });

  it('shows success message when signup succeeds', async () => {
    authService.signUpWithPassword.mockResolvedValue({ error: null });

    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Success! Please check your email for a confirmation link.')).toBeInTheDocument();
  });
});
