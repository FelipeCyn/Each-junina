"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

export async function getBuyerRaffleInfo(buyerId: string) {
  const session = await getSession();
  if (!session?.profile || session.profile.role !== "vendedor") {
    return { error: "Não autorizado." };
  }

  const supabase = createAdminClient();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("amount")
    .eq("buyer_id", buyerId);

  const { data: tickets } = await supabase
    .from("raffle_tickets")
    .select("id, ticket_number")
    .eq("buyer_id", buyerId);

  const totalSpent = purchases?.reduce((s, p) => s + p.amount, 0) ?? 0;
  const earned = Math.floor(totalSpent / 20);
  const issued = tickets?.length ?? 0;

  return { totalSpent, earned, issued, pending: earned - issued };
}

export async function issueRaffleTicket(buyerId: string) {
  const session = await getSession();
  if (!session?.profile || session.profile.role !== "vendedor") {
    return { error: "Não autorizado." };
  }

  const supabase = createAdminClient();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("amount")
    .eq("buyer_id", buyerId);

  const { data: existingTickets } = await supabase
    .from("raffle_tickets")
    .select("id")
    .eq("buyer_id", buyerId);

  const totalSpent = purchases?.reduce((s, p) => s + p.amount, 0) ?? 0;
  const earned = Math.floor(totalSpent / 20);
  const issued = existingTickets?.length ?? 0;

  if (issued >= earned) {
    return { error: "Comprador não tem saldo suficiente para mais números." };
  }

  const { data: countData } = await supabase
    .from("raffle_tickets")
    .select("id", { count: "exact" });

  const nextNumber = String((countData?.length ?? 0) + 1).padStart(3, "0");

  const { error } = await supabase.from("raffle_tickets").insert({
    buyer_id: buyerId,
    seller_id: session.profile.id,
    ticket_number: nextNumber,
  });

  if (error) return { error: "Erro ao emitir número." };
  return { success: true, ticketNumber: nextNumber };
}

export async function getAllTickets() {
  const session = await getSession();
  if (!session?.isAdmin) return { error: "Não autorizado.", tickets: [] };

  const supabase = createAdminClient();

  const { data } = await supabase
    .from("raffle_tickets")
    .select("id, ticket_number, issued_at, drawn_at, buyer:profiles!raffle_tickets_buyer_id_fkey(name, cpf)")
    .order("ticket_number");

  return { tickets: data ?? [] };
}

export async function drawWinner() {
  const session = await getSession();
  if (!session?.isAdmin) return { error: "Não autorizado." };

  const supabase = createAdminClient();

  const { data: tickets } = await supabase
    .from("raffle_tickets")
    .select("id, ticket_number, buyer:profiles!raffle_tickets_buyer_id_fkey(name)")
    .is("drawn_at", null);

  if (!tickets || tickets.length === 0) {
    return { error: "Todos os números já foram sorteados. Resete o sorteio para recomeçar." };
  }

  const winner = tickets[Math.floor(Math.random() * tickets.length)];

  await supabase
    .from("raffle_tickets")
    .update({ drawn_at: new Date().toISOString() })
    .eq("id", winner.id);

  return {
    winner: {
      id: winner.id,
      ticketNumber: winner.ticket_number,
      name: (winner.buyer as unknown as { name: string }).name,
    },
  };
}

export async function resetDraw() {
  const session = await getSession();
  if (!session?.isAdmin) return { error: "Não autorizado." };

  const supabase = createAdminClient();

  await supabase
    .from("raffle_tickets")
    .update({ drawn_at: null })
    .not("id", "is", null);

  return { success: true };
}
