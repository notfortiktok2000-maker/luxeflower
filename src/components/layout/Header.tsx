import { Plus, Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-lg w-96 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            className="bg-transparent outline-none text-sm w-full"
            placeholder="Rechercher un produit..."
          />
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/products/add"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-lg text-sm font-medium transition-all shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Nouveau Produit</span>
        </Link>
      </div>
    </header>
  );
}
