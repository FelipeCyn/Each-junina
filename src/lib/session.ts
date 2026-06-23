import { cookies } from "next/headers";
import { createAdminClient } from "./supabase/admin";

export type SessionProfile = {
  id: string;
  name: string;
  cpf: string;
  role: string;
};

export type Session = {
  token: string;
  isAdmin: boolean;
  profile?: SessionProfile;
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sessions")
    .select("token, is_admin, profile_id, profiles:profile_id(id, name, cpf, role)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!data) return null;

  return {
    token: data.token,
    isAdmin: data.is_admin,
    profile: data.profiles as unknown as SessionProfile | undefined,
  };
}
