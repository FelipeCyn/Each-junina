import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import Header from "@/components/Header";
import RaffleCard from "@/components/RaffleCard";

export default async function CompradorPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.isAdmin) redirect("/admin");
  if (session.profile?.role !== "comprador") redirect("/aguardando");

  const supabase = createAdminClient();
  const buyerId = session.profile!.id;

  const [purchasesRes, ticketsRes] = await Promise.all([
    supabase
      .from("purchases")
      .select("id, amount, description, created_at, seller:profiles!purchases_seller_id_fkey(name)")
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("raffle_tickets")
      .select("id, ticket_number, issued_at")
      .eq("buyer_id", buyerId)
      .order("ticket_number"),
  ]);

  const purchases = purchasesRes.data ?? [];
  const tickets = ticketsRes.data ?? [];

  const totalGasto = purchases.reduce((sum, p) => sum + p.amount, 0);
  const ticketsEmitidos = tickets.length;
  const totalUsadoSorteio = ticketsEmitidos * 20;
  const ticketsDisponiveis = Math.floor(totalGasto / 20) - ticketsEmitidos;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="MEU EXTRATO" subtitle={session.profile?.name} showRefresh />

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">

        {/* Saldo */}
        <div className="bg-yellow-400 rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-yellow-900 text-xs font-black uppercase tracking-wide mb-1">Saldo total</p>
              <p className="text-4xl font-black text-black leading-none">
                R$ {totalGasto.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-yellow-800 text-xs mt-1 font-medium">
                {purchases.length} compra(s)
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-yellow-900 text-xs font-black uppercase tracking-wide mb-1">Restante</p>
              <p className="text-4xl font-black text-black leading-none">
                R$ {(totalGasto - totalUsadoSorteio).toFixed(2).replace(".", ",")}
              </p>
              <p className="text-yellow-800 text-xs mt-1 font-medium">
                após números
              </p>
            </div>
          </div>
        </div>

        {/* Sorteio */}
        <div className="border-2 border-gray-100 rounded-2xl p-5 mb-6">
          <p className="text-xs font-black text-black uppercase tracking-wide mb-3">🎟️ Meus números da sorte</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 font-bold uppercase">Números emitidos</p>
              <p className="text-2xl font-black text-black mt-0.5">{ticketsEmitidos}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${ticketsDisponiveis > 0 ? "bg-yellow-50" : "bg-gray-50"}`}>
              <p className={`text-xs font-bold uppercase ${ticketsDisponiveis > 0 ? "text-yellow-700" : "text-gray-400"}`}>
                Disponíveis p/ retirar
              </p>
              <p className={`text-2xl font-black mt-0.5 ${ticketsDisponiveis > 0 ? "text-yellow-600" : "text-gray-300"}`}>
                {ticketsDisponiveis}
              </p>
            </div>
          </div>

          {ticketsDisponiveis > 0 && (
            <div className="bg-yellow-400 rounded-xl px-4 py-3 mb-4 text-center">
              <p className="text-yellow-900 text-xs font-black">
                Você tem {ticketsDisponiveis} número{ticketsDisponiveis > 1 ? "s" : ""} disponível{ticketsDisponiveis > 1 ? "is" : ""}!
              </p>
              <p className="text-yellow-800 text-xs mt-0.5">
                Procure um vendedor para retirar.
              </p>
            </div>
          )}

          {tickets.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-3 font-medium">
              Nenhum número emitido ainda.{" "}
              {Math.floor(totalGasto / 20) === 0 && (
                <span>Gaste R$20 para ganhar um número!</span>
              )}
            </p>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {tickets.map((t) => (
                <RaffleCard key={t.id} number={t.ticket_number} />
              ))}
            </div>
          )}

          {totalUsadoSorteio > 0 && (
            <p className="text-xs text-gray-400 mt-3 text-center font-medium">
              R$ {totalUsadoSorteio.toFixed(2).replace(".", ",")} usado em números de sorteio
            </p>
          )}
        </div>

        {/* Histórico de compras */}
        <h2 className="font-black text-black mb-3 text-sm uppercase tracking-wide">
          Histórico de compras
        </h2>

        {purchases.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
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
