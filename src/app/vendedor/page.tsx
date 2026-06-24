import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import VendedorClient from "./VendedorClient";

export default async function VendedorPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.isAdmin) redirect("/admin");
  if (session.profile?.role !== "vendedor") redirect("/aguardando");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-red-600 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg leading-tight">🎪 VENDEDOR</h1>
          <p className="text-red-200 text-xs mt-0.5 font-medium">{session.profile?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/vendedor/extrato"
            className="bg-white/20 hover:bg-white/30 text-white font-black text-xs px-3 py-2 rounded-xl transition-colors"
          >
            👤 Meu Extrato
          </a>
          <LogoutButton className="text-red-200 hover:text-white text-sm font-bold transition-colors" />
        </div>
      </header>
      <VendedorClient />
    </div>
  );
}
