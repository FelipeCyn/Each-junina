import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminClient from "./AdminClient";
import LogoutButton from "@/components/LogoutButton";

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

  const totalsMap: Record<string, number> = {};
  for (const p of allPurchases ?? []) {
    totalsMap[p.buyer_id] = (totalsMap[p.buyer_id] ?? 0) + p.amount;
  }

  const grandTotal = Object.values(totalsMap).reduce((s, v) => s + v, 0);
  const totalParticipantes = (profiles ?? []).filter((p) => p.role === "comprador").length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-black px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">🎪 ADMIN</h1>
          <p className="text-gray-400 text-xs mt-0.5 font-medium">Festa Junina</p>
        </div>
        <LogoutButton className="text-gray-400 hover:text-white text-sm font-bold transition-colors" />
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
        }))}
      />
    </div>
  );
}
