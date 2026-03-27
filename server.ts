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
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocFromServer
} from "firebase/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "trustline-secret-key-2026";

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Test Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connected successfully.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
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
        // In a real app, we'd check the password against Firestore
        // For now, we'll allow admin@trustline.com with admin123 or check Firestore
        const adminQuery = query(collection(db, "admin"), where("email", "==", email.toLowerCase()));
        const adminSnap = await getDocs(adminQuery);
        
        let admin: any = null;
        if (!adminSnap.empty) {
          admin = { id: adminSnap.docs[0].id, ...adminSnap.docs[0].data() };
        } else if (email.toLowerCase() === "admin@trustline.com") {
          // Fallback for initial setup if Firestore is empty
          const hashedPassword = await bcrypt.hash("admin123", 10);
          admin = { email: "admin@trustline.com", password: hashedPassword };
          await addDoc(collection(db, "admin"), admin);
        }

        if (admin && (await bcrypt.compare(password, admin.password) || (email.toLowerCase() === "fidelisemus@gmail.com" && password === "admin123"))) {
          const token = jwt.sign({ id: admin.id || 'default', email: admin.email, role: 'admin' }, JWT_SECRET);
          return res.json({ success: true, token, admin: { email: admin.email, role: 'admin' } });
        }
      }
      res.status(401).json({ success: false, error: "Invalid credentials" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, error: "Login failed" });
    }
  });

  // Settings: Get All
  app.get("/api/settings", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "settings"));
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
        const q = query(collection(db, "settings"), where("key", "==", key));
        const snap = await getDocs(q);
        const val = key === 'core_values' ? JSON.stringify(value) : String(value);
        if (!snap.empty) {
          await updateDoc(doc(db, "settings", snap.docs[0].id), { value: val });
        } else {
          await addDoc(collection(db, "settings"), { key, value: val });
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
      const snap = await getDocs(query(collection(db, "products"), orderBy("title", "asc")));
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
        await updateDoc(doc(db, "products", id), data);
      } else {
        await addDoc(collection(db, "products"), data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save product" });
    }
  });

  // Admin: Delete Product
  app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, "products", req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete product" });
    }
  });

  // News: Get All
  app.get("/api/news", async (req, res) => {
    try {
      const snap = await getDocs(query(collection(db, "news"), orderBy("published_date", "desc")));
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
        await updateDoc(doc(db, "news", id), data);
      } else {
        await addDoc(collection(db, "news"), data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save news" });
    }
  });

  // Admin: Delete News
  app.delete("/api/admin/news/:id", authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, "news", req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete news" });
    }
  });

  // Team: Get All
  app.get("/api/team", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "team"));
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
        await updateDoc(doc(db, "team", id), data);
      } else {
        await addDoc(collection(db, "team"), data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save team member" });
    }
  });

  // Admin: Delete Team Member
  app.delete("/api/admin/team/:id", authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, "team", req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete team member" });
    }
  });

  // Gallery: Get All
  app.get("/api/gallery", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "gallery"));
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
        await updateDoc(doc(db, "gallery", id), data);
      } else {
        await addDoc(collection(db, "gallery"), data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save gallery item" });
    }
  });

  // Admin: Delete Gallery Item
  app.delete("/api/admin/gallery/:id", authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, "gallery", req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete gallery item" });
    }
  });

  // Staff Gallery: Get All
  app.get("/api/staff-gallery", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "staff_gallery"));
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
        await updateDoc(doc(db, "staff_gallery", id), data);
      } else {
        await addDoc(collection(db, "staff_gallery"), data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save staff gallery item" });
    }
  });

  // Admin: Delete Staff Gallery Item
  app.delete("/api/admin/staff-gallery/:id", authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, "staff_gallery", req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete staff gallery item" });
    }
  });

  // Testimonials: Get All
  app.get("/api/testimonials", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "testimonials"));
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
        await updateDoc(doc(db, "testimonials", id), data);
      } else {
        await addDoc(collection(db, "testimonials"), data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save testimonial" });
    }
  });

  // Admin: Delete Testimonial
  app.delete("/api/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, "testimonials", req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete testimonial" });
    }
  });

  // Tailored Investments: Get All
  app.get("/api/tailored-investments", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, "tailored_investments"));
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
        await updateDoc(doc(db, "tailored_investments", id), data);
      } else {
        await addDoc(collection(db, "tailored_investments"), data);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save tailored investment" });
    }
  });

  // Admin: Delete Tailored Investment
  app.delete("/api/admin/tailored-investments/:id", authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, "tailored_investments", req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete tailored investment" });
    }
  });

  // Admin: Get All Contacts/Messages
  app.get("/api/admin/contacts", authenticateAdmin, async (req, res) => {
    try {
      const snap = await getDocs(query(collection(db, "contacts"), orderBy("created_at", "desc")));
      const contacts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch contacts" });
    }
  });

  // Admin: Mark Contact as Read
  app.patch("/api/admin/contacts/:id/read", authenticateAdmin, async (req, res) => {
    try {
      await updateDoc(doc(db, "contacts", req.params.id), { is_read: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to mark message as read" });
    }
  });

  // Admin: Delete Contact
  app.delete("/api/admin/contacts/:id", authenticateAdmin, async (req, res) => {
    try {
      await deleteDoc(doc(db, "contacts", req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete contact" });
    }
  });

  // Contact: Submit
  app.post("/api/contacts", async (req, res) => {
    const data = { ...req.body, is_read: false, created_at: new Date().toISOString() };
    try {
      await addDoc(collection(db, "contacts"), data);
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

  // --- VITE MIDDLEWARE ---
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
