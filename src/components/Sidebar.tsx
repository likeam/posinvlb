import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  BarChart3,
  Search,
  Plus,
} from "lucide-react";
import { cn, URDU_TRANSLATIONS } from "../utils";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
}) => {
  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      urdu: URDU_TRANSLATIONS.dashboard,
    },
    {
      id: "pos",
      icon: ShoppingCart,
      label: "POS (Sales)",
      urdu: URDU_TRANSLATIONS.pos,
    },
    { id: "purchase", icon: Truck, label: "Purchase", urdu: "خریداری" },
    {
      id: "inventory",
      icon: Package,
      label: "Inventory",
      urdu: URDU_TRANSLATIONS.inventory,
    },
    {
      id: "clients",
      icon: Users,
      label: "Clients",
      urdu: URDU_TRANSLATIONS.clients,
    },
    {
      id: "suppliers",
      icon: Truck,
      label: "Suppliers",
      urdu: URDU_TRANSLATIONS.suppliers,
    },
    {
      id: "reports",
      icon: BarChart3,
      label: "Reports",
      urdu: URDU_TRANSLATIONS.reports,
    },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-950 text-white border-r border-slate-800">
      <div className="p-8 border-b border-white/5">
        <h1 className="text-2xl font-bold text-center urdu leading-tight">
          گراسری اسٹور
        </h1>
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-[0.2em] mt-2 font-black">
          POS & Inventory v4.1
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-300 group relative",
              currentView === item.id
                ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon
              size={20}
              className={cn(
                "transition-colors",
                currentView === item.id
                  ? "text-white"
                  : "text-slate-600 group-hover:text-blue-400",
              )}
            />
            <div className="flex-1 flex flex-col items-start translate-y-[-1px]">
              <span className="text-[10px] uppercase tracking-wider font-bold opacity-50 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
              <span className="urdu text-lg leading-none mt-1">
                {item.urdu}
              </span>
            </div>
            {currentView === item.id && (
              <motion.div
                layoutId="active"
                className="absolute left-[-4px] w-1 h-3/5 bg-white rounded-full shadow-[0_0_8px_white]"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            <span>System Status</span>
            <span className="text-emerald-400">Offline Ready</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
