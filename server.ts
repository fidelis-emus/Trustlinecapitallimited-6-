import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "trustline-secret-key-2026";

const db = new Database("trustline.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    min_investment REAL,
    expected_return REAL,
    duration_months INTEGER,
    risk_level TEXT, -- low, medium, high
    category TEXT, -- fixed_income, dollar, portfolio
    image_url TEXT,
    currency TEXT DEFAULT '₦',
    rating INTEGER DEFAULT 5,
    view_rate REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    content TEXT,
    author TEXT,
    image_url TEXT,
    published_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    image_url TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    path TEXT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    content TEXT,
    image_url TEXT,
    rating INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tailored_investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add new columns if they don't exist
try { db.prepare("ALTER TABLE products ADD COLUMN risk_level TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE products ADD COLUMN category TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE products ADD COLUMN currency TEXT DEFAULT '₦'").run(); } catch (e) {}
try { db.prepare("ALTER TABLE products ADD COLUMN rating REAL DEFAULT 5.0").run(); } catch (e) {}
try { db.prepare("ALTER TABLE products ADD COLUMN view_rate REAL DEFAULT 0.0").run(); } catch (e) {}
try { db.prepare("ALTER TABLE contacts ADD COLUMN is_read INTEGER DEFAULT 0").run(); } catch (e) {}

// Seed initial settings
const initialSettings = [
  { key: 'logo_url', value: '/logo.png' },
  { key: 'sec_logo_url', value: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Seal_of_the_United_States_Securities_and_Exchange_Commission.svg/1200px-Seal_of_the_United_States_Securities_and_Exchange_Commission.svg.png' },
  { key: 'site_name', value: 'TRUSTLINE' },
  { key: 'site_subtext', value: 'Capital Limited' },
  { key: 'md_speech_image', value: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000' },
  { key: 'vision_text', value: 'To be the leading asset management firm in Africa revolutionizing the industry through creative options and sustainable growth.' },
  { key: 'mission_text', value: 'Building wealth for our clients and stake holders using innovative asset management solutions.' },
  { key: 'md_speech_text', value: 'At our core, we believe that wealth is not just created — it is carefully nurtured, strategically grown, and responsibly preserved.\n\nAs Managing Director, I am proud to lead a team driven by integrity, innovation, and a deep commitment to our clients’ financial success. In today’s dynamic economic landscape, navigating investment opportunities requires more than just expertise; it demands insight, discipline, and a forward-thinking approach.\n\nOur mission is simple: to help individuals, families, and institutions build sustainable wealth through tailored investment solutions. We understand that every client’s financial journey is unique, which is why we prioritize personalized strategies designed to align with specific goals and risk appetites.\n\nOver the years, we have built a reputation grounded in trust, transparency, and consistent performance. We combine market intelligence with prudent risk management to deliver value that stands the test of time.' },
  { key: 'md_name', value: 'Managing Director Name' },
  { key: 'md_title', value: 'Managing Director' },
  { key: 'enquiries_number', value: '+234 123 456 7890' },
  { key: 'email_address', value: 'info@trustline.com' },
  { key: 'contact_address', value: '123 Business Avenue, Lagos, Nigeria' },
  { key: 'core_values', value: JSON.stringify([
    { title: "Trust", icon: "Shield" },
    { title: "Objectivity", icon: "Target" },
    { title: "Integrity", icon: "CheckCircle2" },
    { title: "Excellence", icon: "Award" },
    { title: "Confidentiality", icon: "Lock" },
    { title: "Team Work", icon: "Users" }
  ])}
];

initialSettings.forEach(s => {
  const exists = db.prepare("SELECT * FROM settings WHERE key = ?").get(s.key);
  if (!exists) {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(s.key, s.value);
  }
});

// Seed Admin if not exists
const adminEmail = "admin@trustline.com";
const adminPassword = "admin123";
const adminExists = db.prepare("SELECT * FROM admin WHERE email = ?").get(adminEmail.toLowerCase()) as any;

if (!adminExists) {
  console.log("Seeding admin user...");
  const hashedAdminPassword = bcrypt.hashSync(adminPassword, 10);
  db.prepare("INSERT INTO admin (email, password) VALUES (?, ?)").run(adminEmail.toLowerCase(), hashedAdminPassword);
  console.log("Admin user seeded.");
} else {
  console.log("Admin user already exists.");
}

// Seed initial products if empty
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const initialProducts = [
    { title: "Fixed Income Fund", description: "Stable returns with low risk. Ideal for conservative investors.", min_investment: 1000, expected_return: 8.5, duration_months: 12, risk_level: "low", category: "fixed_income", image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800", currency: "₦" },
    { title: "Dollar Investment", description: "Hedge against inflation by investing in USD-denominated assets.", min_investment: 100, expected_return: 6.0, duration_months: 12, risk_level: "medium", category: "dollar", image_url: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=800", currency: "$" },
    { title: "Portfolio Management", description: "Professional management of your diversified investment portfolio.", min_investment: 50000, expected_return: 12.0, duration_months: 24, risk_level: "high", category: "portfolio", image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800", currency: "₦" }
  ];
  const insertProduct = db.prepare("INSERT INTO products (title, description, min_investment, expected_return, duration_months, risk_level, category, image_url, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  initialProducts.forEach(p => insertProduct.run(p.title, p.description, p.min_investment, p.expected_return, p.duration_months, p.risk_level, p.category, p.image_url, p.currency));
}

// Seed initial news if empty
const newsCount = db.prepare("SELECT COUNT(*) as count FROM news").get() as { count: number };
if (newsCount.count === 0) {
  const initialNews = [
    { title: "Global Market Trends in 2026", description: "An in-depth look at how emerging markets are shaping the global financial landscape this year.", content: "The financial markets are currently experiencing a period of significant transformation. As we navigate through 2026, several key factors are converging to create new opportunities and challenges for investors worldwide.", author: "Trustline Editorial", image_url: "https://picsum.photos/seed/market/800/600", published_date: "March 20, 2026" },
    { title: "The Rise of Sustainable Investing", description: "Why ESG criteria are becoming a cornerstone for modern portfolio management and long-term growth.", content: "Sustainable investing is no longer a niche market. Investors are increasingly looking for ways to align their financial goals with their values.", author: "Trustline Editorial", image_url: "https://picsum.photos/seed/green/800/600", published_date: "March 15, 2026" },
    { title: "Understanding Fixed Income Assets", description: "A comprehensive guide to navigating the bond market and securing stable returns in volatile times.", content: "Fixed income assets provide a reliable stream of income and can help diversify your investment portfolio.", author: "Trustline Editorial", image_url: "https://picsum.photos/seed/finance/800/600", published_date: "March 10, 2026" },
    { title: "Digital Transformation in Asset Management", description: "How technology and AI are revolutionizing the way we analyze data and manage client wealth.", content: "Technology is changing the face of asset management. From robo-advisors to advanced data analytics, the tools available to investors are more powerful than ever.", author: "Trustline Editorial", image_url: "https://picsum.photos/seed/tech/800/600", published_date: "March 05, 2026" }
  ];
  const insertNews = db.prepare("INSERT INTO news (title, description, content, author, image_url, published_date) VALUES (?, ?, ?, ?, ?, ?)");
  initialNews.forEach(n => insertNews.run(n.title, n.description, n.content, n.author, n.image_url, n.published_date));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

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

  // --- API ROUTES ---

  // Debug: List Admins (REMOVE BEFORE PRODUCTION)
  app.get("/api/debug/admins", (req, res) => {
    const admins = db.prepare("SELECT id, email FROM admin").all();
    res.json(admins);
  });

  // Admin: Login
  app.post("/api/admin/login", async (req, res) => {
    console.log("--- LOGIN ROUTE HIT ---");
    res.setHeader('Content-Type', 'application/json');
    const { email, password } = req.body;
    console.log("Login attempt:", { email });
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    try {
      const admin = db.prepare("SELECT * FROM admin WHERE email = ?").get(email.trim().toLowerCase()) as any;
      console.log("Admin found:", admin ? "Yes" : "No");
      if (admin && await bcrypt.compare(password, admin.password)) {
        console.log("Password match: Yes");
        const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET);
        res.json({ success: true, token, admin: { id: admin.id, email: admin.email, role: 'admin' } });
      } else {
        console.log("Password match: No");
        res.status(401).json({ success: false, error: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, error: "Login failed" });
    }
  });

  // Admin: Get Profile
  app.get("/api/admin/profile", authenticateAdmin, (req: any, res) => {
    const admin = db.prepare("SELECT id, email FROM admin WHERE id = ?").get(req.user.id) as any;
    if (admin) {
      res.json({ success: true, user: { ...admin, role: 'admin' } });
    } else {
      res.status(404).json({ success: false, error: "Admin not found" });
    }
  });

  // Settings: Get Logo
  app.get("/api/settings/logo", (req, res) => {
    const logo = db.prepare("SELECT value FROM settings WHERE key = 'logo_url'").get() as any;
    res.json({ success: true, logo: logo?.value || '/logo.png' });
  });

  // Settings: Get All
  app.get("/api/settings", (req, res) => {
    const allSettings = db.prepare("SELECT * FROM settings").all() as any[];
    const settingsObj: any = {};
    allSettings.forEach(s => {
      if (s.key === 'core_values') {
        try {
          settingsObj[s.key] = JSON.parse(s.value);
        } catch (e) {
          settingsObj[s.key] = [];
        }
      } else {
        settingsObj[s.key] = s.value;
      }
    });
    res.json(settingsObj);
  });

  // Admin: Update All Settings
  app.post("/api/admin/settings", authenticateAdmin, (req, res) => {
    const settings = req.body;
    const upsert = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    db.transaction(() => {
      Object.entries(settings).forEach(([key, value]) => {
        if (key === 'core_values') {
          upsert.run(key, JSON.stringify(value));
        } else if (typeof value === 'string') {
          upsert.run(key, value);
        }
      });
    })();
    res.json({ success: true });
  });

  // Admin: Update Logo
  app.post("/api/admin/settings/logo", authenticateAdmin, upload.single('logo'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const logoUrl = `/uploads/${req.file.filename}`;
    db.prepare("UPDATE settings SET value = ? WHERE key = 'logo_url'").run(logoUrl);
    res.json({ success: true, logoUrl });
  });

  // Admin: Get All Contacts/Messages
  app.get("/api/admin/contacts", authenticateAdmin, (req, res) => {
    const contacts = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
    res.json(contacts);
  });

  // Admin: Mark Contact as Read
  app.patch("/api/admin/contacts/:id/read", authenticateAdmin, (req, res) => {
    db.prepare("UPDATE contacts SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: Delete Contact
  app.delete("/api/admin/contacts/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM contacts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // News: Get All
  app.get("/api/news", (req, res) => {
    const news = db.prepare("SELECT * FROM news ORDER BY created_at DESC").all();
    res.json(news);
  });

  // Admin: Add/Update News
  app.post("/api/admin/news", authenticateAdmin, (req: any, res) => {
    const { id, title, description, content, author, image_url, published_date } = req.body;
    
    if (id) {
      db.prepare(`
        UPDATE news SET 
        title = ?, description = ?, content = ?, author = ?, 
        image_url = ?, published_date = ?
        WHERE id = ?
      `).run(title, description, content, author, image_url, published_date, id);
    } else {
      db.prepare(`
        INSERT INTO news 
        (title, description, content, author, image_url, published_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(title, description, content, author, image_url, published_date);
    }
    res.json({ success: true });
  });

  // Admin: Delete News
  app.delete("/api/admin/news/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM news WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: Upload Image
  app.post("/api/admin/upload", authenticateAdmin, upload.single('image'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  });

  // Admin: Update Product
  app.post("/api/admin/products", authenticateAdmin, upload.single('image'), (req: any, res) => {
    const { id, title, description, min_investment, expected_return, duration_months, risk_level, category, currency, rating, view_rate } = req.body;
    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (id) {
      db.prepare(`
        UPDATE products SET 
        title = ?, description = ?, min_investment = ?, expected_return = ?, 
        duration_months = ?, risk_level = ?, category = ?, image_url = ?, 
        currency = ?, rating = ?, view_rate = ?
        WHERE id = ?
      `).run(title, description, min_investment, expected_return, duration_months, risk_level, category, imageUrl, currency, rating, view_rate, id);
    } else {
      db.prepare(`
        INSERT INTO products 
        (title, description, min_investment, expected_return, duration_months, risk_level, category, image_url, currency, rating, view_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, description, min_investment, expected_return, duration_months, risk_level, category, imageUrl, currency, rating, view_rate);
    }
    res.json({ success: true });
  });

  // Admin: Delete Product
  app.delete("/api/admin/products/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Products: Get All
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
    res.json(products);
  });

  // Contact: Submit
  app.post("/api/contacts", (req, res) => {
    const { firstName, lastName, email, message } = req.body;
    try {
      db.prepare("INSERT INTO contacts (first_name, last_name, email, message) VALUES (?, ?, ?, ?)").run(firstName, lastName, email, message);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to submit message" });
    }
  });

  // Team: Get All
  app.get("/api/team", (req, res) => {
    const team = db.prepare("SELECT * FROM team ORDER BY created_at DESC").all();
    res.json(team);
  });

  // Admin: Add/Update Team Member
  app.post("/api/admin/team", authenticateAdmin, upload.single('image'), (req: any, res) => {
    const { id, name, role, category } = req.body;
    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (id) {
      db.prepare("UPDATE team SET name = ?, role = ?, category = ?, image_url = ? WHERE id = ?").run(name, role, category, imageUrl, id);
    } else {
      db.prepare("INSERT INTO team (name, role, category, image_url) VALUES (?, ?, ?, ?)").run(name, role, category, imageUrl);
    }
    res.json({ success: true });
  });

  // Admin: Delete Team Member
  app.delete("/api/admin/team/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM team WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: Add/Update Tailored Investment
  app.post("/api/admin/tailored-investments", authenticateAdmin, (req, res) => {
    const { id, title, description, image_url } = req.body;
    if (id) {
      db.prepare("UPDATE tailored_investments SET title = ?, description = ?, image_url = ? WHERE id = ?")
        .run(title, description, image_url, id);
    } else {
      db.prepare("INSERT INTO tailored_investments (title, description, image_url) VALUES (?, ?, ?)")
        .run(title, description, image_url);
    }
    res.json({ success: true });
  });

  // Admin: Delete Tailored Investment
  app.delete("/api/admin/tailored-investments/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM tailored_investments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Admin: Add/Update Testimonial
  app.post("/api/admin/testimonials", authenticateAdmin, (req, res) => {
    const { id, name, role, content, image_url, rating } = req.body;
    if (id) {
      db.prepare("UPDATE testimonials SET name = ?, role = ?, content = ?, image_url = ?, rating = ? WHERE id = ?")
        .run(name, role, content, image_url, rating, id);
    } else {
      db.prepare("INSERT INTO testimonials (name, role, content, image_url, rating) VALUES (?, ?, ?, ?, ?)")
        .run(name, role, content, image_url, rating);
    }
    res.json({ success: true });
  });

  // Admin: Delete Testimonial
  app.delete("/api/admin/testimonials/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM testimonials WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Gallery: Get All
  app.get("/api/gallery", (req, res) => {
    const items = db.prepare("SELECT * FROM gallery ORDER BY created_at DESC").all();
    res.json(items);
  });

  // Admin: Add/Update Gallery Item
  app.post("/api/admin/gallery", authenticateAdmin, (req: any, res) => {
    const { id, image_url, caption } = req.body;
    if (id) {
      db.prepare("UPDATE gallery SET image_url = ?, caption = ? WHERE id = ?").run(image_url, caption, id);
    } else {
      db.prepare("INSERT INTO gallery (image_url, caption) VALUES (?, ?)").run(image_url, caption);
    }
    res.json({ success: true });
  });

  // Admin: Delete Gallery Item
  app.delete("/api/admin/gallery/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM gallery WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Staff Gallery: Get All
  app.get("/api/staff-gallery", (req, res) => {
    const items = db.prepare("SELECT * FROM staff_gallery ORDER BY created_at DESC").all();
    res.json(items);
  });

  // Admin: Add/Update Staff Gallery Item
  app.post("/api/admin/staff-gallery", authenticateAdmin, (req: any, res) => {
    const { id, image_url, caption } = req.body;
    if (id) {
      db.prepare("UPDATE staff_gallery SET image_url = ?, caption = ? WHERE id = ?").run(image_url, caption, id);
    } else {
      db.prepare("INSERT INTO staff_gallery (image_url, caption) VALUES (?, ?)").run(image_url, caption);
    }
    res.json({ success: true });
  });

  // Admin: Delete Staff Gallery Item
  app.delete("/api/admin/staff-gallery/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM staff_gallery WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Testimonials: Get All
  app.get("/api/testimonials", (req, res) => {
    const items = db.prepare("SELECT * FROM testimonials ORDER BY created_at DESC").all();
    res.json(items);
  });

  // Admin: Add/Update Testimonial
  app.post("/api/admin/testimonials", authenticateAdmin, (req: any, res) => {
    const { id, name, role, content, image_url, rating } = req.body;
    if (id) {
      db.prepare("UPDATE testimonials SET name = ?, role = ?, content = ?, image_url = ?, rating = ? WHERE id = ?").run(name, role, content, image_url, rating, id);
    } else {
      db.prepare("INSERT INTO testimonials (name, role, content, image_url, rating) VALUES (?, ?, ?, ?, ?)").run(name, role, content, image_url, rating);
    }
    res.json({ success: true });
  });

  // Admin: Delete Testimonial
  app.delete("/api/admin/testimonials/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM testimonials WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Tailored Investments: Get All
  app.get("/api/tailored-investments", (req, res) => {
    const items = db.prepare("SELECT * FROM tailored_investments ORDER BY created_at DESC").all();
    res.json(items);
  });

  // Admin: Add/Update Tailored Investment
  app.post("/api/admin/tailored-investments", authenticateAdmin, (req: any, res) => {
    const { id, title, description, image_url } = req.body;
    if (id) {
      db.prepare("UPDATE tailored_investments SET title = ?, description = ?, image_url = ? WHERE id = ?").run(title, description, image_url, id);
    } else {
      db.prepare("INSERT INTO tailored_investments (title, description, image_url) VALUES (?, ?, ?)").run(title, description, image_url);
    }
    res.json({ success: true });
  });

  // Admin: Delete Tailored Investment
  app.delete("/api/admin/tailored-investments/:id", authenticateAdmin, (req, res) => {
    db.prepare("DELETE FROM tailored_investments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  console.log("Environment mode:", process.env.NODE_ENV || "development");
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite dev server...");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production build from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  const PORT = Number(process.env.PORT) || 8080;
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
