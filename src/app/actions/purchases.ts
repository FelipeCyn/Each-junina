"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

export async function createPurchase(
  buyerId: string,
  amount: number,
  description: string
) {
  const session = await getSession();
  if (!session?.profile || session.profile.role !== "vendedor") {
    return { error: "Não autorizado." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("purchases").insert({
    buyer_id: buyerId,
    seller_id: session.profile.id,
    amount,
    description: description.trim() || null,
  });

  if (error) return { error: "Erro ao registrar gasto." };
  return { success: true };
}
