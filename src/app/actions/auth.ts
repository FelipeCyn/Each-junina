"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateCPF, cleanCPF } from "@/lib/cpf";
import crypto from "crypto";

const SESSION_DAYS = 7;

async function createSessionToken(profileId: string | null, isAdmin: boolean) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const supabase = createAdminClient();

  await supabase.from("sessions").insert({
    profile_id: profileId,
    token,
    is_admin: isAdmin,
    expires_at: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
    sameSite: "lax",
  });
}

export async function registerUser(name: string, cpf: string) {
  const cleanedCPF = cleanCPF(cpf);

  if (!validateCPF(cleanedCPF)) {
    return { error: "CPF inválido." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 3) {
    return { error: "Nome muito curto." };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("cpf", cleanedCPF)
    .maybeSingle();

  let profileId: string;
  let role: string;

  if (existing) {
    profileId = existing.id;
    role = existing.role;
  } else {
    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert({ name: trimmedName, cpf: cleanedCPF, role: "comprador" })
      .select("id")
      .maybeSingle();

    if (error || !newProfile) {
      // CPF foi inserido por outra requisição simultânea — busca o existente
      const { data: raceProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("cpf", cleanedCPF)
        .maybeSingle();

      if (!raceProfile) return { error: "Erro ao cadastrar. Tente novamente." };
      profileId = raceProfile.id;
      role = raceProfile.role;
    } else {
      profileId = newProfile.id;
      role = "comprador";
    }
  }

  await createSessionToken(profileId, false);
  return { role };
}

export async function adminLogin(username: string, cpf: string) {
  const cleanedCPF = cleanCPF(cpf);
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedCPF = process.env.ADMIN_CPF;

  if (username.trim() !== expectedUser || cleanedCPF !== expectedCPF) {
    return { error: "Credenciais inválidas." };
  }

  await createSessionToken(null, true);
  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    const supabase = createAdminClient();
    await supabase.from("sessions").delete().eq("token", token);
    cookieStore.delete("session_token");
  }
}
