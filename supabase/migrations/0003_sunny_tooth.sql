/*
  # Fix Sessions RLS Policies - Final Update

  1. Changes
    - Update RLS policies for sessions table
    - Fix session participant policies
    - Ensure proper authentication checks

  2. Security
    - Maintain RLS protection while allowing proper access
    - Ensure users can only interact with their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can create sessions" ON sessions;
DROP POLICY IF EXISTS "Sessions are viewable by everyone" ON sessions;

-- Create new policies for sessions
CREATE POLICY "Anyone can view active sessions"
  ON sessions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND created_by = auth.uid()
  );

-- Update session participants policies
DROP POLICY IF EXISTS "Participants are viewable by everyone" ON session_participants;
DROP POLICY IF EXISTS "Authenticated users can join sessions" ON session_participants;

CREATE POLICY "Session participants are viewable by participants"
  ON session_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = session_participants.session_id
      AND sp.profile_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join active sessions"
  ON session_participants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id
      AND s.is_active = true
    )
  );