"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/actions/auth";
import { formatCPF, cleanCPF } from "@/lib/cpf";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await adminLogin(username, cleanCPF(cpf));

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="bg-red-600 px-5 py-5 text-center">
        <div className="text-3xl mb-1">🔑</div>
        <h1 className="text-white text-xl font-black tracking-tight">ACESSO ADMIN</h1>
        <p className="text-red-200 text-xs mt-0.5">Festa Junina</p>
      </header>

      <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-1.5">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="username"
              className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border-2 border-gray-700 focus:outline-none focus:border-yellow-400 text-white text-sm font-medium placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-1.5">
              CPF
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              required
              maxLength={14}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border-2 border-gray-700 focus:outline-none focus:border-yellow-400 text-white text-sm font-medium placeholder:text-gray-500"
            />
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-xl px-4 py-3">
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-black font-black py-4 rounded-xl transition-colors disabled:opacity-50 text-base tracking-wide mt-2"
          >
            {loading ? "Entrando..." : "ENTRAR"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-gray-500 hover:text-gray-400 font-medium">
            ← Voltar para o cadastro
          </a>
        </div>
      </div>
    </div>
  );
}
