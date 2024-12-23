import { supabase } from "./client";
import { getCurrentUser } from "./auth";

export async function fetchSessionMessages(sessionId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      profiles (
        username
      )
    `
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendSessionMessage(content: string, sessionId: string) {
  const user = await getCurrentUser();

  const { error } = await supabase.from("messages").insert([
    {
      content,
      session_id: sessionId,
      profile_id: user.id,
    },
  ]);

  if (error) throw error;
}
