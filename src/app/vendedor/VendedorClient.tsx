"use client";

import { useState } from "react";
import { searchBuyers } from "@/app/actions/users";
import { createPurchase, getBuyerPurchases, deletePurchase } from "@/app/actions/purchases";
import { getBuyerRaffleInfo, issueRaffleTicket } from "@/app/actions/raffle";
import { maskCPF } from "@/lib/cpf";

interface Buyer {
  id: string;
  name: string;
  cpf: string;
}

interface RaffleInfo {
  totalSpent: number;
  earned: number;
  issued: number;
  pending: number;
}

interface Purchase {
  id: string;
  amount: number;
  description: string | null;
  created_at: string;
}

type ActiveTab = "gasto" | "historico" | "sorteio";

export default function VendedorClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Buyer[]>([]);
  const [selected, setSelected] = useState<Buyer | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("gasto");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loadingPurchase, setLoadingPurchase] = useState(false);

  const [raffleInfo, setRaffleInfo] = useState<RaffleInfo | null>(null);
  const [loadingRaffle, setLoadingRaffle] = useState(false);
  const [lastTicket, setLastTicket] = useState<string | null>(null);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searching, setSearching] = useState(false);
  const [success, setSuccess] = useState("");
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

  async function handleSelectBuyer(buyer: Buyer) {
    setSelected(buyer);
    setResults([]);
    setError("");
    setActiveTab("gasto");
    setLastTicket(null);
    setPurchases([]);
    setConfirmDeleteId(null);

    const info = await getBuyerRaffleInfo(buyer.id);
    if (!info.error) setRaffleInfo(info as RaffleInfo);
  }

  async function handleTabChange(tab: ActiveTab) {
    setActiveTab(tab);
    setError("");
    setSuccess("");
    setLastTicket(null);
    setConfirmDeleteId(null);

    if (tab === "sorteio" && selected && !raffleInfo) {
      const info = await getBuyerRaffleInfo(selected.id);
      if (!info.error) setRaffleInfo(info as RaffleInfo);
    }

    if (tab === "historico" && selected) {
      setLoadingPurchases(true);
      const { purchases: data } = await getBuyerPurchases(selected.id);
      setPurchases(data as Purchase[]);
      setLoadingPurchases(false);
    }
  }

  async function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !amount) return;
    setLoadingPurchase(true);
    setError("");

    const result = await createPurchase(
      selected.id,
      parseFloat(amount.replace(",", ".")),
      description
    );

    setLoadingPurchase(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess("Gasto registrado!");
    setSelected(null);
    setAmount("");
    setDescription("");
    setQuery("");
    setResults([]);
    setRaffleInfo(null);
    setPurchases([]);
    setTimeout(() => setSuccess(""), 4000);
  }

  async function handleDeletePurchase(purchaseId: string) {
    setDeletingId(purchaseId);
    const result = await deletePurchase(purchaseId);
    setDeletingId(null);
    setConfirmDeleteId(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));

    if (selected) {
      const info = await getBuyerRaffleInfo(selected.id);
      if (!info.error) setRaffleInfo(info as RaffleInfo);
    }
  }

  async function handleIssueTicket() {
    if (!selected) return;
    setLoadingRaffle(true);
    setError("");
    setLastTicket(null);

    const result = await issueRaffleTicket(selected.id);
    setLoadingRaffle(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setLastTicket(result.ticketNumber ?? null);
    const info = await getBuyerRaffleInfo(selected.id);
    if (!info.error) setRaffleInfo(info as RaffleInfo);
  }

  return (
    <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      {success && (
        <div className="bg-black text-white rounded-2xl p-4 mb-5 text-center font-bold">
          ✅ {success}
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
                onClick={() => handleSelectBuyer(b)}
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
        <div className="border-2 border-yellow-400 rounded-2xl overflow-hidden">
          <div className="p-5 pb-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Selecionado</p>
                <p className="font-black text-black text-lg mt-0.5">{selected.name}</p>
                <p className="text-xs text-gray-400 font-medium">{maskCPF(selected.cpf)}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setError(""); setSuccess(""); setRaffleInfo(null); setPurchases([]); }}
                className="text-gray-400 hover:text-black text-xs font-bold border-2 border-gray-200 rounded-lg px-2 py-1"
              >
                Trocar
              </button>
            </div>

            {raffleInfo && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 font-bold uppercase">Saldo total</p>
                  <p className="font-black text-black text-lg leading-none mt-0.5">
                    R$ {raffleInfo.totalSpent.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-yellow-700 font-bold uppercase">Restante</p>
                  <p className="font-black text-yellow-700 text-lg leading-none mt-0.5">
                    R$ {(raffleInfo.totalSpent - raffleInfo.issued * 20).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-1.5 mb-0">
              <button
                onClick={() => handleTabChange("gasto")}
                className={`flex-1 py-2.5 text-xs font-black rounded-t-xl border-2 border-b-0 transition-colors ${
                  activeTab === "gasto"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                💰 Registrar
              </button>
              <button
                onClick={() => handleTabChange("historico")}
                className={`flex-1 py-2.5 text-xs font-black rounded-t-xl border-2 border-b-0 transition-colors ${
                  activeTab === "historico"
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                📋 Histórico
              </button>
              <button
                onClick={() => handleTabChange("sorteio")}
                className={`flex-1 py-2.5 text-xs font-black rounded-t-xl border-2 border-b-0 transition-colors ${
                  activeTab === "sorteio"
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                🎟️ Sorteio
              </button>
            </div>
          </div>

          <div className="border-t-2 border-yellow-400 p-5">
            {activeTab === "gasto" && (
              <form onSubmit={handlePurchase} className="space-y-4">
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
                {error && <p className="text-red-600 text-sm font-bold text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loadingPurchase}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-colors disabled:opacity-50 text-base tracking-wide"
                >
                  {loadingPurchase ? "Registrando..." : "REGISTRAR GASTO"}
                </button>
              </form>
            )}

            {activeTab === "historico" && (
              <div>
                {loadingPurchases ? (
                  <p className="text-center text-gray-400 text-sm py-6 font-medium">Carregando...</p>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-3xl mb-2">🛒</div>
                    <p className="text-sm font-medium">Nenhuma compra registrada.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {error && <p className="text-red-600 text-sm font-bold text-center mb-2">{error}</p>}
                    {purchases.map((p) => (
                      <div key={p.id} className="border-2 border-gray-100 rounded-xl p-3">
                        {confirmDeleteId === p.id ? (
                          <div className="flex items-center gap-2">
                            <p className="flex-1 text-xs font-bold text-gray-500">Cancelar esta compra?</p>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-black border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                            >
                              Não
                            </button>
                            <button
                              onClick={() => handleDeletePurchase(p.id)}
                              disabled={deletingId === p.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {deletingId === p.id ? "..." : "Sim"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-black text-sm truncate">
                                {p.description || "Compra"}
                              </p>
                              <p className="text-xs text-gray-400 font-medium mt-0.5">
                                {new Date(p.created_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <span className="font-black text-red-600 text-sm shrink-0">
                              R$ {p.amount.toFixed(2).replace(".", ",")}
                            </span>
                            <button
                              onClick={() => setConfirmDeleteId(p.id)}
                              className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-black border-2 border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-600 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "sorteio" && (
              <div>
                {raffleInfo ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 font-bold">Gasto total</p>
                        <p className="font-black text-black text-sm mt-0.5">
                          R$ {raffleInfo.totalSpent.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-yellow-700 font-bold">Disponíveis</p>
                        <p className="font-black text-yellow-700 text-2xl mt-0.5">
                          {raffleInfo.pending}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 font-bold">Emitidos</p>
                        <p className="font-black text-black text-sm mt-0.5">
                          {raffleInfo.issued}/{raffleInfo.earned}
                        </p>
                      </div>
                    </div>

                    {lastTicket && (
                      <div className="bg-yellow-400 rounded-2xl p-4 mb-4 text-center">
                        <p className="text-yellow-900 text-xs font-bold uppercase mb-1">Número emitido</p>
                        <p className="font-black text-black text-4xl tracking-widest">#{lastTicket}</p>
                      </div>
                    )}

                    {error && <p className="text-red-600 text-sm font-bold text-center mb-3">{error}</p>}

                    <button
                      onClick={handleIssueTicket}
                      disabled={loadingRaffle || raffleInfo.pending === 0}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base tracking-wide"
                    >
                      {loadingRaffle
                        ? "Emitindo..."
                        : raffleInfo.pending === 0
                        ? "SEM SALDO PARA SORTEIO"
                        : "🎟️ DAR NÚMERO DE SORTEIO"}
                    </button>
                    {raffleInfo.pending > 0 && (
                      <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                        Cada número desconta R$20,00 do saldo
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-sm font-medium">Carregando...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
