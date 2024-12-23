/*
  # Fix Session Participants Policies

  1. Changes
    - Simplify session participants policies to avoid recursion
    - Update view and insert policies for better security

  2. Security
    - Maintain RLS protection while fixing infinite recursion
    - Ensure proper access control for participants
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Session participants are viewable by participants" ON session_participants;
DROP POLICY IF EXISTS "Authenticated users can join active sessions" ON session_participants;

-- Create simplified policies
CREATE POLICY "View session participants"
  ON session_participants FOR SELECT
  USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id
      AND (s.created_by = auth.uid() OR s.is_active = true)
    )
  );

CREATE POLICY "Join active sessions"
  ON session_participants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    profile_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id
      AND s.is_active = true
    )
  );