/*
  # Initial Schema Setup for Chat Application

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, linked to auth.users)
      - `username` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sessions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `is_active` (boolean)
    
    - `session_participants`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references sessions)
      - `profile_id` (uuid, references profiles)
      - `joined_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references sessions)
      - `profile_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tables
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE TABLE session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(session_id, profile_id)
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Sessions are viewable by everyone"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Session creators can update their sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = created_by);

-- Session participants policies
CREATE POLICY "Participants are viewable by everyone"
  ON session_participants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join sessions"
  ON session_participants FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can leave sessions"
  ON session_participants FOR DELETE
  USING (auth.uid() = profile_id);

-- Messages policies
CREATE POLICY "Messages are viewable by session participants"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_participants
      WHERE session_participants.session_id = messages.session_id
      AND session_participants.profile_id = auth.uid()
    )
  );

CREATE POLICY "Session participants can insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM session_participants
      WHERE session_participants.session_id = messages.session_id
      AND session_participants.profile_id = auth.uid()
    )
  );