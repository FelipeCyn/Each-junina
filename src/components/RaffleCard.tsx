"use client";

import Image from "next/image";

interface RaffleCardProps {
  number: string;
  large?: boolean;
}

export default function RaffleCard({ number, large = false }: RaffleCardProps) {
  if (large) {
    return (
      <div
        className="relative bg-black rounded-3xl overflow-hidden shadow-2xl mx-auto"
        style={{ width: 300, height: 420 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-red-600 to-red-800" />
        <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-400" />

        <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 py-7">
          {/* Logo grande */}
          <div className="bg-white rounded-2xl p-2 flex items-center justify-center overflow-hidden"
            style={{ width: 200, height: 200 }}
          >
            <Image
              src="/assets/card-logo.png"
              alt="Logo"
              width={190}
              height={190}
              className="object-contain w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Número */}
          <div className="text-center">
            <p className="text-yellow-300 text-xs font-black uppercase tracking-widest mb-1">
              Número da Sorte
            </p>
            <p
              className="text-white font-black tracking-widest"
              style={{ fontSize: 72, lineHeight: 1 }}
            >
              {number}
            </p>
          </div>

          <p className="text-red-300 text-xs font-bold uppercase tracking-widest text-center">
            🎪 Each Copa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-md"
      style={{ width: 110, height: 160 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-red-600 to-red-800" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400" />

      <div className="relative z-10 flex flex-col items-center justify-between h-full px-2 py-3">
        {/* Logo maior no card pequeno */}
        <div
          className="bg-white rounded-xl flex items-center justify-center overflow-hidden"
          style={{ width: 80, height: 80 }}
        >
          <Image
            src="/assets/card-logo.png"
            alt="Logo"
            width={74}
            height={74}
            className="object-contain w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <div className="text-center">
          <p className="text-yellow-300 font-black" style={{ fontSize: 9 }}>
            Nº DA SORTE
          </p>
          <p className="text-white font-black text-2xl tracking-widest leading-none mt-0.5">
            {number}
          </p>
        </div>

        <p className="text-red-300 font-bold text-center" style={{ fontSize: 8 }}>
          🎪 EACH COPA
        </p>
      </div>
    </div>
  );
}
