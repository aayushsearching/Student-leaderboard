import { supabase } from './supabaseClient';

/**
 * Fetch the current auth session from Supabase.
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 */
export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

/**
 * Subscribe to auth state changes.
 * @param {(event: string, session: import('@supabase/supabase-js').Session | null) => void} callback
 * @returns {{ unsubscribe: () => void }}
 */
export const subscribeToAuthStateChanges = (callback) => {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
};

/**
 * Sign in with email/password.
 * @param {{ email: string, password: string }} credentials
 */
export const signInWithPassword = (credentials) =>
  supabase.auth.signInWithPassword(credentials);

/**
 * Sign up with email/password.
 * @param {{ email: string, password: string }} credentials
 */
export const signUpWithPassword = (credentials) =>
  supabase.auth.signUp(credentials);

/**
 * Sign out the current user.
 */
export const signOut = () => supabase.auth.signOut();

/**
 * Update authenticated user metadata.
 * @param {{ data: Record<string, unknown> }} updates
 */
export const updateAuthUser = (updates) => supabase.auth.updateUser(updates);

