import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function AguardandoPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.isAdmin) redirect("/admin");
  if (session.profile?.role === "comprador") redirect("/comprador");
  if (session.profile?.role === "vendedor") redirect("/vendedor");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-red-600 px-5 py-4">
        <h1 className="text-white font-black text-lg">🎪 FESTA JUNINA</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl mb-5">⏳</div>
        <h2 className="text-2xl font-black text-black mb-2">
          Cadastro realizado!
        </h2>
        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
          Seu cadastro foi registrado com sucesso. Aguarde o organizador liberar
          seu acesso.
        </p>

        <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-2xl px-5 py-4 max-w-xs w-full">
          <p className="text-xs text-yellow-700 font-bold uppercase tracking-wide mb-1">
            Cadastrado como
          </p>
          <p className="font-black text-black text-lg">{session.profile?.name}</p>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Assim que o organizador liberar seu acesso, atualize a página.
        </p>

        <div className="mt-4 flex gap-3">
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-300"
          >
            Atualizar
          </a>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
