import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Package,
  Search,
  Plus,
  Trash2,
  Edit2,
  Filter,
  ChevronRight,
  Hash,
} from "lucide-react";
import { db, type Product, type Category, type SubCategory } from "../db";
import { cn, formatCurrency, URDU_TRANSLATIONS } from "../utils";
import { motion } from "motion/react";

export const InventoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "subcategories"
  >("products");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    nameUrdu: "",
    sku: "",
    price: 0,
    purchasePrice: 0,
    stock: 0,
    unit: "pcs",
    categoryId: 0,
    subCategoryId: 0,
  });

  const categories = useLiveQuery(() => db.categories.toArray()) ?? [];
  const subCategories =
    useLiveQuery(() => {
      if (activeTab === "subcategories" || activeTab === "products") {
        return db.subCategories.toArray();
      }
      return [];
    }) ?? [];

  const products = useLiveQuery(() => db.products.toArray()) ?? [];

  const handleSave = async () => {
    try {
      if (activeTab === "categories") {
        if (editingId)
          await db.categories.update(editingId, {
            name: formData.name,
            nameUrdu: formData.nameUrdu,
          });
        else
          await db.categories.add({
            name: formData.name,
            nameUrdu: formData.nameUrdu,
          });
      } else if (activeTab === "subcategories") {
        if (editingId)
          await db.subCategories.update(editingId, {
            name: formData.name,
            nameUrdu: formData.nameUrdu,
            categoryId: formData.categoryId,
          });
        else
          await db.subCategories.add({
            name: formData.name,
            nameUrdu: formData.nameUrdu,
            categoryId: formData.categoryId,
          });
      } else {
        const productData = {
          name: formData.name,
          nameUrdu: formData.nameUrdu,
          sku: formData.sku,
          price: formData.price,
          purchasePrice: formData.purchasePrice,
          stock: formData.stock,
          unit: formData.unit,
          subCategoryId: formData.subCategoryId,
        };
        if (editingId) await db.products.update(editingId, productData);
        else await db.products.add(productData);
      }
      setShowAddModal(false);
      setEditingId(null);
      setFormData({
        name: "",
        nameUrdu: "",
        sku: "",
        price: 0,
        purchasePrice: 0,
        stock: 0,
        unit: "pcs",
        categoryId: 0,
        subCategoryId: 0,
      });
    } catch (e) {
      alert("Error saving record");
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm("Are you sure? | کیا آپ اس ریکارڈ کو حذف کرنا چاہتے ہیں؟"))
      return;
    if (activeTab === "categories") await db.categories.delete(id);
    else if (activeTab === "subcategories") await db.subCategories.delete(id);
    else await db.products.delete(id);
  };

  return (
    <div className="flex flex-col h-full gap-8 p-8 overflow-hidden bg-surface">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
            {activeTab} Ledger
          </h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
            Manage physical & digital inventory
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-border-subtle shadow-sm">
          {["products", "categories", "subcategories"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-50",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingId(null);
          }}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={18} />
          <span className="urdu text-lg leading-none">نیا ریکارڈ</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-border-subtle overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
            />
            <input
              type="text"
              placeholder="Filter inventory..."
              className="pl-12 pr-6 py-3 text-xs bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none w-80 font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Live Syncing
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-50/50 sticky top-0 z-10">
              <tr className="text-slate-400 uppercase text-[9px] font-black tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5 text-left">Entity Description</th>
                {activeTab === "products" && (
                  <>
                    <th className="px-8 py-5 text-center">Unit Cost</th>
                    <th className="px-8 py-5 text-center">Base Price</th>
                    <th className="px-8 py-5 text-center">Availability</th>
                  </>
                )}
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTab === "products" &&
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {p.name}
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black tracking-widest">
                            {p.sku}
                          </span>
                        </div>
                        <span className="urdu text-xl font-bold text-slate-500 mt-1 leading-none">
                          {p.nameUrdu}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-mono font-bold text-slate-400">
                      {formatCurrency(p.purchasePrice)}
                    </td>
                    <td className="px-8 py-6 text-center font-mono font-bold text-blue-600 text-lg">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          p.stock < 10
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600",
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {p.stock} {p.unit}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(p.id!);
                            setFormData({ ...p, categoryId: 0 });
                            setShowAddModal(true);
                          }}
                          className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteRecord(p.id!)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {activeTab === "categories" &&
                categories.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                          {c.name}
                        </span>
                        <span className="urdu text-xl font-bold text-slate-500 mt-1 leading-none">
                          {c.nameUrdu}
                        </span>
                      </div>
                    </td>
                    <th className="px-8 py-5"></th>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(c.id!);
                            setFormData({
                              ...formData,
                              name: c.name,
                              nameUrdu: c.nameUrdu,
                            });
                            setShowAddModal(true);
                          }}
                          className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteRecord(c.id!)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {activeTab === "subcategories" &&
                subCategories.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {s.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded-md">
                            Parent:{" "}
                            {
                              categories.find((c) => c.id === s.categoryId)
                                ?.name
                            }
                          </span>
                        </div>
                        <span className="urdu text-xl font-bold text-slate-500 mt-1 leading-none">
                          {s.nameUrdu}
                        </span>
                      </div>
                    </td>
                    <th className="px-8 py-5"></th>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(s.id!);
                            setFormData({
                              ...formData,
                              name: s.name,
                              nameUrdu: s.nameUrdu,
                              categoryId: s.categoryId,
                            });
                            setShowAddModal(true);
                          }}
                          className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteRecord(s.id!)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-3xl overflow-hidden border border-white/20"
          >
            <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                  Inventory Form
                </span>
                <h3 className="urdu text-2xl leading-none mt-1">
                  {editingId ? "ریکارڈ تبدیل کریں" : "نیا ریکارڈ شامل کریں"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-2 gap-6 bg-white">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Entity Reference (EN)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                  placeholder="E.g. Fresh Milk"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right block mr-1 urdu">
                  نام (اردو)
                </label>
                <input
                  type="text"
                  value={formData.nameUrdu}
                  onChange={(e) =>
                    setFormData({ ...formData, nameUrdu: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl text-right urdu text-xl font-bold focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                  placeholder="تازہ دودھ"
                />
              </div>

              {activeTab === "subcategories" && (
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Parent Hierarchy
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: Number(e.target.value),
                      })
                    }
                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-sm"
                  >
                    <option value={0}>Assign to Main Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.nameUrdu}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === "products" && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-600">
                      Unit Cost (PURCHASE)
                    </label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchasePrice: Number(e.target.value),
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-mono font-bold text-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">
                      Base Price (SALE)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-mono font-bold text-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Available Stock
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: Number(e.target.value),
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Inventory SKU / Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-black text-sm tracking-widest"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Digital Sub-Category
                    </label>
                    <select
                      value={formData.subCategoryId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subCategoryId: Number(e.target.value),
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value={0}>Uncategorized</option>
                      {subCategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {categories.find((c) => c.id === s.categoryId)?.name}{" "}
                          » {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="p-8 bg-slate-50 flex gap-4 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-12 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all urdu text-xl"
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
