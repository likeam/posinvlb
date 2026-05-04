import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK", { minimumFractionDigits: 2 })}`;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const URDU_TRANSLATIONS = {
  dashboard: "ڈیش بورڈ",
  pos: "پوائنٹ آف سیل",
  inventory: "انونٹری",
  clients: "گاہک",
  suppliers: "سپلائرز",
  reports: "رپورٹس",
  sale: "فروخت",
  purchase: "خریداری",
  total: "کل",
  paid: "ادائیگی",
  balance: "بقایا",
  bill: "بل",
  invoice: "انوائس",
  product: "پروڈکٹ",
  category: "کیٹیگری",
  subcategory: "سب کیٹیگری",
  stock: "اسٹاک",
  price: "قیمت",
  add: "شامل کریں",
  save: "محفوظ کریں",
  cancel: "منسوخ کریں",
  outOfStock: "اسٹاک ختم",
  lowStock: "اسٹاک کم ہے",
  grandTotal: "ٹوٹل رقم",
  discount: "رعایت",
  quantity: "مقدار",
};
