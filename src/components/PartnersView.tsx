import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Users, Truck, Plus, Trash2, Edit2, Phone, Wallet } from "lucide-react";
import { db, type Client, type Supplier } from "../db";
import { cn, formatCurrency } from "../utils";
import { motion } from "motion/react";

interface PartnersViewProps {
  type: "clients" | "suppliers";
}

export const PartnersView: React.FC<PartnersViewProps> = ({ type }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", balance: 0 });

  const data =
    useLiveQuery(() => {
      return type === "clients" ? db.clients.toArray() : db.suppliers.toArray();
    }, [type]) ?? [];

  const handleSave = async () => {
    try {
      if (type === "clients") {
        if (editingId) await db.clients.update(editingId, formData);
        else await db.clients.add(formData);
      } else {
        if (editingId) await db.suppliers.update(editingId, formData);
        else await db.suppliers.add(formData);
      }
      setShowAddModal(false);
      setEditingId(null);
      setFormData({ name: "", phone: "", balance: 0 });
    } catch (e) {
      alert("Error saving record");
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm("Are you sure? | کیا آپ اسے حذف کرنا چاہتے ہیں؟")) return;
    if (type === "clients") await db.clients.delete(id);
    else await db.suppliers.delete(id);
  };

  return (
    <div className="flex flex-col h-full gap-8 p-8 overflow-y-auto custom-scrollbar bg-surface">
      <div className="flex justify-between items-end bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-border-subtle">
        <div className="flex items-center gap-6">
          <div
            className={cn(
              "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-lg transition-transform hover:scale-110",
              type === "clients"
                ? "bg-emerald-500 text-white shadow-emerald-200"
                : "bg-blue-600 text-white shadow-blue-200",
            )}
          >
            {type === "clients" ? <Users size={28} /> : <Truck size={28} />}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
              {type} Directory
            </h2>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1 urdu text-left">
              لیجر اور رابطے کی تفصیلات
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingId(null);
          }}
          className={cn(
            "px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-3 transition-all transform active:scale-95 text-white shadow-xl",
            type === "clients"
              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
              : "bg-slate-900 hover:bg-black shadow-slate-200",
          )}
        >
          <Plus size={20} />
          <span className="urdu text-lg leading-none">نیا شامل کریں</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={item.id}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/20 border border-border-subtle hover:border-blue-200 hover:-translate-y-1 transition-all group relative"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 text-xl font-black uppercase tracking-tighter shadow-inner border border-white">
                {item.name.substring(0, 2)}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingId(item.id!);
                    setFormData(item);
                    setShowAddModal(true);
                  }}
                  className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => deleteRecord(item.id!)}
                  className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mt-1 lowercase">
              <Phone size={12} className="text-blue-500" />
              <span>{item.phone}</span>
            </div>

            <div
              className={cn(
                "mt-8 p-6 rounded-3xl flex items-center justify-between border",
                item.balance > 0
                  ? "bg-red-50/50 border-red-100 text-red-600"
                  : "bg-emerald-50/50 border-emerald-100 text-emerald-600",
              )}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                  Balance
                </span>
                <span className="font-mono font-black text-xl mt-1">
                  {formatCurrency(Math.abs(item.balance))}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Wallet size={18} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md shadow-3xl overflow-hidden border border-white/20"
          >
            <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                  Partner Details
                </span>
                <h3 className="urdu text-2xl leading-none mt-1">
                  {editingId ? "تفصیلات تبدیل کریں" : "نیا ریکارڈ"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                  placeholder="E.g. Ali Ahmed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                  placeholder="0321-7654321"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Initial Outstanding Balance
                </label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      balance: Number(e.target.value),
                    })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-black text-xl focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all urdu text-xl leading-none"
              >
                محفوظ کریں
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
