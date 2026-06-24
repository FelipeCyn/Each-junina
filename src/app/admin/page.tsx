import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminClient from "./AdminClient";
import LogoutButton from "@/components/LogoutButton";
import RefreshButton from "@/components/RefreshButton";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/admin/login");

  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, cpf, role, created_at")
    .order("name");

  const { data: allPurchases } = await supabase
    .from("purchases")
    .select("buyer_id, amount");

  const { data: allTickets } = await supabase
    .from("raffle_tickets")
    .select("buyer_id, ticket_number")
    .order("ticket_number");

  const totalsMap: Record<string, number> = {};
  for (const p of allPurchases ?? []) {
    totalsMap[p.buyer_id] = (totalsMap[p.buyer_id] ?? 0) + p.amount;
  }

  const ticketsMap: Record<string, string[]> = {};
  for (const t of allTickets ?? []) {
    if (!ticketsMap[t.buyer_id]) ticketsMap[t.buyer_id] = [];
    ticketsMap[t.buyer_id].push(t.ticket_number);
  }

  const grandTotal = Object.values(totalsMap).reduce((s, v) => s + v, 0);
  const totalParticipantes = (profiles ?? []).filter((p) => p.role === "comprador").length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-black px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">🎪 ADMIN</h1>
          <p className="text-gray-400 text-xs mt-0.5 font-medium">Each Copa</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <a
            href="/admin/sorteio"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm px-3 py-2 rounded-xl transition-colors"
          >
            🎟️ Sorteio
          </a>
          <LogoutButton className="text-gray-400 hover:text-white text-sm font-bold transition-colors" />
        </div>
      </header>

      <div className="bg-yellow-400 px-4 py-4 flex gap-4">
        <div className="flex-1 bg-white rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-bold uppercase">Total arrecadado</p>
          <p className="text-xl font-black text-red-600 mt-0.5">
            R$ {grandTotal.toFixed(2).replace(".", ",")}
          </p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-bold uppercase">Participantes</p>
          <p className="text-xl font-black text-black mt-0.5">{totalParticipantes}</p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 font-bold uppercase">Aguardando</p>
          <p className="text-xl font-black text-black mt-0.5">
            {(profiles ?? []).filter((p) => p.role === "pending").length}
          </p>
        </div>
      </div>

      <AdminClient
        initialProfiles={(profiles ?? []).map((p) => ({
          ...p,
          total: totalsMap[p.id] ?? 0,
          tickets: ticketsMap[p.id] ?? [],
        }))}
      />
    </div>
  );
}
