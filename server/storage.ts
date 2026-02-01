import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  products, messages, siteData,
  type Product, type InsertProduct,
  type Message, type InsertMessage,
  type SiteData
} from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
  deleteMessage(id: number): Promise<void>;

  // Site Data
  getSiteData(key: string): Promise<SiteData | undefined>;
  updateSiteData(key: string, value: any): Promise<SiteData>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Messages
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async deleteMessage(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
  }

  // Site Data
  async getSiteData(key: string): Promise<SiteData | undefined> {
    const [data] = await db.select().from(siteData).where(eq(siteData.key, key));
    return data;
  }

  async updateSiteData(key: string, value: any): Promise<SiteData> {
    const [data] = await db
      .insert(siteData)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteData.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return data;
  }
}

export const storage = new DatabaseStorage();
