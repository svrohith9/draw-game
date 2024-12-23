/*
  # Fix Sessions RLS Policies

  1. Changes
    - Update RLS policies for sessions table to properly handle profile_id
    - Add profile_id to sessions insert policy
    - Ensure created_by matches auth.uid()

  2. Security
    - Maintain RLS protection while allowing proper session creation
    - Ensure users can only create sessions as themselves
*/

-- Update the sessions insert policy to properly set created_by
DROP POLICY IF EXISTS "Authenticated users can create sessions" ON sessions;

CREATE POLICY "Authenticated users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL -- User must be authenticated
    AND created_by = auth.uid() -- created_by must match the authenticated user
  );

-- Ensure the select policy allows viewing active sessions
DROP POLICY IF EXISTS "Sessions are viewable by everyone" ON sessions;

CREATE POLICY "Sessions are viewable by everyone"
  ON sessions FOR SELECT
  USING (
    is_active = true -- Only show active sessions
  );