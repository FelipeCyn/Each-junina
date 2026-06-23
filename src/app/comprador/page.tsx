import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import Header from "@/components/Header";

export default async function CompradorPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.isAdmin) redirect("/admin");
  if (session.profile?.role !== "comprador") redirect("/aguardando");

  const supabase = createAdminClient();
  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, amount, description, created_at, seller:profiles!purchases_seller_id_fkey(name)")
    .eq("buyer_id", session.profile!.id)
    .order("created_at", { ascending: false });

  const total = purchases?.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="MEU EXTRATO" subtitle={session.profile?.name} />

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="bg-yellow-400 rounded-2xl p-5 mb-6">
          <p className="text-yellow-900 text-sm font-bold mb-1">TOTAL GASTO</p>
          <p className="text-4xl font-black text-black">
            R$ {total.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-yellow-800 text-xs mt-1 font-medium">
            {purchases?.length ?? 0} compra(s) registrada(s)
          </p>
        </div>

        <h2 className="font-black text-black mb-3 text-sm uppercase tracking-wide">
          Histórico
        </h2>

        {!purchases || purchases.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <div className="text-4xl mb-3">🛒</div>
            <p className="font-medium">Nenhuma compra registrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black truncate text-sm">
                    {purchase.description || "Compra"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    {(purchase.seller as { name?: string })?.name ?? "Vendedor"} •{" "}
                    {new Date(purchase.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="font-black text-red-600 ml-3 shrink-0">
                  R$ {purchase.amount.toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
