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
import Database from "better-sqlite3";
import { v2 as cloudinary } from "cloudinary";
import pg from "pg";

console.log("[SERVER] Script starting...");
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "trustline-secret-key-2026";

// --- DATABASE INITIALIZATION ---
const isPostgres = !!process.env.DATABASE_URL;
let db: any;
let pgPool: pg.Pool | null = null;

if (isPostgres) {
  console.log("[DATABASE] Using PostgreSQL");
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.log("[DATABASE] Using SQLite");
  const dbPath = path.join(__dirname, "database", "trustline.db");
  if (!fs.existsSync(path.join(__dirname, "database"))) {
    fs.mkdirSync(path.join(__dirname, "database"));
  }
  db = new Database(dbPath);
}

// Database Helper Functions
async function dbQuery(sql: string, params: any[] = []) {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
    return res.rows;
  } else {
    return db.prepare(sql).all(...params);
  }
}

async function dbGet(sql: string, params: any[] = []) {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
    return res.rows[0];
  } else {
    return db.prepare(sql).get(...params);
  }
}

async function dbRun(sql: string, params: any[] = []) {
  if (isPostgres && pgPool) {
    return await pgPool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
  } else {
    return db.prepare(sql).run(...params);
  }
}

async function dbExec(sql: string) {
  if (isPostgres && pgPool) {
    // Split multiple statements for Postgres if necessary, or just run as is if simple
    return await pgPool.query(sql);
  } else {
    return db.exec(sql);
  }
}

