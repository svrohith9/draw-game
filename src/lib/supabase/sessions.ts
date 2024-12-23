import { supabase } from './client';
import { getCurrentUser } from './auth';

export async function fetchUserSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createUserSession(name: string) {
  const user = await getCurrentUser();
  
  const { data, error } = await supabase
    .from('sessions')
    .insert([{ 
      name,
      created_by: user.id,
      is_active: true 
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkSessionParticipant(sessionId: string) {
  const user = await getCurrentUser();
  
  const { data } = await supabase
    .from('session_participants')
    .select('id')
    .match({ 
      session_id: sessionId,
      profile_id: user.id 
    });

  return data && data.length > 0;
}

export async function joinUserSession(sessionId: string) {
  const user = await getCurrentUser();
  const isParticipant = await checkSessionParticipant(sessionId);

  if (!isParticipant) {
    const { error } = await supabase
      .from('session_participants')
      .insert([{ 
        session_id: sessionId,
        profile_id: user.id 
      }]);

    if (error && error.code !== '23505') throw error; // Ignore duplicate key errors
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function leaveUserSession(sessionId: string) {
  const user = await getCurrentUser();
  
  const { error } = await supabase
    .from('session_participants')
    .delete()
    .match({ 
      session_id: sessionId,
      profile_id: user.id 
    });

  if (error) throw error;
}