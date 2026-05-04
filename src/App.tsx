/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { POSView } from "./components/POSView";
import { InventoryView } from "./components/InventoryView";
import { PartnersView } from "./components/PartnersView";
import { ReportsView } from "./components/ReportsView";
import { PurchaseView } from "./components/PurchaseView";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
      case "reports":
        return <ReportsView />;
      case "pos":
        return <POSView />;
      case "purchase":
        return <PurchaseView />;
      case "inventory":
        return <InventoryView />;
      case "clients":
        return <PartnersView type="clients" />;
      case "suppliers":
        return <PartnersView type="suppliers" />;
      default:
        return <ReportsView />;
    }
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-border-subtle flex items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Stock Alerts
              </span>
              <span className="text-red-600 font-bold text-sm">
                Low Stock Items
              </span>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="text-sm font-medium">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Status
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-gray-900 font-bold uppercase text-[10px]">
                  Logged In
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Admin User</p>
              <p className="urdu text-xs text-gray-400 leading-none">
                ایڈمن صارف
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl shadow-inner border border-white">
              👤
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
