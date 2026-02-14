import {
  getCurrentSession,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  subscribeToAuthStateChanges,
  updateAuthUser,
} from './authService';
import { supabase } from './supabaseClient';

jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets current session', async () => {
    const session = { user: { id: 'u1' } };
    supabase.auth.getSession.mockResolvedValue({ data: { session } });
    await expect(getCurrentSession()).resolves.toEqual(session);
  });

  it('forwards auth actions to supabase auth api', async () => {
    const credentials = { email: 'a@b.com', password: 'pass' };
    await signInWithPassword(credentials);
    await signUpWithPassword(credentials);
    await signOut();
    await updateAuthUser({ data: { full_name: 'User' } });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
    expect(supabase.auth.signUp).toHaveBeenCalledWith(credentials);
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ data: { full_name: 'User' } });
  });

  it('subscribes to auth state changes', () => {
    const callback = jest.fn();
    const subscription = { unsubscribe: jest.fn() };
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription } });

    const result = subscribeToAuthStateChanges(callback);
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
    expect(result).toBe(subscription);
  });
});

