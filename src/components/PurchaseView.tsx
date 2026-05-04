import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ShoppingBag,
  Search,
  ChevronRight,
  Truck,
  User,
  Plus,
  Minus,
  X,
  Package,
} from "lucide-react";
import { db, type Product, type Supplier } from "../db";
import { cn, formatCurrency, URDU_TRANSLATIONS } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface PurchaseItem extends Product {
  quantity: number;
}

export const PurchaseView: React.FC = () => {
  const [cart, setCart] = useState<PurchaseItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const suppliers = useLiveQuery(() => db.suppliers.toArray()) ?? [];
  const products =
    useLiveQuery(() => {
      if (!searchQuery) return [];
      return db.products
        .where("name")
        .startsWithIgnoreCase(searchQuery)
        .toArray();
    }, [searchQuery]) ?? [];

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing)
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id)
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const total = cart.reduce(
    (acc, item) => acc + item.purchasePrice * item.quantity,
    0,
  );

  const handlePurchase = async () => {
    if (cart.length === 0 || !selectedSupplier) return;

    try {
      await db.transaction(
        "rw",
        db.transactions,
        db.products,
        db.suppliers,
        async () => {
          await db.transactions.add({
            type: "purchase",
            partnerId: selectedSupplier,
            items: cart.map((item) => ({
              productId: item.id!,
              name: item.name,
              quantity: item.quantity,
              price: item.purchasePrice,
              total: item.purchasePrice * item.quantity,
            })),
            subTotal: total,
            discount: 0,
            grandTotal: total,
            paidAmount,
            date: new Date(),
            status: "completed",
          });

          for (const item of cart) {
            const product = await db.products.get(item.id!);
            if (product) {
              await db.products.update(item.id!, {
                stock: product.stock + item.quantity,
              });
            }
          }

          if (paidAmount < total) {
            const supplier = await db.suppliers.get(selectedSupplier);
            if (supplier) {
              await db.suppliers.update(selectedSupplier, {
                balance: supplier.balance + (total - paidAmount),
              });
            }
          }
        },
      );

      setCart([]);
      setPaidAmount(0);
      setSelectedSupplier(null);
      alert("Purchase Recorded Successfully! | خریداری محفوظ ہوگئی");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-full gap-8 p-8 overflow-hidden bg-surface">
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white p-6 rounded-[2.5rem] border border-border-subtle shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Supply Intake
              </h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1 urdu text-left">
                سٹاک کی خریداری
              </p>
            </div>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={16}
              />
              <input
                type="text"
                placeholder="Lookup items..."
                className="pl-12 pr-6 py-3.5 bg-slate-50 border-0 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500/20 font-black w-72"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="p-6 bg-white border border-border-subtle rounded-3xl hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-900/5 transition-all text-left group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                    {p.sku}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 scale-90 group-hover:scale-100 transition-transform">
                    <Plus size={16} />
                  </div>
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {p.name}
                </h4>
                <p className="urdu text-xl font-bold text-slate-500 mt-1">
                  {p.nameUrdu}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-50">
                  <span className="text-blue-600 font-mono font-bold text-lg">
                    {formatCurrency(p.purchasePrice)}
                  </span>
                </div>
              </button>
            ))}
            {products.length === 0 && searchQuery && (
              <div className="col-span-full py-20 text-center text-slate-300 uppercase text-[10px] font-black tracking-widest">
                No entries match cache
              </div>
            )}
            {!searchQuery && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300 text-center">
                <Package size={48} className="opacity-10 mb-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Ready for Intake
                </span>
                <p className="urdu text-sm mt-2 opacity-50">تلاش شروع کریں</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[400px] flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-border-subtle overflow-hidden">
        <div className="p-8 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
              Incoming Cargo
            </span>
            <h2 className="urdu text-xl leading-none mt-1">خریداری بل</h2>
          </div>
          <span className="text-[10px] font-black bg-white/10 px-4 py-2 rounded-xl uppercase tracking-widest">
            {cart.length} SKUs
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {cart.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-slate-50 border border-transparent hover:border-slate-100 rounded-3xl flex justify-between items-center transition-all group"
            >
              <div className="flex flex-col">
                <span className="urdu text-lg font-bold text-slate-800 leading-none">
                  {item.nameUrdu}
                </span>
                <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                  {item.quantity} x {formatCurrency(item.purchasePrice)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-[1rem] border border-slate-100 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => updateQuantity(item.id!, -1)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-xs font-black">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id!, 1)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-sm font-mono font-bold text-slate-900 min-w-[80px] text-right">
                  {formatCurrency(item.purchasePrice * item.quantity)}
                </span>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-32 opacity-20">
              <Truck size={48} />
              <span className="text-[10px] font-black uppercase mt-4">
                Manifest Empty
              </span>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-border-subtle">
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Supplier Source
              </span>
              <select
                value={selectedSupplier || ""}
                onChange={(e) => setSelectedSupplier(Number(e.target.value))}
                className="text-xs font-black bg-transparent border-0 ring-0 focus:ring-0 text-blue-600 p-0 cursor-pointer"
              >
                <option value="">Awaiting Source...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Amount Disbursed
              </span>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-24 text-right font-mono font-black bg-transparent border-b border-slate-200 outline-none focus:border-blue-600 text-slate-900"
              />
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Liability
                </span>
                <span className="urdu text-xs text-slate-400 mt-1">کل رقم</span>
              </div>
              <span className="text-3xl font-black text-blue-600 font-mono scale-110 origin-right">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={!selectedSupplier || cart.length === 0}
            className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px] disabled:opacity-30 disabled:grayscale"
          >
            Commit Transaction
          </button>
        </div>
      </div>
    </div>
  );
};
