import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ShoppingCart,
  Search,
  ChevronRight,
  Hash,
  User,
  Trash2,
  Plus,
  Minus,
  Printer,
  X,
} from "lucide-react";
import {
  db,
  type Product,
  type Category,
  type SubCategory,
  type Client,
} from "../db";
import { cn, formatCurrency, URDU_TRANSLATIONS } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface CartItem extends Product {
  quantity: number;
}

export const POSView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "categories" | "subcategories" | "products"
  >("categories");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);

  // Queries
  const categories = useLiveQuery(() => db.categories.toArray()) ?? [];
  const subCategories =
    useLiveQuery(
      () =>
        selectedCategory
          ? db.subCategories
              .where("categoryId")
              .equals(selectedCategory)
              .toArray()
          : [],
      [selectedCategory],
    ) ?? [];

  const products =
    useLiveQuery(() => {
      if (searchQuery) {
        return db.products
          .where("name")
          .startsWithIgnoreCase(searchQuery)
          .toArray();
      }
      if (selectedSubCategory) {
        return db.products
          .where("subCategoryId")
          .equals(selectedSubCategory)
          .toArray();
      }
      return [];
    }, [selectedSubCategory, searchQuery]) ?? [];

  const clients = useLiveQuery(() => db.clients.toArray()) ?? [];

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const subTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const grandTotal = subTotal - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const transaction: any = {
      type: "sale",
      partnerId: selectedClient || undefined,
      items: cart.map((item) => ({
        productId: item.id!,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subTotal,
      discount,
      grandTotal,
      paidAmount,
      date: new Date(),
      status: "completed",
    };

    try {
      await db.transaction(
        "rw",
        db.transactions,
        db.products,
        db.clients,
        async () => {
          await db.transactions.add(transaction);
          for (const item of cart) {
            const product = await db.products.get(item.id!);
            if (product)
              await db.products.update(item.id!, {
                stock: product.stock - item.quantity,
              });
          }
          if (selectedClient && paidAmount < grandTotal) {
            const client = await db.clients.get(selectedClient);
            if (client)
              await db.clients.update(selectedClient, {
                balance: client.balance + (grandTotal - paidAmount),
              });
          }
        },
      );
      setCart([]);
      setDiscount(0);
      setPaidAmount(0);
      setSelectedClient(null);
      setShowCheckout(false);
      alert("Sale Completed!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-full gap-6 p-6 overflow-hidden">
      {/* Left side: Navigation grids */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white p-2 rounded-2xl border border-border-subtle shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setActiveTab("categories");
                setSelectedCategory(null);
                setSelectedSubCategory(null);
              }}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest",
                activeTab === "categories"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-50",
              )}
            >
              Main Categories
            </button>
            {selectedCategory && (
              <>
                <ChevronRight size={14} className="text-slate-300" />
                <button
                  onClick={() => {
                    setActiveTab("subcategories");
                    setSelectedSubCategory(null);
                  }}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest",
                    activeTab === "subcategories"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-400 hover:bg-slate-50",
                  )}
                >
                  Subcategories
                </button>
              </>
            )}
          </div>

          <div className="relative mr-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
              size={16}
            />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 font-bold"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setActiveTab("products");
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "categories" && (
              <motion.div
                key="cats"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id!);
                      setActiveTab("subcategories");
                    }}
                    className="flex flex-col items-center justify-center h-28 bg-white border border-border-subtle rounded-2xl hover:border-blue-300 hover:bg-blue-50/50 group transition-all shadow-sm"
                  >
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-400">
                      {cat.name}
                    </span>
                    <span className="urdu text-xl font-bold text-slate-800 group-hover:text-blue-900">
                      {cat.nameUrdu}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}

            {activeTab === "subcategories" && (
              <motion.div
                key="subcats"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {subCategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubCategory(sub.id!);
                      setActiveTab("products");
                    }}
                    className="flex flex-col items-center justify-center h-28 bg-white border border-border-subtle rounded-2xl hover:border-blue-300 hover:bg-blue-50/50 group transition-all shadow-sm"
                  >
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-400">
                      {sub.name}
                    </span>
                    <span className="urdu text-xl font-bold text-slate-800 group-hover:text-blue-900">
                      {sub.nameUrdu}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}

            {activeTab === "products" && (
              <motion.div
                key="prods"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              >
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    disabled={prod.stock <= 0}
                    className="flex flex-col p-5 bg-white border border-border-subtle rounded-2xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all text-left relative group disabled:opacity-50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] uppercase tracking-widest text-slate-300 font-black">
                        {prod.sku}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                          prod.stock > 10
                            ? "bg-blue-50 text-blue-600"
                            : "bg-red-50 text-red-600",
                        )}
                      >
                        {prod.stock} Left
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-tight line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="urdu text-lg font-bold text-slate-800 mt-1">
                        {prod.nameUrdu}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-blue-600 font-mono font-bold text-lg">
                        {formatCurrency(prod.price)}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} />
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right side: Cart and Checkout */}
      <div className="w-[400px] flex flex-col bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-border-subtle overflow-hidden">
        <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
              Current Sale
            </span>
            <h2 className="urdu text-xl leading-none mt-1">بل کی تفصیل</h2>
          </div>
          <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
            {cart.length} Items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
          {cart.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl flex justify-between items-center transition-all group"
            >
              <div className="flex flex-col">
                <span className="urdu text-lg font-bold text-slate-800 leading-none">
                  {item.nameUrdu}
                </span>
                <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                  {item.quantity} x {formatCurrency(item.price)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white rounded-xl border border-slate-100 p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => updateQuantity(item.id!, -1)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-xs font-black">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id!, 1)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-sm font-mono font-bold text-slate-900 min-w-[80px] text-right">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
              <ShoppingCart size={48} className="opacity-10 mb-4" />
              <span className="text-xs uppercase tracking-widest font-black">
                Empty Basket
              </span>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-border-subtle">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="font-mono text-xs">
                {formatCurrency(subTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Client
              </span>
              <select
                value={selectedClient || ""}
                onChange={(e) =>
                  setSelectedClient(Number(e.target.value) || null)
                }
                className="text-xs font-bold text-blue-600 focus:ring-0 cursor-pointer border-0 p-0"
              >
                <option value="">Cash Customer</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Discount
              </span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 text-right text-xs font-black bg-transparent border-b border-slate-200 focus:border-blue-600 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Grand Total
              </span>
              <span className="urdu text-xs text-slate-400 mt-1">کل رقم</span>
            </div>
            <span className="text-3xl font-black text-blue-600 font-mono">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              disabled={cart.length === 0}
              onClick={() => setShowCheckout(true)}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
            >
              Checkout
            </button>
            <button
              className="w-14 bg-white border border-border-subtle rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              onClick={() => setCart([])}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">
                Payment Process
              </h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-slate-300 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Final Amount
                </span>
                <span className="text-4xl font-black text-blue-600 font-mono tracking-tighter">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Received Amount
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">
                    RS.
                  </span>
                  <input
                    type="number"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-0 rounded-2xl font-black text-2xl focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Return Change
                </span>
                <span className="text-xl font-black text-amber-600 font-mono">
                  {paidAmount > grandTotal
                    ? formatCurrency(paidAmount - grandTotal)
                    : formatCurrency(0)}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-5 text-slate-400 font-bold hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={handleCheckout}
                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black shadow-lg transition-all urdu text-lg"
              >
                مکمل کریں
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
