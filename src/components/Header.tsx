import LogoutButton from "./LogoutButton";
import RefreshButton from "./RefreshButton";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showRefresh?: boolean;
}

export default function Header({ title, subtitle, showRefresh }: HeaderProps) {
  return (
    <header className="bg-red-600 px-4 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-white font-black text-lg leading-tight">🎪 {title}</h1>
        {subtitle && <p className="text-red-200 text-xs mt-0.5 font-medium">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {showRefresh && <RefreshButton />}
        <LogoutButton className="text-red-200 hover:text-white text-sm font-bold transition-colors" />
      </div>
    </header>
  );
}
