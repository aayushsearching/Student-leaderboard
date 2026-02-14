import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from './pages/LoginPage';
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
  signInWithPassword: jest.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.getCurrentSession.mockResolvedValue(null);
  });

  it('validates email format before calling login', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Please enter a valid email')).toBeInTheDocument();
    expect(authService.signInWithPassword).not.toHaveBeenCalled();
  });

  it('shows invalid credentials message from Supabase errors', async () => {
    authService.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('ID or password is incorrect')).toBeInTheDocument();
  });
});
