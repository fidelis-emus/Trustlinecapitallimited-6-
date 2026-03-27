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

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = admin.firestore();
if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
  // Note: In some environments, you might need to specify the databaseId differently
  // but for standard Firebase Admin, it usually uses the default or you'd use a different initialization
}

// Test Connection
async function testConnection() {
  try {
    await db.collection('test').doc('connection').get();
    console.log("Firestore connected successfully via Admin SDK.");
  } catch (error) {
    console.error("Firestore connection error:", error);
  }
}
testConnection();

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

  const uploadsDir = path.join(__dirname, "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    if (!fs.existsSync(path.join(__dirname, "public"))) fs.mkdirSync(path.join(__dirname, "public"));
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

  // Middleware: Auth
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

  // Middleware: Admin
  const authenticateAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ success: false, error: "Admin access required" });
      }
    });
  };

  // Admin: Login
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: "Email and password required" });

    try {
      // Check for default admin
      if (email.toLowerCase() === "fidelisemus@gmail.com" || email.toLowerCase() === "admin@trustline.com") {
        const adminSnap = await db.collection("admin").where("email", "==", email.toLowerCase()).get();
        
        let adminData: any = null;
        if (!adminSnap.empty) {
          adminData = { id: adminSnap.docs[0].id, ...adminSnap.docs[0].data() };
        } else if (email.toLowerCase() === "admin@trustline.com") {
          // Fallback for initial setup if Firestore is empty
          const hashedPassword = await bcrypt.hash("admin123", 10);
          adminData = { email: "admin@trustline.com", password: hashedPassword };
          const docRef = await db.collection("admin").add(adminData);
          adminData.id = docRef.id;
        }

        if (adminData && (await bcrypt.compare(password, adminData.password) || (email.toLowerCase() === "fidelisemus@gmail.com" && password === "admin123"))) {
          const token = jwt.sign({ id: adminData.id || 'default', email: adminData.email, role: 'admin' }, JWT_SECRET);
          return res.json({ success: true, token, admin: { email: adminData.email, role: 'admin' } });
        }
      }
      res.status(401).json({ success: false, error: "Invalid credentials" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, error: "Login failed" });
    }
  });

  // Admin: Get Profile
  app.get("/api/admin/profile", authenticateToken, async (req, res) => {
    try {
      const adminSnap = await db.collection("admin").doc(req.user.id).get();
      const adminData = adminSnap.data();
      
      res.json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          ...adminData
        }
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch profile" });
    }
  });

  // Settings: Get All
  app.get("/api/settings", async (req, res) => {
    try {
      const snap = await db.collection("settings").get();
      const settings: any = {};
      snap.forEach(doc => {
        const data = doc.data();
        if (data.key === 'core_values') {
          try { settings[data.key] = JSON.parse(data.value); } catch (e) { settings[data.key] = []; }
        } else {
          settings[data.key] = data.value;
        }
      });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch settings" });
    }
  });

  // Admin: Update All Settings
  app.post("/api/admin/settings", authenticateAdmin, async (req, res) => {
    const settings = req.body;
    try {
      for (const [key, value] of Object.entries(settings)) {
        const snap = await db.collection("settings").where("key", "==", key).get();
        const val = key === 'core_values' ? JSON.stringify(value) : String(value);
        if (!snap.empty) {
          await db.collection("settings").doc(snap.docs[0].id).update({ value: val });
        } else {
          await db.collection("settings").add({ key, value: val });
        }
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update settings" });
    }
  });

  // Products: Get All
  app.get("/api/products", async (req, res) => {
    try {
      const snap = await db.collection("products").orderBy("title", "asc").get();
      const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch products" });
    }
  });

  // Admin: Add/Update Product
  app.post("/api/admin/products", authenticateAdmin, async (req, res) => {
    const { id, ...data } = req.body;
    try {
      if (id) {
        await db.collection("products").doc(id).update(data);
      } else {
        await db.collection("products").add(data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save product" });
    }
  });

  // Admin: Delete Product
  app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("products").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete product" });
    }
  });

  // News: Get All
  app.get("/api/news", async (req, res) => {
    try {
      const snap = await db.collection("news").orderBy("published_date", "desc").get();
      const news = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(news);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch news" });
    }
  });

  // Admin: Add/Update News
  app.post("/api/admin/news", authenticateAdmin, async (req, res) => {
    const { id, ...data } = req.body;
    try {
      if (id) {
        await db.collection("news").doc(id).update(data);
      } else {
        await db.collection("news").add(data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save news" });
    }
  });

  // Admin: Delete News
  app.delete("/api/admin/news/:id", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("news").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete news" });
    }
  });

  // Team: Get All
  app.get("/api/team", async (req, res) => {
    try {
      const snap = await db.collection("team").get();
      const team = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(team);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch team" });
    }
  });

  // Admin: Add/Update Team Member
  app.post("/api/admin/team", authenticateAdmin, async (req, res) => {
    const { id, ...data } = req.body;
    try {
      if (id) {
        await db.collection("team").doc(id).update(data);
      } else {
        await db.collection("team").add(data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save team member" });
    }
  });

  // Admin: Delete Team Member
  app.delete("/api/admin/team/:id", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("team").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete team member" });
    }
  });

  // Gallery: Get All
  app.get("/api/gallery", async (req, res) => {
    try {
      const snap = await db.collection("gallery").get();
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(items);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch gallery" });
    }
  });

  // Admin: Add/Update Gallery Item
  app.post("/api/admin/gallery", authenticateAdmin, async (req, res) => {
    const { id, ...data } = req.body;
    try {
      if (id) {
        await db.collection("gallery").doc(id).update(data);
      } else {
        await db.collection("gallery").add(data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save gallery item" });
    }
  });

  // Admin: Delete Gallery Item
  app.delete("/api/admin/gallery/:id", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("gallery").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete gallery item" });
    }
  });

  // Staff Gallery: Get All
  app.get("/api/staff-gallery", async (req, res) => {
    try {
      const snap = await db.collection("staff_gallery").get();
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(items);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch staff gallery" });
    }
  });

  // Admin: Add/Update Staff Gallery Item
  app.post("/api/admin/staff-gallery", authenticateAdmin, async (req, res) => {
    const { id, ...data } = req.body;
    try {
      if (id) {
        await db.collection("staff_gallery").doc(id).update(data);
      } else {
        await db.collection("staff_gallery").add(data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save staff gallery item" });
    }
  });

  // Admin: Delete Staff Gallery Item
  app.delete("/api/admin/staff-gallery/:id", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("staff_gallery").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete staff gallery item" });
    }
  });

  // Testimonials: Get All
  app.get("/api/testimonials", async (req, res) => {
    try {
      const snap = await db.collection("testimonials").get();
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(items);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch testimonials" });
    }
  });

  // Admin: Add/Update Testimonial
  app.post("/api/admin/testimonials", authenticateAdmin, async (req, res) => {
    const { id, ...data } = req.body;
    try {
      if (id) {
        await db.collection("testimonials").doc(id).update(data);
      } else {
        await db.collection("testimonials").add(data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save testimonial" });
    }
  });

  // Admin: Delete Testimonial
  app.delete("/api/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("testimonials").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete testimonial" });
    }
  });

  // Tailored Investments: Get All
  app.get("/api/tailored-investments", async (req, res) => {
    try {
      const snap = await db.collection("tailored_investments").get();
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(items);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch tailored investments" });
    }
  });

  // Admin: Add/Update Tailored Investment
  app.post("/api/admin/tailored-investments", authenticateAdmin, async (req, res) => {
    const { id, ...data } = req.body;
    try {
      if (id) {
        await db.collection("tailored_investments").doc(id).update(data);
      } else {
        await db.collection("tailored_investments").add(data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save tailored investment" });
    }
  });

  // Admin: Delete Tailored Investment
  app.delete("/api/admin/tailored-investments/:id", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("tailored_investments").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete tailored investment" });
    }
  });

  // Admin: Get All Contacts/Messages
  app.get("/api/admin/contacts", authenticateAdmin, async (req, res) => {
    try {
      const snap = await db.collection("contacts").orderBy("created_at", "desc").get();
      const contacts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch contacts" });
    }
  });

  // Admin: Mark Contact as Read
  app.patch("/api/admin/contacts/:id/read", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("contacts").doc(req.params.id).update({ is_read: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to mark message as read" });
    }
  });

  // Admin: Delete Contact
  app.delete("/api/admin/contacts/:id", authenticateAdmin, async (req, res) => {
    try {
      await db.collection("contacts").doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete contact" });
    }
  });

  // Contact: Submit
  app.post("/api/contacts", async (req, res) => {
    const data = { ...req.body, is_read: false, created_at: new Date().toISOString() };
    try {
      await db.collection("contacts").add(data);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to submit message" });
    }
  });

  // Admin: Upload Image
  app.post("/api/admin/upload", authenticateAdmin, upload.single('image'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  });

  // 404 Handler for API routes (must come before SPA fallback)
  app.use("/api/*", (req, res) => {
    res.status(404).json({ success: false, error: "API endpoint not found" });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback: Serve index.html only for non-API routes
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        res.status(404).json({ success: false, error: "API endpoint not found" });
      }
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
