"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { cleanCPF } from "@/lib/cpf";

export async function searchBuyers(query: string) {
  const session = await getSession();
  if (!session?.profile || session.profile.role !== "vendedor") {
    return { error: "Não autorizado.", results: [] };
  }

  const supabase = createAdminClient();
  const cleanedQuery = query.trim();
  const isCPF = /^\d+$/.test(cleanCPF(cleanedQuery)) && cleanCPF(cleanedQuery).length >= 4;

  let dbQuery = supabase
    .from("profiles")
    .select("id, name, cpf")
    .in("role", ["comprador", "vendedor"])
    .limit(10);

  if (isCPF) {
    dbQuery = dbQuery.ilike("cpf", `%${cleanCPF(cleanedQuery)}%`);
  } else {
    dbQuery = dbQuery.ilike("name", `%${cleanedQuery}%`);
  }

  const { data } = await dbQuery;
  return { results: data ?? [] };
}

export async function searchAllUsers(query: string) {
  const session = await getSession();
  if (!session?.isAdmin) return { error: "Não autorizado.", results: [] };

  const supabase = createAdminClient();
  const cleanedQuery = query.trim();

  let dbQuery = supabase
    .from("profiles")
    .select("id, name, cpf, role, created_at")
    .order("name");

  if (cleanedQuery) {
    const isCPF = /^\d/.test(cleanCPF(cleanedQuery));
    if (isCPF) {
      dbQuery = dbQuery.ilike("cpf", `%${cleanCPF(cleanedQuery)}%`);
    } else {
      dbQuery = dbQuery.ilike("name", `%${cleanedQuery}%`);
    }
  }

  const { data } = await dbQuery;
  return { results: data ?? [] };
}

export async function deleteUser(userId: string) {
  const session = await getSession();
  if (!session?.isAdmin) return { error: "Não autorizado." };

  const supabase = createAdminClient();

  await supabase.from("raffle_tickets").delete().eq("buyer_id", userId);
  await supabase.from("purchases").delete().eq("buyer_id", userId);
  await supabase.from("sessions").delete().eq("profile_id", userId);
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) return { error: "Erro ao excluir usuário." };
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  const session = await getSession();
  if (!session?.isAdmin) return { error: "Não autorizado." };

  if (!["comprador", "vendedor", "pending"].includes(role)) {
    return { error: "Papel inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: "Erro ao atualizar." };
  return { success: true };
}
