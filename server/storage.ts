import { type Prospect, type InsertProspect, prospects, type Contact, type InsertContact, contacts } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllProspects(): Promise<Prospect[]>;
  getProspect(id: number): Promise<Prospect | undefined>;
  createProspect(data: InsertProspect): Promise<Prospect>;
  updateProspect(id: number, data: Partial<InsertProspect>): Promise<Prospect | undefined>;
  deleteProspect(id: number): Promise<boolean>;
  getContactsByProspect(prospectId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(data: InsertContact): Promise<Contact>;
  updateContact(id: number, data: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllProspects(): Promise<Prospect[]> {
    return await db.select().from(prospects).orderBy(desc(prospects.createdAt));
  }

  async getProspect(id: number): Promise<Prospect | undefined> {
    const [result] = await db.select().from(prospects).where(eq(prospects.id, id));
    return result;
  }

  async createProspect(data: InsertProspect): Promise<Prospect> {
    const [result] = await db.insert(prospects).values(data).returning();
    return result;
  }

  async updateProspect(id: number, data: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const [result] = await db
      .update(prospects)
      .set(data)
      .where(eq(prospects.id, id))
      .returning();
    return result;
  }

  async deleteProspect(id: number): Promise<boolean> {
    await db.delete(contacts).where(eq(contacts.prospectId, id));
    const result = await db.delete(prospects).where(eq(prospects.id, id)).returning();
    return result.length > 0;
  }

  async getContactsByProspect(prospectId: number): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.prospectId, prospectId)).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [result] = await db.select().from(contacts).where(eq(contacts.id, id));
    return result;
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const [result] = await db.insert(contacts).values(data).returning();
    return result;
  }

  async updateContact(id: number, data: Partial<InsertContact>): Promise<Contact | undefined> {
    const [result] = await db
      .update(contacts)
      .set(data)
      .where(eq(contacts.id, id))
      .returning();
    return result;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
