"use client";

import { useState, useMemo } from "react";
import { updateUserRole } from "@/app/actions/users";
import { formatCPF } from "@/lib/cpf";

interface Profile {
  id: string;
  name: string;
  cpf: string;
  role: string;
  total: number;
}

const ROLE_LABELS: Record<string, string> = {
  comprador: "Comprador",
  vendedor: "Vendedor",
  pending: "Aguardando",
};

const ROLE_COLORS: Record<string, string> = {
  comprador: "bg-yellow-400 text-black",
  vendedor: "bg-red-600 text-white",
  pending: "bg-gray-200 text-gray-600",
};

export default function AdminClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>("all");

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const matchQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.cpf.includes(query.replace(/\D/g, ""));
      const matchRole = filterRole === "all" || p.role === filterRole;
      return matchQuery && matchRole;
    });
  }, [profiles, query, filterRole]);

  async function handleRoleChange(profileId: string, newRole: string) {
    setLoadingId(profileId);
    const result = await updateUserRole(profileId, newRole);
    if (!result.error) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );
    }
    setLoadingId(null);
  }

  return (
    <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 text-sm text-black font-medium placeholder:font-normal placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {["all", "pending", "comprador", "vendedor"].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap border-2 transition-colors ${
              filterRole === r
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {r === "all" ? "Todos" : ROLE_LABELS[r]}
            {r !== "all" && (
              <span className="ml-1 opacity-60">
                ({profiles.filter((p) => p.role === r).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-medium">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((profile) => (
            <div
              key={profile.id}
              className="bg-white border-2 border-gray-100 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-black truncate">{profile.name}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {formatCPF(profile.cpf)}
                  </p>
                  {profile.total > 0 && (
                    <p className="text-xs font-black text-red-600 mt-1">
                      R$ {profile.total.toFixed(2).replace(".", ",")}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ${ROLE_COLORS[profile.role]}`}
                >
                  {ROLE_LABELS[profile.role]}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                {["comprador", "vendedor", "pending"].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(profile.id, role)}
                    disabled={profile.role === role || loadingId === profile.id}
                    className={`flex-1 py-2 rounded-lg text-xs font-black border-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      profile.role === role
                        ? "border-black bg-black text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {loadingId === profile.id && profile.role !== role
                      ? "..."
                      : role === "pending"
                      ? "Aguard."
                      : ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
