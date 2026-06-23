"use client";

import { useState } from "react";
import { searchBuyers } from "@/app/actions/users";
import { createPurchase } from "@/app/actions/purchases";
import { maskCPF } from "@/lib/cpf";

interface Buyer {
  id: string;
  name: string;
  cpf: string;
}

export default function VendedorClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Buyer[]>([]);
  const [selected, setSelected] = useState<Buyer | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setSelected(null);
    setError("");

    const { results: res } = await searchBuyers(query);
    setResults(res as Buyer[]);
    if ((res as Buyer[]).length === 0) setError("Nenhum comprador encontrado.");
    setSearching(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !amount) return;
    setLoading(true);
    setError("");

    const parsedAmount = parseFloat(amount.replace(",", "."));
    const result = await createPurchase(selected.id, parsedAmount, description);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setSelected(null);
    setAmount("");
    setDescription("");
    setQuery("");
    setResults([]);
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      {success && (
        <div className="bg-black text-white rounded-2xl p-4 mb-5 text-center font-bold">
          ✅ Gasto registrado com sucesso!
        </div>
      )}

      <div className="border-2 border-gray-100 rounded-2xl p-5 mb-5">
        <h2 className="font-black text-black mb-3 text-sm uppercase tracking-wide">
          Buscar comprador
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Nome ou CPF..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-sm text-black font-medium placeholder:font-normal placeholder:text-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {searching ? "..." : "Buscar"}
          </button>
        </div>

        {error && !selected && (
          <p className="text-sm text-gray-400 mt-3 text-center font-medium">{error}</p>
        )}

        {results.length > 0 && !selected && (
          <div className="mt-3 space-y-2">
            {results.map((b) => (
              <button
                key={b.id}
                onClick={() => { setSelected(b); setResults([]); setError(""); }}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
              >
                <p className="font-black text-black text-sm">{b.name}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{maskCPF(b.cpf)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="border-2 border-yellow-400 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Registrando para</p>
              <p className="font-black text-black text-lg mt-0.5">{selected.name}</p>
              <p className="text-xs text-gray-400 font-medium">{maskCPF(selected.cpf)}</p>
            </div>
            <button
              onClick={() => { setSelected(null); setError(""); }}
              className="text-gray-400 hover:text-black text-xs font-bold border-2 border-gray-200 rounded-lg px-2 py-1"
            >
              Trocar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-black mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0,00"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-black font-bold text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-1.5">
                O que foi? (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Pastel, Caldo de cana..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-black text-sm font-medium placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm font-bold text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-colors disabled:opacity-50 text-base tracking-wide"
            >
              {loading ? "Registrando..." : "REGISTRAR GASTO"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
