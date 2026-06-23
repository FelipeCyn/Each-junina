import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAllTickets } from "@/app/actions/raffle";
import LogoutButton from "@/components/LogoutButton";
import SorteioClient from "./SorteioClient";

export default async function SorteioPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/admin/login");

  const { tickets } = await getAllTickets();

  const drawnCount = (tickets as { drawn_at: string | null }[]).filter((t) => t.drawn_at).length;
  const remaining = tickets.length - drawnCount;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-black px-4 py-4 flex items-center justify-between">
        <div>
          <a href="/admin" className="text-gray-400 text-xs font-bold hover:text-white">
            ← Admin
          </a>
          <h1 className="text-white font-black text-lg mt-0.5">🎟️ SORTEIO</h1>
        </div>
        <LogoutButton className="text-gray-400 hover:text-white text-sm font-bold transition-colors" />
      </header>

      <div className="bg-yellow-400 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <div className="flex-1 bg-white rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase">Total</p>
            <p className="text-2xl font-black text-black mt-0.5">{tickets.length}</p>
          </div>
          <div className="flex-1 bg-white rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase">Restantes</p>
            <p className="text-2xl font-black text-green-600 mt-0.5">{remaining}</p>
          </div>
          <div className="flex-1 bg-white rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase">Sorteados</p>
            <p className="text-2xl font-black text-red-600 mt-0.5">{drawnCount}</p>
          </div>
        </div>
      </div>

      <SorteioClient initialTickets={tickets as {
        id: string;
        ticket_number: string;
        issued_at: string;
        drawn_at: string | null;
        buyer: { name: string; cpf: string };
      }[]} />
    </div>
  );
}
