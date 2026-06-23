"use client";

import { useState } from "react";
import { drawWinner } from "@/app/actions/raffle";
import { maskCPF } from "@/lib/cpf";
import RaffleCard from "@/components/RaffleCard";

interface Ticket {
  id: string;
  ticket_number: string;
  issued_at: string;
  buyer: { name: string; cpf: string };
}

interface Winner {
  ticketNumber: string;
  name: string;
}

export default function SorteioClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets] = useState<Ticket[]>(initialTickets);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [error, setError] = useState("");

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

    setWinner(result.winner ?? null);
    setDrawn(true);
  }

  return (
    <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      {winner && (
        <div className="mb-6 text-center">
          <p className="text-black font-black text-sm uppercase tracking-widest mb-4">🏆 GANHADOR!</p>
          <div className="flex justify-center mb-4">
            <RaffleCard number={winner.ticketNumber} large />
          </div>
          <p className="font-black text-black text-2xl mt-4">{winner.name}</p>
          <button
            onClick={() => { setWinner(null); setDrawn(false); }}
            className="mt-4 px-5 py-2.5 border-2 border-black rounded-xl text-xs font-black text-black hover:bg-black hover:text-white transition-colors"
          >
            Sortear novamente
          </button>
        </div>
      )}

      {!drawn && (
        <div className="text-center mb-8">
          <button
            onClick={handleDraw}
            disabled={drawing || tickets.length === 0}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl tracking-wide"
          >
            {drawing ? (
              <span className="animate-pulse">🎰 SORTEANDO...</span>
            ) : tickets.length === 0 ? (
              "NENHUM NÚMERO EMITIDO"
            ) : (
              "🎰 SORTEAR AGORA"
            )}
          </button>
          {tickets.length > 0 && !drawing && (
            <p className="text-gray-400 text-xs mt-2 font-medium">
              {tickets.length} número(s) na urna
            </p>
          )}
          {error && <p className="text-red-600 text-sm font-bold mt-3">{error}</p>}
        </div>
      )}

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
                  : "border-gray-100"
              }`}
            >
              <div>
                <p className="font-black text-black text-sm">{t.buyer.name}</p>
                <p className="text-xs text-gray-400 font-medium">{maskCPF(t.buyer.cpf)}</p>
              </div>
              <span
                className={`font-black text-lg tracking-wider ml-3 ${
                  winner?.ticketNumber === t.ticket_number ? "text-yellow-600" : "text-gray-300"
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
