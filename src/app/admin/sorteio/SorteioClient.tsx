"use client";

import { useState } from "react";
import { drawWinner, resetDraw } from "@/app/actions/raffle";
import { maskCPF } from "@/lib/cpf";
import RaffleCard from "@/components/RaffleCard";

interface Ticket {
  id: string;
  ticket_number: string;
  issued_at: string;
  drawn_at: string | null;
  buyer: { name: string; cpf: string };
}

interface Winner {
  id: string;
  ticketNumber: string;
  name: string;
}

export default function SorteioClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const remaining = tickets.filter((t) => !t.drawn_at).length;
  const drawnCount = tickets.filter((t) => t.drawn_at).length;

  async function handleDraw() {
    setDrawing(true);
    setError("");
    setWinner(null);

    await new Promise((r) => setTimeout(r, 2000));

    const result = await drawWinner();
    setDrawing(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    const w = result.winner!;
    setWinner(w);
    setTickets((prev) =>
      prev.map((t) => (t.id === w.id ? { ...t, drawn_at: new Date().toISOString() } : t))
    );
  }

  async function handleReset() {
    setResetting(true);
    const result = await resetDraw();
    setResetting(false);
    setShowResetModal(false);

    if (!result.error) {
      setTickets((prev) => prev.map((t) => ({ ...t, drawn_at: null })));
      setWinner(null);
      setError("");
    }
  }

  return (
    <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">

      {/* Modal de reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-black text-black text-xl mb-2">Resetar sorteio?</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Os números de todos os participantes continuam os mesmos. Apenas o histórico de sorteados será apagado — qualquer número pode ser sorteado novamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-black text-sm hover:border-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm disabled:opacity-50 transition-colors"
              >
                {resetting ? "Resetando..." : "Confirmar reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ganhador */}
      {winner && (
        <div className="mb-6 text-center">
          <p className="text-black font-black text-sm uppercase tracking-widest mb-4">🏆 GANHADOR!</p>
          <div className="flex justify-center mb-4">
            <RaffleCard number={winner.ticketNumber} large />
          </div>
          <p className="font-black text-black text-2xl mt-4">{winner.name}</p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="space-y-3 mb-8">
        <button
          onClick={handleDraw}
          disabled={drawing || remaining === 0 || tickets.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl tracking-wide"
        >
          {drawing ? (
            <span className="animate-pulse">🎰 SORTEANDO...</span>
          ) : tickets.length === 0 ? (
            "NENHUM NÚMERO EMITIDO"
          ) : remaining === 0 ? (
            "TODOS OS NÚMEROS JÁ FORAM SORTEADOS"
          ) : winner ? (
            "🎰 SORTEAR NOVAMENTE"
          ) : (
            "🎰 SORTEAR AGORA"
          )}
        </button>

        {remaining > 0 && !drawing && (
          <p className="text-gray-400 text-xs text-center font-medium">
            {remaining} número(s) restante(s) na urna
          </p>
        )}

        {error && <p className="text-red-600 text-sm font-bold text-center">{error}</p>}

        {drawnCount > 0 && (
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-black text-sm hover:border-red-400 hover:text-red-600 transition-colors"
          >
            🔄 Resetar sorteio
          </button>
        )}
      </div>

      {/* Lista de números */}
      <h2 className="font-black text-black text-sm uppercase tracking-wide mb-3">
        Todos os números emitidos
      </h2>

      {tickets.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-2">🎟️</div>
          <p className="font-medium text-sm">Nenhum número emitido ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <div
              key={t.id}
              className={`border-2 rounded-xl px-4 py-3 flex items-center justify-between ${
                winner?.ticketNumber === t.ticket_number
                  ? "border-yellow-400 bg-yellow-50"
                  : t.drawn_at
                  ? "border-gray-100 bg-gray-50 opacity-50"
                  : "border-gray-100"
              }`}
            >
              <div>
                <p className="font-black text-black text-sm">{t.buyer.name}</p>
                <p className="text-xs text-gray-400 font-medium">{maskCPF(t.buyer.cpf)}</p>
                {t.drawn_at && winner?.ticketNumber !== t.ticket_number && (
                  <p className="text-xs text-gray-400 font-bold mt-0.5">já sorteado</p>
                )}
              </div>
              <span
                className={`font-black text-lg tracking-wider ml-3 ${
                  winner?.ticketNumber === t.ticket_number
                    ? "text-yellow-600"
                    : t.drawn_at
                    ? "text-gray-300 line-through"
                    : "text-gray-300"
                }`}
              >
                #{t.ticket_number}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
