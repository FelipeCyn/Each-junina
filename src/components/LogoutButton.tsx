"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={className ?? "px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"}
    >
      Sair
    </button>
  );
}
