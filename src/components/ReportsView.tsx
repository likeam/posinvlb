import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { db } from "../db";
import { cn, formatCurrency, formatDate } from "../utils";
import { motion } from "motion/react";
import { startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";

export const ReportsView: React.FC = () => {
  const transactions =
    useLiveQuery(() => db.transactions.orderBy("date").reverse().toArray()) ??
    [];
  const products = useLiveQuery(() => db.products.toArray()) ?? [];

  const stats = {
    today: transactions
      .filter((t) => t.date >= startOfDay(new Date()))
      .reduce((acc, t) => acc + (t.type === "sale" ? t.grandTotal : 0), 0),
    week: transactions
      .filter((t) => t.date >= startOfWeek(new Date()))
      .reduce((acc, t) => acc + (t.type === "sale" ? t.grandTotal : 0), 0),
    month: transactions
      .filter((t) => t.date >= startOfMonth(new Date()))
      .reduce((acc, t) => acc + (t.type === "sale" ? t.grandTotal : 0), 0),
    totalSales: transactions
      .filter((t) => t.type === "sale")
      .reduce((acc, t) => acc + t.grandTotal, 0),
    totalPurchases: transactions
      .filter((t) => t.type === "purchase")
      .reduce((acc, t) => acc + t.grandTotal, 0),
  };

  const chartData = [
    { name: "Today", amount: stats.today },
    { name: "Week", amount: stats.week },
    { name: "Month", amount: stats.month },
  ];

  return (
    <div className="flex flex-col h-full gap-8 p-8 overflow-y-auto custom-scrollbar bg-surface">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Executive Dashboard
          </h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
            Real-time Performance Metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Urdu Dashboard
            </span>
            <p className="urdu text-lg font-bold text-slate-600 leading-none">
              ڈیش بورڈ
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-border-subtle shadow-sm flex items-center justify-center text-blue-600">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Daily Revenue",
            urdu: "آج کی فروخت",
            value: stats.today,
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Weekly Growth",
            urdu: "ہفتہ وار فروخت",
            value: stats.week,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Total Asset Value",
            urdu: "سٹاک کی قیمت",
            value: products.reduce(
              (acc, p) => acc + p.stock * p.purchasePrice,
              0,
            ),
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Partner Balances",
            urdu: "کل بیلنس",
            value: stats.totalPurchases,
            icon: Wallet,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={idx}
            className="bg-white p-7 rounded-[2rem] border border-border-subtle shadow-xl shadow-slate-200/20 relative overflow-hidden group"
          >
            <div
              className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-125",
                item.bg,
              )}
            ></div>
            <div className="relative flex flex-col gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  item.bg,
                  item.color,
                )}
              >
                <item.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {item.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tighter">
                  {formatCurrency(item.value)}
                </h3>
                <p className="urdu text-xs text-slate-300 mt-2 leading-none font-bold">
                  {item.urdu}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-1 min-h-[400px]">
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-border-subtle shadow-xl shadow-slate-200/20 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div className="flex flex-col">
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest leading-none mb-1">
                Performance Analytics
              </h3>
              <span className="text-xl font-bold text-slate-900 urdu">
                فروخت کا گراف
              </span>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold text-blue-600 tracking-wider">
                SALES
              </button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-400 tracking-wider">
                ORDERS
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontWeight: 900,
                    fill: "#94a3b8",
                    textAnchor: "middle",
                  }}
                  dy={15}
                />
                <YAxis hide={true} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "16px",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#barGradient)"
                  radius={[12, 12, 12, 12]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col text-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Live Activity
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Recording
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {transactions.slice(0, 8).map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                      t.type === "sale"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-blue-500/10 text-blue-400",
                    )}
                  >
                    {t.type === "sale" ? "S" : "P"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold capitalize">{t.type}</h4>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest">
                      {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "text-sm font-mono font-black",
                      t.type === "sale" ? "text-emerald-400" : "text-blue-400",
                    )}
                  >
                    {t.type === "sale" ? "+" : "-"}
                    {formatCurrency(t.grandTotal)}
                  </span>
                  <p className="urdu text-xs text-slate-500 leading-none mt-1">
                    {t.type === "sale" ? "فروخت" : "خریداری"}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Calendar size={48} />
                <span className="text-[10px] font-black uppercase mt-4">
                  No recent activity
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
