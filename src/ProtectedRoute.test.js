import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import * as profileService from './services/profileService';

jest.mock(
  'react-router-dom',
  () => ({
    Navigate: ({ to }) => <div>{`Redirected to ${to}`}</div>,
  }),
  { virtual: true }
);

jest.mock('./services/profileService', () => ({
  fetchProfileRoleByUserId: jest.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects unauthenticated users to login', async () => {
    render(
      <ProtectedRoute
        user={null}
        appLoading={false}
        profile={null}
        profileComplete={true}
        requiredRole="admin"
      >
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(await screen.findByText('Redirected to /login')).toBeInTheDocument();
  });

  it('redirects users with incomplete profile', async () => {
    render(
      <ProtectedRoute
        user={{ id: 'u1' }}
        appLoading={false}
        profile={null}
        profileComplete={false}
        requiredRole="admin"
      >
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(await screen.findByText('Redirected to /complete-profile')).toBeInTheDocument();
  });

  it('renders protected content when profile role matches', async () => {
    render(
      <ProtectedRoute
        user={{ id: 'u1' }}
        appLoading={false}
        profile={{ role: 'admin' }}
        profileComplete={true}
        requiredRole="admin"
      >
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(await screen.findByText('Admin Content')).toBeInTheDocument();
    expect(profileService.fetchProfileRoleByUserId).not.toHaveBeenCalled();
  });

  it('redirects to dashboard when fetched role does not match', async () => {
    profileService.fetchProfileRoleByUserId.mockResolvedValue({
      data: { role: 'student' },
      error: null,
    });

    render(
      <ProtectedRoute
        user={{ id: 'u1' }}
        appLoading={false}
        profile={null}
        profileComplete={true}
        requiredRole="admin"
      >
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Redirected to /dashboard')).toBeInTheDocument();
    });
  });
});
