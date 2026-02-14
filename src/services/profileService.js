import { supabase } from './supabaseClient';

export const PROFILE_FIELDS = 'full_name, academic_year, branch, role';

/**
 * Fetch a profile by user id.
 * @param {string} userId
 */
export const fetchProfileById = (userId) =>
  supabase.from('profiles').select(PROFILE_FIELDS).eq('id', userId).maybeSingle();

/**
 * Fetch a full profile row by user id.
 * @param {string} userId
 */
export const fetchFullProfileById = (userId) =>
  supabase.from('profiles').select('*').eq('id', userId).single();

/**
 * Fetch only role for authorization checks.
 * @param {string} userId
 */
export const fetchProfileRoleByUserId = (userId) =>
  supabase.from('profiles').select('role').eq('id', userId).single();

/**
 * Upsert a user profile.
 * @param {{ id: string, full_name: string, academic_year: string, branch: string }} profile
 */
export const upsertProfile = (profile) =>
  supabase.from('profiles').upsert(profile);

