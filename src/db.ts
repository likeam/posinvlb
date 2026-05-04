import Dexie, { type Table } from "dexie";

export interface Category {
  id?: number;
  name: string;
  nameUrdu: string;
}

export interface SubCategory {
  id?: number;
  categoryId: number;
  name: string;
  nameUrdu: string;
}

export interface Product {
  id?: number;
  subCategoryId: number;
  name: string;
  nameUrdu: string;
  sku: string;
  price: number;
  purchasePrice: number;
  stock: number;
  unit: string;
}

export interface Client {
  id?: number;
  name: string;
  phone: string;
  balance: number; // Positive means they owe us
}

export interface Supplier {
  id?: number;
  name: string;
  phone: string;
  balance: number; // Positive means we owe them
}

export interface TransactionItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Transaction {
  id?: number;
  type: "sale" | "purchase";
  partnerId?: number; // clientId or supplierId
  items: TransactionItem[];
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  date: Date;
  status: "completed" | "pending";
}

export class PosDatabase extends Dexie {
  categories!: Table<Category>;
  subCategories!: Table<SubCategory>;
  products!: Table<Product>;
  clients!: Table<Client>;
  suppliers!: Table<Supplier>;
  transactions!: Table<Transaction>;

  constructor() {
    super("PosDatabase");
    this.version(1).stores({
      categories: "++id, name, nameUrdu",
      subCategories: "++id, categoryId, name",
      products: "++id, subCategoryId, name, sku",
      clients: "++id, name, phone",
      suppliers: "++id, name, phone",
      transactions: "++id, type, partnerId, date",
    });
  }
}

export const db = new PosDatabase();
