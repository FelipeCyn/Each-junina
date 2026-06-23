import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Header from "@/components/Header";
import VendedorClient from "./VendedorClient";

export default async function VendedorPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.isAdmin) redirect("/admin");
  if (session.profile?.role !== "vendedor") redirect("/aguardando");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="VENDEDOR" subtitle={session.profile?.name} />
      <VendedorClient />
    </div>
  );
}
