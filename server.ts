import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "trustline-secret-key-2026";

// Load Firebase Configuration
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = admin.firestore();

// Test Firestore Connection
async function testConnection() {
  try {
    await db.collection('test').doc('connection').get();
    console.log("Firestore connected successfully via Admin SDK.");
  } catch (error) {
    console.error("Firestore connection error:", error);
  }
}
testConnection();

// --- Start Express Server ---
async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Global Request Logger
  app.use((req, res, next) => {
    console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok", mode: process.env.NODE_ENV || "development" }));

  // Upload setup
  const uploadsDir = path.join(__dirname, "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(path.join(__dirname, "public"), { recursive: true });
    fs.mkdirSync(uploadsDir);
  }
  app.use("/uploads", express.static(uploadsDir));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // --- Middleware: Auth ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ success: false, error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  const authenticateAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      if (req.user && req.user.role === 'admin') next();
      else res.status(403).json({ success: false, error: "Admin access required" });
    });
  };

  // --- Admin: Login ---
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: "Email and password required" });

    const normalizedEmail = email.toLowerCase();

    // Hardcoded admin fallback
    if (normalizedEmail === "admin@trustline.com" && password === "admin123") {
      const token = jwt.sign({ id: "hardcoded-admin", email: normalizedEmail, role: "admin" }, JWT_SECRET);
      return res.json({ success: true, token, admin: { email: normalizedEmail, role: "admin" } });
    }

    try {
      const snap = await db.collection("admin").where("email", "==", normalizedEmail).get();
      if (snap.empty) return res.status(401).json({ success: false, error: "Invalid credentials" });

      const adminData: any = { id: snap.docs[0].id, ...snap.docs[0].data() };
      const passwordMatch = await bcrypt.compare(password, adminData.password);

      if (!passwordMatch) return res.status(401).json({ success: false, error: "Invalid credentials" });

      const token = jwt.sign({ id: adminData.id, email: adminData.email, role: "admin" }, JWT_SECRET);
      res.json({ success: true, token, admin: { email: adminData.email, role: "admin" } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, error: "Login failed" });
    }
  });

  // --- Admin: Get Profile (used by frontend AuthContext) ---
  app.get("/api/admin/profile", authenticateToken, (req: any, res) => {
    res.json({
      success: true,
      user: {
        email: req.user.email,
        role: req.user.role,
      },
    });
  });

  // --- Example: Get Settings ---
  app.get("/api/settings", async (req, res) => {
    try {
      const snap = await db.collection("settings").get();
      const settings: any = {};
      snap.forEach(doc => {
        const data = doc.data();
        if (data.key === 'core_values') {
          try { settings[data.key] = JSON.parse(data.value); } catch { settings[data.key] = []; }
        } else {
          settings[data.key] = data.value;
        }
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch settings" });
    }
  });

  // --- Static / Vite middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();