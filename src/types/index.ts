export interface Profile {
  id: string;
  username: string;
}

export interface Session {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface Message {
  id: string;
  content: string;
  profile_id: string;
  session_id: string;
  created_at: string;
  profiles: {
    username: string;
  };
}