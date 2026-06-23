"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "./actions/auth";
import { formatCPF, cleanCPF } from "@/lib/cpf";

export default function EntradaPage() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function handleCPFChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCPF(e.target.value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await registerUser(name, cleanCPF(cpf));

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.role === "comprador") router.push("/comprador");
    else if (result.role === "vendedor") router.push("/vendedor");
    else router.push("/aguardando");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-red-600 px-5 py-5 text-center">
        <div className="text-4xl mb-1">🎪</div>
        <h1 className="text-white text-2xl font-black tracking-tight">FESTA JUNINA</h1>
        <p className="text-red-200 text-sm font-medium mt-0.5">Controle de Gastos</p>
      </header>

      <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-sm mx-auto w-full">
        <div className="mb-7">
          <h2 className="text-2xl font-black text-black">Entrar</h2>
          <p className="text-gray-500 text-sm mt-1">
            Novo por aqui? Basta preencher e entrar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Seu nome completo"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-black text-sm font-medium placeholder:font-normal placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1.5">
              CPF
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={handleCPFChange}
              required
              maxLength={14}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-black text-sm font-medium placeholder:font-normal placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide mt-2"
          >
            {loading ? "Entrando..." : "ENTRAR"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-2">É organizador?</p>
          <a
            href="/admin/login"
            className="text-sm font-bold text-yellow-600 hover:text-yellow-700"
          >
            Acesso administrativo →
          </a>
        </div>
      </div>
    </div>
  );
}
