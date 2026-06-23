import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.isAdmin) redirect("/admin");

  const role = session.profile?.role;
  if (role === "comprador") redirect("/comprador");
  if (role === "vendedor") redirect("/vendedor");
  redirect("/aguardando");
}