// Create tables if they don't exist
const initSql = `
  CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    min_investment REAL,
    expected_return REAL,
    duration_months INTEGER,
    risk_level TEXT,
    category TEXT,
    image_url TEXT,
    currency TEXT,
    rating REAL,
    view_rate REAL,
    rate_3m REAL,
    rate_6m REAL,
    rate_12m REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    author TEXT,
    image_url TEXT,
    date TEXT,
    category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff_gallery (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    rating REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tailored_investments (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Adjust SQL for SQLite if not Postgres
const finalInitSql = isPostgres ? initSql : initSql.replace(/SERIAL PRIMARY KEY/g, "INTEGER PRIMARY KEY AUTOINCREMENT").replace(/TIMESTAMP/g, "DATETIME");

await dbExec(finalInitSql);

// Seed default admin if not exists
const adminCount = await dbGet("SELECT COUNT(*) as count FROM admin") as { count: number | string };
if (Number(adminCount.count) === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  await dbRun("INSERT INTO admin (email, password) VALUES (?, ?)", ["admin@trustline.com", hashedPassword]);
  await dbRun("INSERT INTO admin (email, password) VALUES (?, ?)", ["fidelisemus@gmail.com", hashedPassword]);
  console.log("[SERVER] Default admins created: admin@trustline.com and fidelisemus@gmail.com / admin123");
}

// --- CLOUDINARY INITIALIZATION ---
const isCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
if (isCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log("[STORAGE] Using Cloudinary");
} else {
  console.log("[STORAGE] Using Local Filesystem");
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Global Request Logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} (${duration}ms) - Content-Type: ${res.get('Content-Type')}`);
    });
    next();
  });

  // Trailing slash middleware for API
  app.use((req, res, next) => {
    if (req.url.startsWith("/api/") && req.url.endsWith("/") && req.url.length > 5) {
      const oldUrl = req.url;
      req.url = req.url.slice(0, -1);
      console.log(`[REWRITE] Trailing slash removed: ${oldUrl} -> ${req.url}`);
    }
    next();
  });

  console.log(`[SERVER] Mode: ${process.env.NODE_ENV || "development"}`);
  console.log(`[SERVER] Static path: ${path.join(process.cwd(), "dist")}`);

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
    
    console.log(`[AUTH] Checking token for ${req.method} ${req.url}`);
    
    if (!token) {
      console.warn(`[AUTH] No token provided for ${req.url}`);
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.error(`[AUTH] Token verification failed for ${req.url}:`, err.message);
        return res.status(403).json({ success: false, error: "Forbidden" });
      }
      req.user = user;
      console.log(`[AUTH] Token verified for user: ${user.email}`);
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
  app.all("/api/admin/login", async (req, res) => {
    console.log(`[LOGIN] ${new Date().toISOString()} - Method: ${req.method}, URL: ${req.url}`);
    
    if (req.method !== "POST") {
      console.warn(`[LOGIN] Method ${req.method} not allowed for login`);
      return res.status(405).json({ 
        success: false, 
        error: "Method Not Allowed. Please use POST.",
        receivedMethod: req.method
      });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    try {
      const admin = await dbGet("SELECT * FROM admin WHERE email = ?", [email.toLowerCase()]) as any;
      
      if (admin && await bcrypt.compare(password, admin.password)) {
        const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET);
        return res.json({ success: true, token, admin: { email: admin.email, role: 'admin' } });
      }

      res.status(401).json({ success: false, error: "Invalid credentials" });
    } catch (error: any) {
      console.error("[LOGIN] Error:", error);
      res.status(500).json({ success: false, error: "Login failed" });
    }
  });

  // Admin: Profile
  app.all("/api/admin/profile", authenticateAdmin, async (req: any, res) => {
    console.log(`[PROFILE] ${new Date().toISOString()} - Method: ${req.method}, URL: ${req.url}`);
    if (req.method !== "GET") {
      return res.status(405).json({ success: false, error: "Method Not Allowed. Please use GET." });
    }
    res.json({ success: true, user: req.user });
  });

  // Settings: Get All
  app.get("/api/settings", async (req, res) => {
    try {
      const rows = await dbQuery("SELECT * FROM settings") as any[];
      const settings: any = {};
      rows.forEach(row => {
        if (row.key === 'core_values') {
          try { settings[row.key] = JSON.parse(row.value); } catch (e) { settings[row.key] = []; }
        } else {
          settings[row.key] = row.value;
        }
      });
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ success: false, error: "Failed to fetch settings" });
    }
  });

  // Admin: Update All Settings
  app.post("/api/admin/settings", authenticateAdmin, async (req, res) => {
    const settings = req.body;
    try {
      for (const [key, value] of Object.entries(settings)) {
        const val = key === 'core_values' ? JSON.stringify(value) : String(value);
        if (isPostgres) {
          await dbRun("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [key, val]);
        } else {
          await dbRun("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, val]);
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ success: false, error: "Failed to update settings" });
    }
  });

  // Products: Get All
  app.get("/api/products", async (req, res) => {
    try {
      const products = await dbQuery("SELECT * FROM products ORDER BY title ASC");
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
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(", ");
        const values = Object.values(data);
        await dbRun(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
      } else {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(data);
        await dbRun(`INSERT INTO products (${keys.join(", ")}) VALUES (${placeholders})`, values);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving product:", error);
      res.status(500).json({ success: false, error: "Failed to save product" });
    }
  });

  // Admin: Delete Product
  app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("DELETE FROM products WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete product" });
    }
  });

  // News: Get All
  app.get("/api/news", async (req, res) => {
    try {
      const news = await dbQuery('SELECT * FROM news ORDER BY "date" DESC');
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ success: false, error: "Failed to fetch news" });
    }
  });

  // Admin: Add/Update News
  app.post("/api/admin/news", authenticateAdmin, async (req, res) => {
    const { id, ...data } = req.body;
    try {
      if (id) {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(", ");
        const values = Object.values(data);
        await dbRun(`UPDATE news SET ${setClause} WHERE id = ?`, [...values, id]);
      } else {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(data);
        await dbRun(`INSERT INTO news (${keys.join(", ")}) VALUES (${placeholders})`, values);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save news" });
    }
  });

  // Admin: Delete News
  app.delete("/api/admin/news/:id", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("DELETE FROM news WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete news" });
    }
  });

  // Team: Get All
  app.get("/api/team", async (req, res) => {
    try {
      const team = await dbQuery("SELECT * FROM team");
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
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(", ");
        const values = Object.values(data);
        await dbRun(`UPDATE team SET ${setClause} WHERE id = ?`, [...values, id]);
      } else {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(data);
        await dbRun(`INSERT INTO team (${keys.join(", ")}) VALUES (${placeholders})`, values);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save team member" });
    }
  });

  // Admin: Delete Team Member
  app.delete("/api/admin/team/:id", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("DELETE FROM team WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete team member" });
    }
  });

  // Gallery: Get All
  app.get("/api/gallery", async (req, res) => {
    try {
      const items = await dbQuery("SELECT * FROM gallery");
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
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(", ");
        const values = Object.values(data);
        await dbRun(`UPDATE gallery SET ${setClause} WHERE id = ?`, [...values, id]);
      } else {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(data);
        await dbRun(`INSERT INTO gallery (${keys.join(", ")}) VALUES (${placeholders})`, values);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save gallery item" });
    }
  });

  // Admin: Delete Gallery Item
  app.delete("/api/admin/gallery/:id", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("DELETE FROM gallery WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete gallery item" });
    }
  });

  // Staff Gallery: Get All
  app.get("/api/staff-gallery", async (req, res) => {
    try {
      const items = await dbQuery("SELECT * FROM staff_gallery");
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
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(", ");
        const values = Object.values(data);
        await dbRun(`UPDATE staff_gallery SET ${setClause} WHERE id = ?`, [...values, id]);
      } else {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(data);
        await dbRun(`INSERT INTO staff_gallery (${keys.join(", ")}) VALUES (${placeholders})`, values);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save staff gallery item" });
    }
  });

  // Admin: Delete Staff Gallery Item
  app.delete("/api/admin/staff-gallery/:id", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("DELETE FROM staff_gallery WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete staff gallery item" });
    }
  });

  // Testimonials: Get All
  app.get("/api/testimonials", async (req, res) => {
    try {
      const items = await dbQuery("SELECT * FROM testimonials");
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
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(", ");
        const values = Object.values(data);
        await dbRun(`UPDATE testimonials SET ${setClause} WHERE id = ?`, [...values, id]);
      } else {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(data);
        await dbRun(`INSERT INTO testimonials (${keys.join(", ")}) VALUES (${placeholders})`, values);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save testimonial" });
    }
  });

  // Admin: Delete Testimonial
  app.delete("/api/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete testimonial" });
    }
  });

  // Tailored Investments: Get All
  app.get("/api/tailored-investments", async (req, res) => {
    try {
      const items = await dbQuery("SELECT * FROM tailored_investments");
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
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(", ");
        const values = Object.values(data);
        await dbRun(`UPDATE tailored_investments SET ${setClause} WHERE id = ?`, [...values, id]);
      } else {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(data);
        await dbRun(`INSERT INTO tailored_investments (${keys.join(", ")}) VALUES (${placeholders})`, values);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to save tailored investment" });
    }
  });

  // Admin: Delete Tailored Investment
  app.delete("/api/admin/tailored-investments/:id", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("DELETE FROM tailored_investments WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete tailored investment" });
    }
  });

  // Admin: Get All Contacts/Messages
  app.get("/api/admin/contacts", authenticateAdmin, async (req, res) => {
    try {
      const contacts = await dbQuery("SELECT * FROM contacts ORDER BY created_at DESC");
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch contacts" });
    }
  });

  // Admin: Mark Contact as Read
  app.patch("/api/admin/contacts/:id/read", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("UPDATE contacts SET is_read = 1 WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to mark message as read" });
    }
  });

  // Admin: Delete Contact
  app.delete("/api/admin/contacts/:id", authenticateAdmin, async (req, res) => {
    try {
      await dbRun("DELETE FROM contacts WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to delete contact" });
    }
  });

  // Contact: Submit
  app.post("/api/contacts", async (req, res) => {
    const data = req.body;
    try {
      const keys = Object.keys(data);
      const placeholders = keys.map(() => "?").join(", ");
      const values = Object.values(data);
      await dbRun(`INSERT INTO contacts (${keys.join(", ")}, is_read, created_at) VALUES (${placeholders}, 0, ?)`, [...values, new Date().toISOString()]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error submitting contact:", error);
      res.status(500).json({ success: false, error: "Failed to submit message" });
    }
  });

  // Admin: Upload Image
  app.post("/api/admin/upload", authenticateAdmin, upload.single('image'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    
    try {
      if (isCloudinary) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "trustline"
        });
        // Remove local file after upload to Cloudinary
        fs.unlinkSync(req.file.path);
        res.json({ success: true, imageUrl: result.secure_url });
      } else {
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, imageUrl });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  });

  // --- API CATCH-ALL ---
  // This ensures that any request starting with /api/ that didn't match a route
  // returns a 404 JSON instead of falling through to the SPA catch-all (HTML).
  app.all("/api/*", (req, res) => {
    console.log(`[API 404] ${req.method} ${req.url} - No route matched`);
    res.status(404).json({ 
      success: false, 
      error: `API route not found: ${req.method} ${req.url}`,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`[SERVER] Serving static files from: ${distPath}`);
    if (!fs.existsSync(distPath)) {
      console.error(`[SERVER] ERROR: dist folder not found at ${distPath}`);
    }
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      console.log(`[SPA FALLBACK] ${req.method} ${req.url} - Serving index.html`);
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("index.html not found - build might have failed");
      }
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
