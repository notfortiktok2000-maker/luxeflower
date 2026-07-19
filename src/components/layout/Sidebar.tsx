import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, History, Settings, ShoppingCart, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "../shared/Logo";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { name: "Tableau de bord", path: "/", icon: LayoutDashboard },
  { name: "Produits", path: "/products", icon: Package },
  { name: "Historique", path: "/history", icon: History },
  { name: "Commandes", path: "/orders", icon: ShoppingCart },
  { name: "Paramètres", path: "/settings", icon: Settings },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getInitials = (email: string) => {
    if (!email) return 'JD';
    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const userName = user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'Jean Dupont';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 flex items-center justify-between">
        <Logo className="h-6" />
        <button onClick={onClose} className="lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-md">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="px-4 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">E-COMMERCE SYNC</p>
        <div className="bg-[#2D2A77] rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-indigo-100/80">Statut API</span>
            <span className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676]"></span>
          </div>
          <h4 className="font-bold text-lg leading-tight mb-1">Shopify Connecté</h4>
          <p className="text-xs text-indigo-100/60">Dernière sync: il y a 2m</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-slate-600">{getInitials(user?.email || '')}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate capitalize">{userName}</p>
            <p className="text-xs text-slate-500">Architecte Lead</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
