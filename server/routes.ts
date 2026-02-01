import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Products API ===
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  // Protected Routes (CMS)
  app.post(api.products.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).end();
  });

  // === Messages API ===
  app.get(api.messages.list.path, isAuthenticated, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.messages.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteMessage(Number(req.params.id));
    res.status(204).end();
  });

  // === Site Data API ===
  app.get(api.site.get.path, async (req, res) => {
    const data = await storage.getSiteData(req.params.key);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data.value);
  });

  app.post(api.site.update.path, isAuthenticated, async (req, res) => {
    const data = await storage.updateSiteData(req.params.key, req.body);
    res.json(data.value);
  });

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    await storage.createProduct({
      title: "Class 10 Math Complete Notes",
      description: "Comprehensive notes for Class 10 Mathematics including all chapters and formulas.",
      price: 49900, // $499.00
      category: "Notes",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
      features: ["All Chapters", "Formula Sheet", "Practice Questions"],
      isPopular: true,
    });
    await storage.createProduct({
      title: "Full Stack Development Course",
      description: "Learn MERN stack from scratch with real-world projects.",
      price: 199900, // $1999.00
      category: "Course",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
      features: ["React", "Node.js", "PostgreSQL", "Deployments"],
      isPopular: true,
    });
    await storage.createProduct({
      title: "GATE CSE Mock Test Series",
      description: "10 Full length mock tests with detailed solutions.",
      price: 99900,
      category: "Test Series",
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
      features: ["10 Tests", "Detailed Analysis", "All India Rank"],
      isPopular: false,
    });
  }
}
