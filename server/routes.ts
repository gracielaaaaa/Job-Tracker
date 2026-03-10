import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProspectSchema, insertContactSchema, STATUSES, INTEREST_LEVELS, CONTACT_TYPES } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/prospects", async (_req, res) => {
    const prospects = await storage.getAllProspects();
    res.json(prospects);
  });

  app.post("/api/prospects", async (req, res) => {
    const parsed = insertProspectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map((e) => e.message).join(", ") });
    }
    const prospect = await storage.createProspect(parsed.data);
    res.status(201).json(prospect);
  });

  app.patch("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const existing = await storage.getProspect(id);
    if (!existing) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    const body = req.body;
    const updates: Record<string, unknown> = {};

    if (body.companyName !== undefined) updates.companyName = body.companyName;
    if (body.roleTitle !== undefined) updates.roleTitle = body.roleTitle;
    if (body.jobUrl !== undefined) updates.jobUrl = body.jobUrl;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.salary !== undefined) {
      if (body.salary === null || body.salary === "") {
        updates.salary = null;
      } else {
        const salaryNum = Number(body.salary);
        if (isNaN(salaryNum) || !Number.isInteger(salaryNum) || salaryNum < 0 || salaryNum > 99_999_999) {
          return res.status(400).json({ message: "Salary must be a whole number between 0 and 99,999,999" });
        }
        updates.salary = salaryNum;
      }
    }

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(", ")}` });
      }
      updates.status = body.status;
    }

    if (body.interestLevel !== undefined || body.interest_level !== undefined) {
      const level = body.interestLevel ?? body.interest_level;
      if (!INTEREST_LEVELS.includes(level)) {
        return res.status(400).json({ message: `Interest level must be one of: ${INTEREST_LEVELS.join(", ")}` });
      }
      updates.interestLevel = level;
    }

    const updated = await storage.updateProspect(id, updates);
    res.json(updated);
  });

  app.delete("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const deleted = await storage.deleteProspect(id);
    if (!deleted) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    res.status(204).send();
  });

  app.get("/api/prospects/:prospectId/contacts", async (req, res) => {
    const prospectId = parseInt(req.params.prospectId, 10);
    if (isNaN(prospectId)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }
    const contactsList = await storage.getContactsByProspect(prospectId);
    res.json(contactsList);
  });

  app.post("/api/prospects/:prospectId/contacts", async (req, res) => {
    const prospectId = parseInt(req.params.prospectId, 10);
    if (isNaN(prospectId)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }
    const prospect = await storage.getProspect(prospectId);
    if (!prospect) {
      return res.status(404).json({ message: "Prospect not found" });
    }
    const parsed = insertContactSchema.safeParse({ ...req.body, prospectId });
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map((e) => e.message).join(", ") });
    }
    const contact = await storage.createContact(parsed.data);
    res.status(201).json(contact);
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    const existing = await storage.getContact(id);
    if (!existing) {
      return res.status(404).json({ message: "Contact not found" });
    }
    const body = req.body;
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim() === "") {
        return res.status(400).json({ message: "Contact name is required" });
      }
      updates.name = body.name;
    }
    if (body.contactType !== undefined) {
      if (!CONTACT_TYPES.includes(body.contactType)) {
        return res.status(400).json({ message: `Contact type must be one of: ${CONTACT_TYPES.join(", ")}` });
      }
      updates.contactType = body.contactType;
    }
    if (body.email !== undefined) {
      if (body.email && typeof body.email === "string" && body.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
          return res.status(400).json({ message: "Invalid email address" });
        }
        updates.email = body.email;
      } else {
        updates.email = null;
      }
    }
    if (body.title !== undefined) updates.title = body.title || null;
    if (body.notes !== undefined) updates.notes = body.notes || null;
    const updated = await storage.updateContact(id, updates);
    res.json(updated);
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    const deleted = await storage.deleteContact(id);
    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(204).send();
  });

  return httpServer;
}
