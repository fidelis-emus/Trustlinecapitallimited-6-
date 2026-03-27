import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Calculator as CalcIcon, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  LogOut, 
  Plus, 
  Trash2, 
  Users, 
  LayoutDashboard,
  Menu,
  X,
  Briefcase,
  Edit,
  Upload,
  Settings as SettingsIcon,
  MessageCircle,
  Send,
  Star,
  ChevronRight,
  Target,
  Eye,
  Award,
  Quote
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, useLocation, useNavigate, Navigate, Link } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { 
  SiteSettings, 
  GalleryItem, 
  Testimonial, 
  TailoredInvestment, 
  Product, 
  TeamMember, 
  NewsItem 
} from "./types";

// --- Constants ---
const LOGO_CONFIG = {
  useImage: true, 
  imageUrl: "/logo.png", // User should upload the attached image as 'logo.png' to the root
  text: "TRUSTLINE",
  subtext: "Capital Limited",
  hideTextWhenImageUsed: true // The provided image already contains the text
};

const NEWS_ITEMS = [
  {
    id: 1,
    title: "Global Market Trends in 2026",
    description: "An in-depth look at how emerging markets are shaping the global financial landscape this year.",
    image: "https://picsum.photos/seed/market/800/600",
    date: "March 20, 2026"
  },
  {
    id: 2,
    title: "The Rise of Sustainable Investing",
    description: "Why ESG criteria are becoming a cornerstone for modern portfolio management and long-term growth.",
    image: "https://picsum.photos/seed/green/800/600",
    date: "March 15, 2026"
  },
  {
    id: 3,
    title: "Understanding Fixed Income Assets",
    description: "A comprehensive guide to navigating the bond market and securing stable returns in volatile times.",
    image: "https://picsum.photos/seed/finance/800/600",
    date: "March 10, 2026"
  },
  {
    id: 4,
    title: "Digital Transformation in Asset Management",
    description: "How technology and AI are revolutionizing the way we analyze data and manage client wealth.",
    image: "https://picsum.photos/seed/tech/800/600",
    date: "March 05, 2026"
  }
];

const TAILORED_INVESTMENTS = [
  { id: "01", title: "Mutual Funds", description: "Diversified portfolios managed by experts for optimal growth." },
  { id: "02", title: "Securities", description: "Direct access to equity and debt instruments in the capital market." },
  { id: "03", title: "Commercial Papers", description: "Short-term debt instruments offering competitive yields for liquidity." },
  { id: "04", title: "Dollar Investment", description: "Hedge against currency fluctuations with USD-denominated assets." },
  { id: "05", title: "Naira Investments", description: "Maximize local returns with high-yield NGN investment vehicles." }
];

export default function App() {
  const { user: authUser, logout: authLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.startsWith("/admin");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [staffGallery, setStaffGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tailoredInvestments, setTailoredInvestments] = useState<TailoredInvestment[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    logo_url: "/logo.png",
    sec_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Seal_of_the_United_States_Securities_and_Exchange_Commission.svg/1200px-Seal_of_the_United_States_Securities_and_Exchange_Commission.svg.png",
    site_name: "TRUSTLINE",
    site_subtext: "Capital Limited",
    md_speech_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000",
    vision_text: "To be the leading asset management firm in Africa revolutionizing the industry through creative options and sustainable growth.",
    mission_text: "Building wealth for our clients and stake holders using innovative asset management solutions.",
    md_speech_text: "At our core, we believe that wealth is not just created — it is carefully nurtured, strategically grown, and responsibly preserved.\n\nAs Managing Director, I am proud to lead a team driven by integrity, innovation, and a deep commitment to our clients’ financial success. In today’s dynamic economic landscape, navigating investment opportunities requires more than just expertise; it demands insight, discipline, and a forward-thinking approach.\n\nOur mission is simple: to help individuals, families, and institutions build sustainable wealth through tailored investment solutions. We understand that every client’s financial journey is unique, which is why we prioritize personalized strategies designed to align with specific goals and risk appetites.\n\nOver the years, we have built a reputation grounded in trust, transparency, and consistent performance. We combine market intelligence with prudent risk management to deliver value that stands the test of time.",
    core_values: [
      { title: "Trust", icon: "Shield" },
      { title: "Objectivity", icon: "Target" },
      { title: "Integrity", icon: "CheckCircle2" },
      { title: "Excellence", icon: "Award" },
      { title: "Confidentiality", icon: "Lock" },
      { title: "Team Work", icon: "Users" }
    ]
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchNews();
    fetchSettings();
    fetchGallery();
    fetchStaffGallery();
    fetchTestimonials();
    fetchTailoredInvestments();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
      setTestimonials([]);
    }
  };

  const fetchTailoredInvestments = async () => {
    try {
      const res = await fetch("/api/tailored-investments");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      setTailoredInvestments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tailored investments", err);
      setTailoredInvestments([]);
    }
  };

  const fetchStaffGallery = async () => {
    try {
      const res = await fetch("/api/staff-gallery");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      setStaffGallery(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch staff gallery", err);
      setStaffGallery([]);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      setGallery(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch gallery", err);
      setGallery([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch news", err);
      setNews([]);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      if (data && data.logo_url) {
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const logout = () => {
    authLogout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation - Hidden on Admin routes */}
      {!isAdminPath && (
        <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <Logo settings={settings} />
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-8">
                <NavLink label="Home" active={location.pathname === "/"} onClick={() => navigate("/")} />
                <NavLink label="About" active={location.pathname === "/about"} onClick={() => navigate("/about")} />
                <NavLink label="Products" active={location.pathname === "/products"} onClick={() => navigate("/products")} />
                <NavLink label="Team" active={location.pathname === "/team"} onClick={() => navigate("/team")} />
                <NavLink label="Gallery" active={location.pathname === "/gallery"} onClick={() => navigate("/gallery")} />
                <NavLink label="News" active={location.pathname === "/news"} onClick={() => navigate("/news")} />
                <NavLink label="Calculator" active={location.pathname === "/calculator"} onClick={() => navigate("/calculator")} />
                <NavLink label="Contact" active={location.pathname === "/contact"} onClick={() => navigate("/contact")} />
                
                <a 
                  href="https://app.trustlinecapitallimited.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-accent hover:bg-accent-hover text-primary px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg ml-4"
                >
                  Open Account
                </a>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-primary/95 border-t border-white/10"
              >
                <div className="px-4 pt-2 pb-6 space-y-2">
                  <MobileNavLink label="Home" onClick={() => { navigate("/"); setIsMenuOpen(false); }} />
                  <MobileNavLink label="About" onClick={() => { navigate("/about"); setIsMenuOpen(false); }} />
                  <MobileNavLink label="Products" onClick={() => { navigate("/products"); setIsMenuOpen(false); }} />
                  <MobileNavLink label="Team" onClick={() => { navigate("/team"); setIsMenuOpen(false); }} />
                  <MobileNavLink label="Gallery" onClick={() => { navigate("/gallery"); setIsMenuOpen(false); }} />
                  <MobileNavLink label="News" onClick={() => { navigate("/news"); setIsMenuOpen(false); }} />
                  <MobileNavLink label="Calculator" onClick={() => { navigate("/calculator"); setIsMenuOpen(false); }} />
                  <MobileNavLink label="Contact" onClick={() => { navigate("/contact"); setIsMenuOpen(false); }} />
                  <div className="pt-4">
                    <a 
                      href="https://app.trustlinecapitallimited.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full bg-accent hover:bg-accent-hover text-primary text-center px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg"
                    >
                      Open Account
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          {/* Website Routes */}
          <Route path="/" element={<HomePage setPage={(p) => navigate(`/${p === 'home' ? '' : p}`)} products={products} news={news} settings={settings} setSelectedNews={(n) => { setSelectedNews(n); navigate("/news-detail"); }} testimonials={testimonials} tailoredInvestments={tailoredInvestments} />} />
          <Route path="/about" element={<AboutPage settings={settings} staffGallery={staffGallery} />} />
          <Route path="/products" element={<ProductsPage products={products} setPage={(p) => navigate(`/${p}`)} />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/gallery" element={<GalleryPage gallery={gallery} />} />
          <Route path="/news" element={<NewsPage news={news} setPage={(p) => navigate(`/${p}`)} setSelectedNews={(n) => { setSelectedNews(n); navigate("/news-detail"); }} />} />
          <Route path="/news-detail" element={<NewsDetailPage news={selectedNews} setPage={(p) => navigate(`/${p === 'home' ? '' : p}`)} />} />
          <Route path="/calculator" element={<CalculatorPage products={products} />} />
          <Route path="/contact" element={<ContactPage settings={settings} />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage settings={settings} />} />
          <Route path="/admin" element={
            authUser?.role === 'admin' ? (
              <AdminPanel 
                products={products} 
                fetchProducts={fetchProducts} 
                news={news} 
                fetchNews={fetchNews} 
                siteSettings={settings} 
                fetchSettings={fetchSettings} 
                gallery={gallery} 
                fetchGallery={fetchGallery} 
                staffGallery={staffGallery} 
                fetchStaffGallery={fetchStaffGallery} 
                testimonials={testimonials} 
                fetchTestimonials={fetchTestimonials} 
                tailoredInvestments={tailoredInvestments} 
                fetchTailoredInvestments={fetchTailoredInvestments} 
                logout={logout}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="mb-6 hover:opacity-80 transition-opacity block">
                <Logo settings={settings} />
              </Link>
              <p className="text-white/60 text-sm leading-relaxed">
                {settings.site_name} {settings.site_subtext} is a leading asset management firm dedicated to providing innovative investment solutions and superior returns for our clients.
              </p>
            </div>
            <div>
              <h4 className="text-accent font-bold mb-6 uppercase text-xs tracking-widest">Quick Links</h4>
              <ul className="space-y-4 text-sm text-white/70">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/team" className="hover:text-white transition-colors">Our Team</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Investment Products</Link></li>
                <li><Link to="/calculator" className="hover:text-white transition-colors">Calculator</Link></li>
                <li><a href="https://app.trustlinecapitallimited.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-bold">Open Account</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-accent font-bold mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-white/70">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-accent font-bold mb-6 uppercase text-xs tracking-widest">Contact Info</h4>
              <ul className="space-y-4 text-sm text-white/70">
                <li className="flex items-start">
                  <Mail size={16} className="mr-3 text-accent mt-1 flex-shrink-0" />
                  <span>{settings.email_address}</span>
                </li>
                <li className="flex items-start">
                  <Phone size={16} className="mr-3 text-accent mt-1 flex-shrink-0" />
                  <span>{settings.enquiries_number}</span>
                </li>
                <li className="flex items-start">
                  <Briefcase size={16} className="mr-3 text-accent mt-1 flex-shrink-0" />
                  <span>{settings.contact_address}</span>
                </li>
                <li className="flex items-start">
                  <Shield size={16} className="mr-3 text-accent mt-1 flex-shrink-0" />
                  <span>SEC Registered & Regulated</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Trustline Capital Limited. All rights reserved.
          </div>
        </div>
      </footer>

      <WhatsAppChat />
    </div>
  );
}


function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = "2347067829425";
  const message = "Hello, I would like to speak with a CRM officer.";

  const handleChat = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-72 mb-4 overflow-hidden border border-slate-100"
          >
            <div className="bg-primary p-4 text-white flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">CRM Officer</h4>
                  <p className="text-[10px] text-white/70">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-slate-50">
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-slate-700 mb-4 max-w-[90%]">
                Hello! How can we help you today?
              </div>
              <button 
                onClick={handleChat}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg"
              >
                <MessageCircle size={18} className="mr-2" />
                Start WhatsApp Chat
              </button>
            </div>
            <div className="p-2 text-center bg-white border-t border-slate-50">
              <p className="text-[10px] text-slate-400">Trustline Capital Support</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#25D366] hover:bg-[#128C7E] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}

// --- Components ---
function Logo({ settings, className = "" }: { settings: SiteSettings, className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="h-10 w-auto flex items-center justify-center mr-2 overflow-hidden">
        <img 
          src={settings.logo_url || '/logo.png'} 
          alt="Logo" 
          className="h-full w-auto object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="hidden sm:block">
        <span className="text-xl font-bold tracking-tight text-white">{settings.site_name}</span>
        <span className="block text-[10px] text-accent font-semibold tracking-[0.2em] uppercase">{settings.site_subtext}</span>
      </div>
    </div>
  );
}

function NavLink({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`text-sm font-medium transition-all relative py-2 ${active ? 'text-accent' : 'text-white/80 hover:text-white'}`}
    >
      {label}
      {active && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
    </button>
  );
}

function MobileNavLink({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="block w-full text-left py-3 text-white/80 hover:text-accent font-medium transition-colors"
    >
      {label}
    </button>
  );
}

// --- Pages ---

function TailoredInvestmentsSection({ tailoredInvestments }: { tailoredInvestments: TailoredInvestment[] }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">OUR TAILORED INVESTMENTS</h2>
          <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {(tailoredInvestments.length > 0 ? tailoredInvestments : TAILORED_INVESTMENTS).map((item: any, idx: number) => (
            <motion.div 
              key={item.id || idx}
              whileHover={{ y: -10 }}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col h-full transition-all hover:shadow-xl hover:bg-white"
            >
              <div className="text-4xl font-black text-accent/20 mb-6">{item.id || String(idx + 1).padStart(2, '0')}</div>
              <h3 className="text-xl font-bold mb-4 text-primary">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
              {item.image_url && (
                <div className="mt-4 rounded-xl overflow-hidden h-32">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSection({ setPage, setSelectedNews, news: newsData }: { setPage: (p: string) => void, setSelectedNews: (n: NewsItem) => void, news: NewsItem[] }) {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">News, Insights & Market Updates</h2>
            <div className="w-20 h-1 bg-accent rounded-full"></div>
          </div>
          <button 
            onClick={() => setPage("news")}
            className="hidden md:flex items-center text-primary font-bold hover:text-accent transition-colors"
          >
            Visit Our News <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {newsData.slice(0, 4).map((news) => (
            <motion.div 
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full group"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={news.image_url} 
                  alt={news.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Market News
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{news.date}</div>
                <h3 className="text-lg font-bold mb-3 text-primary group-hover:text-accent transition-colors line-clamp-2">{news.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{news.description}</p>
                <button 
                  onClick={() => {
                    setSelectedNews(news);
                    setPage("news-detail");
                    window.scrollTo(0, 0);
                  }}
                  className="mt-auto flex items-center text-sm font-bold text-primary hover:text-accent transition-colors"
                >
                  Read More <ArrowRight size={14} className="ml-2" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <button 
            onClick={() => setPage("news")}
            className="inline-flex items-center bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg"
          >
            Visit Our News <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}

function GalleryPage({ gallery, key }: { gallery: GalleryItem[], key?: string }) {
  return (
    <motion.div 
      key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white"
    >
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Gallery</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            A visual journey through our milestones, events, and community impact.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gallery.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative aspect-square overflow-hidden rounded-3xl shadow-lg"
              >
                <img 
                  src={item.image_url} 
                  alt={item.caption} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                {item.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                    <p className="text-white font-medium text-lg">{item.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {gallery.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              No gallery items to display.
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

function NewsPage({ setPage, setSelectedNews, news: newsData }: { setPage: (p: string) => void, setSelectedNews: (n: NewsItem) => void, news: NewsItem[], key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="pt-32 pb-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Trustline <span className="text-accent italic">News</span></h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Stay informed with the latest market updates, financial strategies, and economic analysis from our team of experts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {newsData.map((news) => (
              <motion.article 
                key={news.id}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="md:flex">
                  <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
                    <img 
                      src={news.image_url} 
                      alt={news.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="md:w-3/5 p-8 md:p-10 flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Market Update</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{news.date}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-primary group-hover:text-accent transition-colors">{news.title}</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                      {news.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                          <User size={14} className="text-slate-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{news.author || "Trustline Editorial"}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedNews(news);
                          setPage("news-detail");
                          window.scrollTo(0, 0);
                        }}
                        className="text-primary font-bold text-sm flex items-center hover:text-accent transition-colors"
                      >
                        Continue Reading <ArrowRight size={16} className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="lg:col-span-1 space-y-10">
            <div className="bg-primary rounded-[2rem] p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Subscribe to Newsletter</h3>
              <p className="text-white/70 text-sm mb-8">Get the latest insights delivered directly to your inbox every week.</p>
              <form className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all"
                />
                <button className="w-full bg-accent text-primary font-bold py-3 rounded-xl hover:bg-accent-hover transition-all">
                  Subscribe Now
                </button>
              </form>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-8">
              <h3 className="text-xl font-bold mb-6">Categories</h3>
              <ul className="space-y-4">
                {['Market Analysis', 'Investment Tips', 'Economic News', 'Company Updates', 'Financial Planning'].map(cat => (
                  <li key={cat} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-slate-600 group-hover:text-primary transition-colors">{cat}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-accent transition-all" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-8">
              <h3 className="text-xl font-bold mb-6">Recent Posts</h3>
              <div className="space-y-6">
                {newsData.slice(0, 3).map(news => (
                  <div 
                    key={news.id} 
                    className="flex gap-4 group cursor-pointer"
                    onClick={() => {
                      setSelectedNews(news);
                      setPage("news-detail");
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary group-hover:text-accent transition-colors line-clamp-2">{news.title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{news.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NewsDetailPage({ news, setPage }: { news: NewsItem | null, setPage: (p: string) => void, key?: string }) {
  if (!news) {
    setPage("news");
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="pt-32 pb-24"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => setPage("news")}
          className="flex items-center text-slate-500 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowRight size={18} className="mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to News
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-accent/20 text-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Market Update
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {news.date}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8 leading-tight">{news.title}</h1>
          
          <div className="flex items-center mb-12 pb-12 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mr-4">
              <User size={20} className="text-slate-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-primary">{news.author || "Trustline Editorial Team"}</div>
              <div className="text-xs text-slate-400 font-medium">Senior Financial Analysts</div>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl">
            <img 
              src={news.image_url} 
              alt={news.title} 
              className="w-full h-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
            {news.description}
          </p>
          
          <div className="space-y-6 text-slate-600 leading-relaxed whitespace-pre-wrap">
            {news.content}
          </div>

          <div className="mt-16 pt-12 border-t border-slate-100">
            <div className="flex flex-wrap gap-4">
              {['Finance', 'Investment', 'Economy', 'Market Update', 'Trustline'].map(tag => (
                <span key={tag} className="bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HomePage({ setPage, products, news, settings, setSelectedNews, testimonials, tailoredInvestments, key }: { setPage: (p: string) => void, products: Product[], news: NewsItem[], settings: SiteSettings, setSelectedNews: (n: NewsItem) => void, testimonials: Testimonial[], tailoredInvestments: TailoredInvestment[], key?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Hero Section */}
      <section className="hero-gradient h-[85vh] flex items-center text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest border border-accent/30">
                Trusted Asset Management
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
              Grow Your Wealth with <span className="text-accent italic">Confidence</span>
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              Experience professional-grade investment strategies tailored to your financial goals. We combine data-driven insights with decades of expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://app.trustlinecapitallimited.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accent hover:bg-accent-hover text-primary px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl flex items-center justify-center"
              >
                Open Account <ArrowRight className="ml-2" size={20} />
              </a>
              <button 
                onClick={() => setPage("products")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-lg transition-all border border-white/20"
              >
                View Products
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <BarChart3 className="w-full h-full" />
        </div>
      </section>

      {/* SEC Regulation Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            {settings.sec_logo_url && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm"
              >
                <img 
                  src={settings.sec_logo_url} 
                  alt="SEC Logo" 
                  className="h-32 md:h-48 object-contain" 
                  referrerPolicy="no-referrer" 
                />
                <div className="mt-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">SEC Regulated</span>
                </div>
              </motion.div>
            )}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-grow text-center md:text-left"
            >
              <h2 className="text-2xl md:text-3xl font-black text-primary mb-6 tracking-tighter">
                AT TRUSTLINE CAPITAL LIMITED
              </h2>
              <p className="text-xl md:text-3xl text-slate-600 leading-tight font-light italic">
                "We are committed to manage funds for investors all around Nigeria and in the diaspora with the desire to be the more reliable, trusted and efficient fund managers."
              </p>
              <div className="mt-8 w-20 h-1 bg-accent mx-auto md:mx-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tailored Investments Section */}
      <TailoredInvestmentsSection tailoredInvestments={tailoredInvestments} />

      {/* News Section */}
      <NewsSection setPage={setPage} setSelectedNews={setSelectedNews} news={news} />

      {/* Highlights */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Trustline?</h2>
            <div className="w-20 h-1 bg-accent mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <HighlightCard 
              icon={<Shield className="text-accent" size={32} />}
              title="SEC Licensed & Compliant"
              description="Operating with the highest standards of regulatory compliance and professionalism."
            />
            <HighlightCard 
              icon={<Users className="text-accent" size={32} />}
              title="Experienced Financial Experts"
              description="Our team brings decades of combined expertise in asset management and financial advisory."
            />
            <HighlightCard 
              icon={<Target className="text-accent" size={32} />}
              title="Tailored Investment Plans"
              description="Strategies designed to align with your unique financial goals and risk appetite."
            />
            <HighlightCard 
              icon={<TrendingUp className="text-accent" size={32} />}
              title="Proven Risk Management Strategy"
              description="Disciplined approach to capital preservation and sustainable long-term growth."
            />
            <HighlightCard 
              icon={<CheckCircle2 className="text-accent" size={32} />}
              title="Transparent Operations"
              description="Full visibility into your investments and our performance at all times."
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Investment Products</h2>
              <p className="text-slate-500">Explore our top-performing funds curated for your growth.</p>
            </div>
            <button onClick={() => setPage("products")} className="text-accent font-bold flex items-center hover:underline">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.slice(0, 3).map(product => (
              <ProductCard key={product.id} product={product} setPage={setPage} />
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection setPage={setPage} setSelectedNews={setSelectedNews} news={news} />

      {/* Tailored Investments Section */}
      <TailoredInvestmentsSection tailoredInvestments={tailoredInvestments} />

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-bold uppercase tracking-widest text-xs mb-4 block">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <div className="w-20 h-1 bg-accent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative"
              >
                <Quote className="text-accent/20 absolute top-8 right-8" size={48} />
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-accent">
                    <img src={t.image_url || `https://i.pravatar.cc/150?u=${t.id}`} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-primary">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-slate-600 italic leading-relaxed">"{t.content}"</p>
              </motion.div>
            ))}
            {testimonials.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400 italic">
                No testimonials yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your investment journey?</h2>
          <p className="text-white/70 mb-10 text-lg">Join thousands of investors building their future with Trustline Capital.</p>
          <a 
            href="https://app.trustlinecapitallimited.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-accent hover:bg-accent-hover text-primary px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl inline-block"
          >
            Open Account
          </a>
        </div>
      </section>
    </motion.div>
  );
}

function HighlightCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 card-hover">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ProductCard({ product, setPage }: { product: Product, setPage: (p: string) => void, key?: any }) {
  const [showRate, setShowRate] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 card-hover flex flex-col h-full group">
      <div className="h-48 overflow-hidden relative">
        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        
        {/* Rate Overlay - Displayed when showRate is true */}
        <AnimatePresence>
          {showRate && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-primary/95 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 p-4 text-center"
            >
              <div className="text-accent text-[10px] uppercase font-bold tracking-widest mb-2">Expected Annual Return</div>
              <div className="text-5xl font-black mb-6">{product.expected_return}%</div>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowRate(false); }}
                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-xs font-bold transition-all border border-white/20"
              >
                Close Rate
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating Stars - Reveals on Hover or Scroll */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1 }}
          className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              className={i < (product.rating || 5) ? "text-yellow-500 fill-yellow-500" : "text-slate-300"} 
            />
          ))}
          <span className="text-[10px] font-bold text-slate-700 ml-1">{(product.rating || 5).toFixed(1)}</span>
        </motion.div>
      </div>
      <div className="p-8 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-3">{product.title}</h3>
        <p className="text-slate-600 text-sm mb-6 flex-grow">{product.description}</p>
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Min. Investment</span>
            <span className="font-bold">{product.currency || '₦'}{product.min_investment.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Duration</span>
            <span className="font-bold">{product.duration_months} Months</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mt-8">
          <button 
            onClick={() => setShowRate(true)}
            className="py-3 rounded-xl border-2 border-accent text-primary font-bold hover:bg-accent transition-all text-sm"
          >
            View Rate
          </button>
        </div>
      </div>
    </div>
  );
}

function AboutPage({ settings, staffGallery, key }: { settings: SiteSettings, staffGallery: GalleryItem[], key?: string }) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Shield": return <Shield size={24} />;
      case "Target": return <Target size={24} />;
      case "CheckCircle2": return <CheckCircle2 size={24} />;
      case "Award": return <Award size={24} />;
      case "Lock": return <Lock size={24} />;
      case "Users": return <Users size={24} />;
      default: return <Shield size={24} />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white">
      {/* Hero Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <span className="text-accent font-bold uppercase tracking-widest text-xs mb-4 block">About Us</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-primary leading-tight">Trustline Capital Limited</h2>
              <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p>
                  Trustline Capital Limited is a forward-thinking asset management company established in 2021, committed to delivering innovative and reliable financial solutions. As a company duly licensed by the Securities and Exchange Commission (SEC), we operate with the highest standards of professionalism, transparency, and regulatory compliance.
                </p>
                <p>
                  Since our inception, we have focused on helping individuals, businesses, and institutions grow and preserve their wealth through strategic investment management. Our approach is built on deep market insight, disciplined risk management, and a strong understanding of our clients’ unique financial goals.
                </p>
                <p>
                  At Trustline Capital Limited, we recognize that no two investors are the same. This is why we offer tailored investment strategies designed to align with varying risk appetites and long-term objectives. From portfolio management to wealth advisory services, we are dedicated to creating sustainable value for our clients.
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1000" 
                alt="Trustline Office" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -left-8 bg-accent p-8 rounded-2xl shadow-xl hidden lg:block">
                <div className="text-primary font-bold text-xl mb-1">Established 2021</div>
                <div className="text-primary/70 text-sm">SEC Licensed & Compliant</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white/5 p-12 rounded-3xl border border-white/10 backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-8">
                <Eye className="text-primary" size={32} />
              </div>
              <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
              <p className="text-white/70 text-lg leading-relaxed">
                {settings.vision_text}
              </p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white/5 p-12 rounded-3xl border border-white/10 backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-8">
                <Target className="text-primary" size={32} />
              </div>
              <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
              <p className="text-white/70 text-lg leading-relaxed">
                {settings.mission_text}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Values</h2>
            <div className="w-20 h-1 bg-accent mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {settings.core_values.map((value, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-100"
              >
                <div className="text-accent flex justify-center mb-4">{getIcon(value.icon)}</div>
                <div className="font-bold text-primary">{value.title}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Philosophy */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Approach / Investment Philosophy</h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                At Trustline Capital Limited, we take a disciplined and client-focused approach to investing. We combine in-depth research, market insight, and effective risk management to build tailored strategies that align with each client’s goals.
              </p>
              <p>
                Rather than focusing on short-term gains, we prioritize sustainable growth, capital preservation, and long-term value. Our commitment to transparency, integrity, and smart decision-making ensures that our clients’ investments are managed with care and confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MD Speech */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-20 text-white">
                <Quote className="text-accent mb-8" size={48} />
                <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">Managing Director’s Speech</h2>
                <div className="space-y-6 text-white/80 leading-relaxed italic whitespace-pre-line">
                  {settings.md_speech_text}
                </div>
                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="font-bold text-xl text-accent">{settings.md_name}</div>
                  <div className="text-white/60">{settings.md_title}</div>
                </div>
              </div>
              <div className="relative h-full min-h-[400px]">
                <img 
                  src={settings.md_speech_image} 
                  alt="Managing Director" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Gallery */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Staff Gallery</h2>
            <div className="w-20 h-1 bg-accent mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staffGallery.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="aspect-square rounded-3xl overflow-hidden shadow-lg"
              >
                <img 
                  src={item.image_url} 
                  alt={item.caption} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
          {staffGallery.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              No staff gallery images yet.
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <div className="w-20 h-1 bg-accent mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "SEC Licensed & Compliant", desc: "Operating with the highest standards of regulatory compliance." },
              { title: "Experienced Financial Experts", desc: "Our team brings decades of combined expertise in asset management." },
              { title: "Tailored Investment Plans", desc: "Strategies designed to align with your unique financial goals." },
              { title: "Proven Risk Management Strategy", desc: "Disciplined approach to capital preservation and growth." },
              { title: "Transparent Operations", desc: "Full visibility into your investments and our performance." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-start">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-4 text-accent flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function ProductsPage({ products, setPage }: { products: Product[], setPage: (p: string) => void, key?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Investment Products</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Choose from our diverse range of investment funds designed to match your risk profile and return expectations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} setPage={setPage} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TeamPage({ key }: { key?: string } = {}) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/team")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Expected JSON response but got " + contentType);
        }
        return res.json();
      })
      .then(data => {
        setTeam(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch team", err);
        setTeam([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-slate-500">Loading our team...</p>
      </div>
    );
  }

  const board = team.filter(m => m.category === "board");
  const management = team.filter(m => m.category === "management");
  const staff = team.filter(m => m.category === "staff");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="text-accent font-bold uppercase tracking-widest text-xs mb-4 block">Our People</span>
          <h2 className="text-4xl font-bold mb-4">Meet the Experts Behind Your Success</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Our team brings together decades of experience in global markets and asset management.</p>
        </div>

        {/* Board of Directors */}
        {board.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center mb-12">
              <div className="h-px bg-slate-200 flex-grow"></div>
              <h3 className="px-6 text-2xl font-bold text-primary">Board of Directors</h3>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {board.map(member => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </section>
        )}

        {/* Management Gallery */}
        {management.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center mb-12">
              <div className="h-px bg-slate-200 flex-grow"></div>
              <h3 className="px-6 text-2xl font-bold text-primary">Management Gallery</h3>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {management.map(member => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </section>
        )}

        {/* Staff Gallery */}
        {staff.length > 0 && (
          <section>
            <div className="flex items-center mb-12">
              <div className="h-px bg-slate-200 flex-grow"></div>
              <h3 className="px-6 text-2xl font-bold text-primary">Staff Gallery</h3>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {staff.map(member => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

function TeamCard({ member }: { member: TeamMember, key?: any }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 group"
    >
      <div className="h-72 overflow-hidden relative">
        <img 
          src={member.image_url} 
          alt={member.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="text-white">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Trustline Capital</p>
            <p className="text-sm italic opacity-80">"Dedicated to your financial growth."</p>
          </div>
        </div>
      </div>
      <div className="p-6 text-center">
        <h4 className="font-bold text-lg text-primary mb-1">{member.name}</h4>
        <p className="text-slate-500 text-sm">{member.role}</p>
      </div>
    </motion.div>
  );
}

function CalculatorPage({ products, key }: { products: Product[], key?: string }) {
  const [amount, setAmount] = useState<number>(1000);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);
  const [duration, setDuration] = useState<number>(12);
  const [result, setResult] = useState<{ 
    total: number, 
    grossProfit: number, 
    tax: number, 
    netProfit: number 
  } | null>(null);

  const calculate = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const grossProfit = (amount * (product.expected_return / 100)) * (duration / 12);
    const tax = grossProfit * 0.10; // 10% withholding tax
    const netProfit = grossProfit - tax;
    
    setResult({
      total: amount + netProfit,
      grossProfit: grossProfit,
      tax: tax,
      netProfit: netProfit
    });
  };

  useEffect(() => {
    if (products.length > 0) {
      const firstProduct = products[0];
      setSelectedProductId(firstProduct.id);
      setDuration(firstProduct.duration_months);
    }
  }, [products]);

  const handleProductChange = (productId: number) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setDuration(product.duration_months);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-primary text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="p-10 md:w-1/2 bg-primary/50">
            <div className="flex items-center mb-8">
              <CalcIcon className="text-accent mr-3" size={28} />
              <h2 className="text-2xl font-bold">Investment Calculator</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-white/40">{products.find(p => p.id === selectedProductId)?.currency || '₦'}</span>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Select Product</label>
                <select 
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} className="text-primary">{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Duration (Months)</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                >
                  {[3, 6, 9, 12, 18, 24, 36].map(m => (
                    <option key={m} value={m} className="text-primary">{m} Months</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={calculate}
                className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-4 rounded-xl transition-all shadow-lg mt-4"
              >
                Calculate Returns
              </button>
            </div>
          </div>
          
          <div className="p-10 md:w-1/2 gold-gradient text-primary flex flex-col justify-center items-center text-center">
            {result ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
                <div className="text-sm font-bold uppercase tracking-widest mb-2 opacity-60">Maturity Value</div>
                <div className="text-4xl font-bold mb-8">{products.find(p => p.id === selectedProductId)?.currency || '₦'}{result.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                
                <div className="space-y-3 w-full border-t border-primary/10 pt-8 text-left">
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-60">Interest Rate</span>
                    <span className="font-bold">{products.find(p => p.id === selectedProductId)?.expected_return}% p.a.</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-60">Principal</span>
                    <span className="font-bold">{products.find(p => p.id === selectedProductId)?.currency || '₦'}{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-60">Gross Interest</span>
                    <span className="font-bold">{products.find(p => p.id === selectedProductId)?.currency || '₦'}{result.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-red-600">
                    <span className="opacity-60">Withholding Tax (10%)</span>
                    <span className="font-bold">-{products.find(p => p.id === selectedProductId)?.currency || '₦'}{result.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-primary/5 pt-2">
                    <span className="opacity-60 font-bold">Net Interest</span>
                    <span className="font-bold">{products.find(p => p.id === selectedProductId)?.currency || '₦'}{result.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center">
                <CalcIcon size={64} className="mx-auto mb-6 opacity-20" />
                <p className="font-medium opacity-60">Enter your investment details to see estimated returns.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ContactPage({ settings, key }: { settings: SiteSettings, key?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to send message. Please try again.");
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Contact error:", error);
      if (error.name === 'AbortError') {
        alert("Request timed out. The server is taking too long to respond. Please check your SMTP settings in Railway.");
      } else {
        alert("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Message Sent!</h2>
          <p className="text-slate-600 text-lg">
            Thank you for your message. We’ll get back to you shortly.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="mt-8 text-primary font-bold hover:underline"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
            <p className="text-slate-600 mb-10 leading-relaxed">
              Have questions about our investment products or need assistance with your account? Our team of experts is here to help you.
            </p>
            
            <div className="mb-12">
              <a 
                href="https://app.trustlinecapitallimited.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accent hover:bg-accent-hover text-primary px-8 py-4 rounded-full font-bold transition-all shadow-lg inline-flex items-center"
              >
                Open Your Account <ArrowRight className="ml-2" size={18} />
              </a>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 text-accent">
                  <Mail />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Email Us</h4>
                  <p className="text-slate-500">{settings.email_address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 text-accent">
                  <Phone />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Call Us</h4>
                  <p className="text-slate-500">{settings.enquiries_number}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mr-4 text-accent">
                  <Briefcase />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Office Address</h4>
                  <p className="text-slate-500">{settings.contact_address}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                  <input 
                    type="text" required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                  <input 
                    type="text" required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea 
                  rows={4} required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
                ></textarea>
              </div>
              <button 
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AdminLoginPage({ settings, key }: { settings: SiteSettings, key?: string }) {
  const { login, user, token, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("[AdminLoginPage] Auth state:", { 
      hasUser: !!user, 
      hasToken: !!token, 
      isLoading,
      userEmail: user?.email 
    });
    if (user && !isLoading) {
      console.log("[AdminLoginPage] User already logged in, redirecting to /admin");
      navigate("/admin");
    }
  }, [user, token, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      console.log("Attempting login for:", email);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const text = await res.text();
      console.log("Login response status:", res.status);
      console.log("Login response text:", text);
      
      if (!text) {
        if (res.status === 405) {
          setError(`Server returned 405 Method Not Allowed. This usually means the API route is being blocked or misrouted. Please check server logs.`);
        } else {
          setError(`Server returned an empty response (${res.status})`);
        }
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", text);
        setError(`Server returned non-JSON response (${res.status})`);
        return;
      }
      
      console.log("Login response data:", data);
      
      if (data.success) {
        const adminData = data.admin;
        login(data.token, { ...adminData, role: 'admin' });
        navigate("/admin");
      } else {
        setError(data.error || "Invalid admin credentials");
      }
    } catch (err: any) {
      console.error("Login fetch error:", err);
      setError(err.message || "Connection failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-primary p-8 text-center text-white">
          <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Admin Portal v1.3</h2>
          <p className="text-green-400 text-xs font-mono mt-1">DEBUG MODE ENABLED - CHECK CONSOLE</p>
          <p className="text-white/60 text-sm mt-2">Access Trustline CMS</p>
          {settings.sec_logo_url && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Regulated by</span>
              <img src={settings.sec_logo_url} alt="SEC Logo" className="h-8 object-contain brightness-0 invert opacity-50" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>
        
        <div className="p-8">
          {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 flex items-center"><X size={16} className="mr-2" /> {error}</div>}
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-accent" 
                  placeholder="admin@trustline.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-accent" 
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg">
              Sign In to Admin
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

const TeamAdminCard: React.FC<{ m: TeamMember, setEditingMember: (m: TeamMember) => void, handleDeleteMember: (id: number) => any }> = ({ m, setEditingMember, handleDeleteMember }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group hover:shadow-md transition-all">
      <div className="h-40 overflow-hidden relative">
        <img src={m.image_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setEditingMember(m)} 
            className="bg-white/90 px-2 py-1 rounded-lg text-primary hover:text-accent transition-colors shadow-sm flex items-center text-xs font-bold"
          >
            <Edit size={14} className="mr-1" /> Modify
          </button>
          <button onClick={() => handleDeleteMember(m.id)} className="bg-white/90 p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors shadow-sm">
            <Trash2 size={16} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm ${
            m.category === 'management' ? 'bg-accent text-primary' : 
            m.category === 'board' ? 'bg-slate-800 text-white' : 
            'bg-primary text-white'
          }`}>
            {m.category}
          </span>
        </div>
      </div>
      <div className="p-4 text-center">
        <h4 className="font-bold text-sm mb-1">{m.name}</h4>
        <p className="text-slate-500 text-[10px]">{m.role}</p>
      </div>
    </div>
  );
};

function AdminPanel({ products, fetchProducts, siteSettings, fetchSettings, news, fetchNews, gallery, fetchGallery, staffGallery, fetchStaffGallery, testimonials, fetchTestimonials, tailoredInvestments, fetchTailoredInvestments, logout, key }: { 
  products: Product[], 
  fetchProducts: () => void | Promise<void>, 
  siteSettings: SiteSettings, 
  fetchSettings: () => void | Promise<void>, 
  news: NewsItem[], 
  fetchNews: () => void | Promise<void>, 
  gallery: GalleryItem[], 
  fetchGallery: () => void | Promise<void>, 
  staffGallery: GalleryItem[], 
  fetchStaffGallery: () => void | Promise<void>,
  testimonials: Testimonial[],
  fetchTestimonials: () => void | Promise<void>,
  tailoredInvestments: TailoredInvestment[],
  fetchTailoredInvestments: () => void | Promise<void>,
  logout: () => void,
  key?: string
}) {
  const { user, token } = useAuth();
  
  useEffect(() => {
    console.log("[AdminPanel] MOUNTED", { 
      hasUser: !!user, 
      hasToken: !!token, 
      userEmail: user?.email 
    });
  }, [user, token]);
  const [tab, setTab] = useState("products");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showStaffGalleryModal, setShowStaffGalleryModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showTailoredModal, setShowTailoredModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [editingStaffGalleryItem, setEditingStaffGalleryItem] = useState<GalleryItem | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingTailored, setEditingTailored] = useState<TailoredInvestment | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);
  
  useEffect(() => {
    setLocalSettings(siteSettings);
  }, [siteSettings]);
  
  const productFileRef = useRef<HTMLInputElement>(null);
  const teamFileRef = useRef<HTMLInputElement>(null);
  const newsFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const secLogoFileRef = useRef<HTMLInputElement>(null);
  const mdSpeechFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const staffGalleryFileRef = useRef<HTMLInputElement>(null);
  const testimonialFileRef = useRef<HTMLInputElement>(null);
  const tailoredFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(siteSettings);
  }, [siteSettings]);
  
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    min_investment: 1000,
    expected_return: 10,
    duration_months: 12,
    image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800",
    currency: "₦",
    rating: 5
  });

  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400",
    category: "staff" as "board" | "management" | "staff"
  });

  const [newNews, setNewNews] = useState({
    title: "",
    description: "",
    content: "",
    author: "",
    image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800",
    date: new Date().toISOString().split('T')[0]
  });

  const [newGalleryItem, setNewGalleryItem] = useState({
    image_url: "",
    caption: ""
  });

  const [newStaffGalleryItem, setNewStaffGalleryItem] = useState({
    image_url: "",
    caption: ""
  });
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "",
    content: "",
    image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
    rating: 5
  });
  const [newTailored, setNewTailored] = useState({
    title: "",
    description: "",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800"
  });

  useEffect(() => {
    if (tab === "team") fetchTeam();
    if (tab === "messages") fetchMessages();
    if (tab === "products") fetchProducts();
    if (tab === "news") fetchNews();
    if (tab === "gallery") fetchGallery();
    if (tab === "staff-gallery") fetchStaffGallery();
    if (tab === "testimonials") fetchTestimonials();
    if (tab === "tailored") fetchTailoredInvestments();
    if (tab === "settings") fetchSettings();
  }, [tab]);

  useEffect(() => {
    if (editingProduct) {
      setNewProduct({
        title: editingProduct.title,
        description: editingProduct.description,
        min_investment: editingProduct.min_investment,
        expected_return: editingProduct.expected_return,
        duration_months: editingProduct.duration_months,
        image_url: editingProduct.image_url,
        currency: editingProduct.currency || "₦",
        rating: editingProduct.rating || 5
      });
      setShowAddModal(true);
    }
  }, [editingProduct]);

  useEffect(() => {
    if (editingMember) {
      setNewMember({
        name: editingMember.name,
        role: editingMember.role,
        image_url: editingMember.image_url,
        category: editingMember.category
      });
      setShowTeamModal(true);
    }
  }, [editingMember]);

  useEffect(() => {
    if (editingNews) {
      setNewNews({
        title: editingNews.title,
        description: editingNews.description,
        content: editingNews.content,
        author: editingNews.author,
        image_url: editingNews.image_url,
        date: editingNews.date
      });
      setShowNewsModal(true);
    }
  }, [editingNews]);

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      setTeam(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch team in admin", err);
      setTeam([]);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/contacts", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but got " + contentType);
      }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch messages in admin", err);
      setMessages([]);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingProduct ? { ...newProduct, id: editingProduct.id } : newProduct)
    });
    if (res.ok) {
      setShowAddModal(false);
      setEditingProduct(null);
      setNewProduct({
        title: "",
        description: "",
        min_investment: 1000,
        expected_return: 10,
        duration_months: 12,
        image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800",
        currency: "₦",
        rating: 5
      });
      fetchProducts();
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingMember ? { ...newMember, id: editingMember.id } : newMember)
    });
    if (res.ok) {
      setShowTeamModal(false);
      setEditingMember(null);
      setNewMember({
        name: "",
        role: "",
        image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400",
        category: "staff"
      });
      fetchTeam();
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingNews ? { ...newNews, id: editingNews.id } : newNews)
    });
    if (res.ok) {
      setShowNewsModal(false);
      setEditingNews(null);
      setNewNews({
        title: "",
        description: "",
        content: "",
        author: "",
        image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800",
        date: new Date().toISOString().split('T')[0]
      });
      fetchNews();
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingGalleryItem ? { ...newGalleryItem, id: editingGalleryItem.id } : newGalleryItem)
    });
    if (res.ok) {
      setShowGalleryModal(false);
      setEditingGalleryItem(null);
      setNewGalleryItem({
        image_url: "",
        caption: ""
      });
      fetchGallery();
    }
  };

  const handleAddStaffGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/staff-gallery", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingStaffGalleryItem ? { ...newStaffGalleryItem, id: editingStaffGalleryItem.id } : newStaffGalleryItem)
    });
    if (res.ok) {
      setShowStaffGalleryModal(false);
      setEditingStaffGalleryItem(null);
      setNewStaffGalleryItem({
        image_url: "",
        caption: ""
      });
      fetchStaffGallery();
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingTestimonial ? { ...newTestimonial, id: editingTestimonial.id } : newTestimonial)
    });
    if (res.ok) {
      setShowTestimonialModal(false);
      setEditingTestimonial(null);
      setNewTestimonial({
        name: "",
        role: "",
        content: "",
        image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
        rating: 5
      });
      fetchTestimonials();
    }
  };

  const handleAddTailored = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/tailored-investments", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingTailored ? { ...newTailored, id: editingTailored.id } : newTailored)
    });
    if (res.ok) {
      setShowTailoredModal(false);
      setEditingTailored(null);
      setNewTailored({
        title: "",
        description: "",
        image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800"
      });
      fetchTailoredInvestments();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchProducts();
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    await fetch(`/api/admin/team/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchTeam();
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    await fetch(`/api/admin/news/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchNews();
  };

  const handleDeleteGalleryItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;
    await fetch(`/api/admin/gallery/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchGallery();
  };

  const handleDeleteStaffGalleryItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff gallery image?")) return;
    await fetch(`/api/admin/staff-gallery/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchStaffGallery();
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchTestimonials();
  };

  const handleDeleteTailored = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tailored investment?")) return;
    await fetch(`/api/admin/tailored-investments/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchTailoredInvestments();
  };

  const handleMarkMessageRead = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}/read`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to mark message as read", error);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setNewProduct({
      title: "",
      description: "",
      min_investment: 1000,
      expected_return: 10,
      duration_months: 12,
      image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800",
      currency: "₦"
    });
    setShowAddModal(true);
  };

  const openTeamModal = () => {
    setEditingMember(null);
    setNewMember({
      name: "",
      role: "",
      image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400",
      category: "staff"
    });
    setShowTeamModal(true);
  };

  const openNewsModal = () => {
    setEditingNews(null);
    setNewNews({
      title: "",
      description: "",
      content: "",
      author: "",
      image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800",
      date: new Date().toISOString().split('T')[0]
    });
    setShowNewsModal(true);
  };

  const openGalleryModal = () => {
    setEditingGalleryItem(null);
    setNewGalleryItem({
      image_url: "",
      caption: ""
    });
    setShowGalleryModal(true);
  };

  const openStaffGalleryModal = () => {
    setEditingStaffGalleryItem(null);
    setNewStaffGalleryItem({
      image_url: "",
      caption: ""
    });
    setShowStaffGalleryModal(true);
  };

  const openTestimonialModal = () => {
    setEditingTestimonial(null);
    setNewTestimonial({
      name: "",
      role: "",
      content: "",
      image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
      rating: 5
    });
    setShowTestimonialModal(true);
  };

  const openTailoredModal = () => {
    setEditingTailored(null);
    setNewTailored({
      title: "",
      description: "",
      image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800"
    });
    setShowTailoredModal(true);
  };

  const handleImageUpload = async (file: File, type: 'product' | 'team' | 'logo' | 'news' | 'md_speech' | 'gallery' | 'staff_gallery' | 'testimonial' | 'tailored') => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'product') {
          setNewProduct({ ...newProduct, image_url: data.imageUrl });
        } else if (type === 'team') {
          setNewMember({ ...newMember, image_url: data.imageUrl });
        } else if (type === 'logo') {
          setLocalSettings({ ...localSettings, logo_url: data.imageUrl });
        } else if (type === 'news') {
          setNewNews({ ...newNews, image_url: data.imageUrl });
        } else if (type === 'md_speech') {
          setLocalSettings({ ...localSettings, md_speech_image: data.imageUrl });
        } else if (type === 'gallery') {
          setNewGalleryItem({ ...newGalleryItem, image_url: data.imageUrl });
        } else if (type === 'staff_gallery') {
          setNewStaffGalleryItem({ ...newStaffGalleryItem, image_url: data.imageUrl });
        } else if (type === 'testimonial') {
          setNewTestimonial({ ...newTestimonial, image_url: data.imageUrl });
        } else if (type === 'tailored') {
          setNewTailored({ ...newTailored, image_url: data.imageUrl });
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setUploading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(localSettings)
      });
      if (res.ok) {
        alert("Settings saved successfully!");
        fetchSettings();
      }
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings.");
    } finally {
      setUploading(false);
    }
  };

  const handleQuickLogoUpdate = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const newLogoUrl = data.imageUrl;
        // Update settings immediately
        const settingsRes = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ ...siteSettings, logo_url: newLogoUrl })
        });
        if (settingsRes.ok) {
          alert("Logo updated successfully!");
          fetchSettings();
        }
      }
    } catch (error) {
      console.error("Logo update failed", error);
      alert("Logo update failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleQuickSecLogoUpdate = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const newLogoUrl = data.imageUrl;
        // Update settings immediately
        const settingsRes = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ ...siteSettings, sec_logo_url: newLogoUrl })
        });
        if (settingsRes.ok) {
          alert("SEC Logo updated successfully!");
          fetchSettings();
        }
      }
    } catch (error) {
      console.error("SEC Logo update failed", error);
      alert("SEC Logo update failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="bg-primary text-white p-6 flex justify-between items-center shadow-xl sticky top-0 z-50">
        <div className="flex items-center">
          <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center mr-4">
            <Shield className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Trustline CMS</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center"
          >
            <Eye size={16} className="mr-2" /> View Site
          </Link>
          <button 
            onClick={logout}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center"
          >
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold">Admin Dashboard</h2>
              <p className="text-slate-500">Manage your platform assets, team, and messages</p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                ref={logoFileRef}
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleQuickLogoUpdate(e.target.files[0])}
              />
              <button 
                onClick={() => logoFileRef.current?.click()}
                disabled={uploading}
                className="bg-accent text-primary px-6 py-2 rounded-xl text-sm font-bold hover:bg-accent-hover transition-all flex items-center shadow-sm"
              >
                <Upload size={16} className="mr-2" /> {uploading ? 'Uploading...' : 'Update Logo'}
              </button>
            </div>
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setTab("products")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "products" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setTab("team")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "team" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Team
            </button>
            <button 
              onClick={() => setTab("news")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "news" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              News
            </button>
            <button 
              onClick={() => setTab("messages")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "messages" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Messages
            </button>
            <button 
              onClick={() => setTab("gallery")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "gallery" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Gallery
            </button>
            <button 
              onClick={() => setTab("staff-gallery")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "staff-gallery" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Staff Gallery
            </button>
            <button 
              onClick={() => setTab("testimonials")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "testimonials" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Testimonials
            </button>
            <button 
              onClick={() => setTab("tailored")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "tailored" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              Tailored
            </button>
            <button 
              onClick={() => setTab("settings")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "settings" ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              <SettingsIcon size={16} className="inline mr-1" /> Site Settings
            </button>
          </div>

          <div className="mt-10">
            {tab === "products" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Investment Products ({products.length})</h3>
              <button 
                onClick={openAddModal}
                className="bg-accent text-primary px-4 py-2 rounded-lg font-bold flex items-center shadow-md hover:bg-accent-hover transition-all"
              >
                <Plus size={18} className="mr-2" /> Add Product
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                  <div className="h-32 overflow-hidden relative">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button 
                        onClick={() => setEditingProduct(p)} 
                        className="bg-white/90 px-2 py-1 rounded-lg text-primary hover:text-accent transition-colors shadow-sm flex items-center text-xs font-bold"
                      >
                        <Edit size={14} className="mr-1" /> Modify
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="bg-white/90 p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="font-bold text-lg mb-2">{p.title}</h4>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Return</div>
                        <div className="font-bold text-accent">{p.expected_return}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Min. Invest</div>
                        <div className="font-bold">{p.currency || '₦'}{p.min_investment.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === "team" ? (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-primary">Team Management</h3>
              <button 
                onClick={openTeamModal}
                className="bg-accent text-primary px-6 py-3 rounded-xl font-bold flex items-center shadow-lg hover:bg-accent-hover transition-all"
              >
                <Plus size={20} className="mr-2" /> Add New Member
              </button>
            </div>

            {/* Board of Directors Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Board of Directors</h4>
                <div className="h-px bg-slate-100 flex-grow"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.filter(m => m.category === 'board').map(m => (
                  <TeamAdminCard key={m.id} m={m} setEditingMember={setEditingMember} handleDeleteMember={handleDeleteMember} />
                ))}
                {team.filter(m => m.category === 'board').length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm italic">
                    No board members added yet.
                  </div>
                )}
              </div>
            </div>

            {/* Management Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Management</h4>
                <div className="h-px bg-slate-100 flex-grow"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.filter(m => m.category === 'management').map(m => (
                  <TeamAdminCard key={m.id} m={m} setEditingMember={setEditingMember} handleDeleteMember={handleDeleteMember} />
                ))}
                {team.filter(m => m.category === 'management').length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm italic">
                    No management members added yet.
                  </div>
                )}
              </div>
            </div>

            {/* Staff Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Staff</h4>
                <div className="h-px bg-slate-100 flex-grow"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.filter(m => m.category === 'staff').map(m => (
                  <TeamAdminCard key={m.id} m={m} setEditingMember={setEditingMember} handleDeleteMember={handleDeleteMember} />
                ))}
                {team.filter(m => m.category === 'staff').length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm italic">
                    No staff members added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : tab === "news" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">News Articles ({news.length})</h3>
              <button 
                onClick={openNewsModal}
                className="bg-accent text-primary px-4 py-2 rounded-lg font-bold flex items-center shadow-md hover:bg-accent-hover transition-all"
              >
                <Plus size={18} className="mr-2" /> Add News
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map(n => (
                <div key={n.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                  <div className="h-32 overflow-hidden relative">
                    <img src={n.image_url} alt={n.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button 
                        onClick={() => setEditingNews(n)} 
                        className="bg-white/90 px-2 py-1 rounded-lg text-primary hover:text-accent transition-colors shadow-sm flex items-center text-xs font-bold"
                      >
                        <Edit size={14} className="mr-1" /> Edit
                      </button>
                      <button onClick={() => handleDeleteNews(n.id)} className="bg-white/90 p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="font-bold text-lg mb-2 line-clamp-1">{n.title}</h4>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{n.description}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="text-xs font-bold text-slate-400">{n.author}</div>
                      <div className="text-xs text-slate-400">{n.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === "gallery" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Gallery Management ({gallery.length})</h3>
              <button 
                onClick={openGalleryModal}
                className="bg-accent text-primary px-4 py-2 rounded-lg font-bold flex items-center shadow-md hover:bg-accent-hover transition-all"
              >
                <Plus size={18} className="mr-2" /> Add Image
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gallery.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group">
                  <div className="aspect-square overflow-hidden relative">
                    <img src={item.image_url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingGalleryItem(item); setNewGalleryItem({ image_url: item.image_url, caption: item.caption }); setShowGalleryModal(true); }} 
                        className="bg-white/90 p-1.5 rounded-lg text-primary hover:text-accent transition-colors shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteGalleryItem(item.id)} className="bg-white/90 p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {item.caption && (
                    <div className="p-3 text-center">
                      <p className="text-xs text-slate-500 font-medium truncate">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400">No gallery images found. Start by adding one!</p>
                </div>
              )}
            </div>
          </div>
        ) : tab === "staff-gallery" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Staff Gallery Management ({staffGallery.length})</h3>
              <button 
                onClick={openStaffGalleryModal}
                className="bg-accent text-primary px-4 py-2 rounded-lg font-bold flex items-center shadow-md hover:bg-accent-hover transition-all"
              >
                <Plus size={18} className="mr-2" /> Add Staff Image
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {staffGallery.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group">
                  <div className="aspect-square overflow-hidden relative">
                    <img src={item.image_url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingStaffGalleryItem(item); setNewStaffGalleryItem({ image_url: item.image_url, caption: item.caption }); setShowStaffGalleryModal(true); }} 
                        className="bg-white/90 p-1.5 rounded-lg text-primary hover:text-accent transition-colors shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteStaffGalleryItem(item.id)} className="bg-white/90 p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {item.caption && (
                    <div className="p-3 text-center">
                      <p className="text-xs text-slate-500 font-medium truncate">{item.caption}</p>
                    </div>
                  )}
                </div>
              ))}
              {staffGallery.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400">No staff gallery images found. Start by adding one!</p>
                </div>
              )}
            </div>
          </div>
        ) : tab === "settings" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6">Site Configuration</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
                <div className="flex items-center gap-6 p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-slate-200">
                    <img src={localSettings.logo_url} alt="Logo Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <button 
                      onClick={() => logoFileRef.current?.click()}
                      disabled={uploading}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all flex items-center mb-2"
                    >
                      <Upload size={16} className="mr-2" /> {uploading ? 'Uploading...' : 'Modify Main Logo'}
                    </button>
                    <input type="file" ref={logoFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleQuickLogoUpdate(e.target.files[0])} />
                    <p className="text-[10px] text-slate-400">Main Company Logo</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-slate-200">
                    <img src={localSettings.sec_logo_url} alt="SEC Logo Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <button 
                      onClick={() => secLogoFileRef.current?.click()}
                      disabled={uploading}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all flex items-center mb-2"
                    >
                      <Upload size={16} className="mr-2" /> {uploading ? 'Uploading...' : 'Modify SEC Logo'}
                    </button>
                    <input type="file" ref={secLogoFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleQuickSecLogoUpdate(e.target.files[0])} />
                    <p className="text-[10px] text-slate-400">Regulatory SEC Logo</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-slate-200">
                    <img src={localSettings.md_speech_image} alt="MD Speech Preview" className="max-w-full max-h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <button 
                      onClick={() => mdSpeechFileRef.current?.click()}
                      disabled={uploading}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all flex items-center mb-2"
                    >
                      <Upload size={16} className="mr-2" /> {uploading ? 'Uploading...' : 'Modify MD Speech Image'}
                    </button>
                    <input type="file" ref={mdSpeechFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'md_speech')} />
                    <p className="text-[10px] text-slate-400">Image for Managing Director's Speech section</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Our Vision</label>
                  <textarea 
                    value={localSettings.vision_text}
                    onChange={(e) => setLocalSettings({ ...localSettings, vision_text: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent h-24" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Our Mission</label>
                  <textarea 
                    value={localSettings.mission_text}
                    onChange={(e) => setLocalSettings({ ...localSettings, mission_text: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent h-24" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Managing Director's Speech</label>
                  <textarea 
                    value={localSettings.md_speech_text}
                    onChange={(e) => setLocalSettings({ ...localSettings, md_speech_text: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent h-48" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">Core Values</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localSettings.core_values.map((val, idx) => (
                      <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 space-y-2">
                        <input 
                          type="text"
                          value={val.title}
                          onChange={(e) => {
                            const newValues = [...localSettings.core_values];
                            newValues[idx].title = e.target.value;
                            setLocalSettings({ ...localSettings, core_values: newValues });
                          }}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-accent"
                          placeholder="Value Title"
                        />
                        <select 
                          value={val.icon}
                          onChange={(e) => {
                            const newValues = [...localSettings.core_values];
                            newValues[idx].icon = e.target.value;
                            setLocalSettings({ ...localSettings, core_values: newValues });
                          }}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-accent"
                        >
                          <option value="Shield">Shield</option>
                          <option value="Target">Target</option>
                          <option value="CheckCircle2">CheckCircle2</option>
                          <option value="Award">Award</option>
                          <option value="Lock">Lock</option>
                          <option value="Users">Users</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-6 pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800">Managing Director Info</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">MD Name</label>
                  <input 
                    type="text"
                    value={localSettings.md_name}
                    onChange={(e) => setLocalSettings({ ...localSettings, md_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">MD Title</label>
                  <input 
                    type="text"
                    value={localSettings.md_title}
                    onChange={(e) => setLocalSettings({ ...localSettings, md_title: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-6 pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800">Contact Information</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enquiries Number</label>
                  <input 
                    type="text"
                    value={localSettings.enquiries_number}
                    onChange={(e) => setLocalSettings({ ...localSettings, enquiries_number: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email"
                    value={localSettings.email_address}
                    onChange={(e) => setLocalSettings({ ...localSettings, email_address: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Address</label>
                  <textarea 
                    value={localSettings.contact_address}
                    onChange={(e) => setLocalSettings({ ...localSettings, contact_address: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent h-20" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-6 pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800">Site Identity</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
                  <input 
                    type="text"
                    value={localSettings.site_name}
                    onChange={(e) => setLocalSettings({ ...localSettings, site_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Site Subtext / Tagline</label>
                  <input 
                    type="text"
                    value={localSettings.site_subtext}
                    onChange={(e) => setLocalSettings({ ...localSettings, site_subtext: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={uploading}
                className="w-full bg-accent text-primary font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-accent-hover transition-all flex items-center justify-center"
              >
                <CheckCircle2 size={20} className="mr-2" /> {uploading ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        ) : tab === "testimonials" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Manage Testimonials</h3>
              <button onClick={openTestimonialModal} className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center shadow-lg">
                <Plus size={20} className="mr-2" /> Add Testimonial
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group relative">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={t.image_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 italic mb-4">"{t.content}"</p>
                  <div className="flex text-accent mb-4">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTestimonial(t); setNewTestimonial(t); setShowTestimonialModal(true); }} className="p-2 text-slate-400 hover:text-accent transition-colors"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteTestimonial(t.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && <div className="col-span-full py-12 text-center text-slate-400">No testimonials found.</div>}
            </div>
          </div>
        ) : tab === "tailored" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Manage Tailored Investments</h3>
              <button onClick={openTailoredModal} className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center shadow-lg">
                <Plus size={20} className="mr-2" /> Add Investment
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tailoredInvestments.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                  <div className="h-40 overflow-hidden relative">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingTailored(item); setNewTailored(item); setShowTailoredModal(true); }} className="bg-white/90 p-2 rounded-lg text-primary hover:text-accent transition-colors shadow-sm"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteTailored(item.id)} className="bg-white/90 p-2 rounded-lg text-red-400 hover:text-red-600 transition-colors shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
              {tailoredInvestments.length === 0 && <div className="col-span-full py-12 text-center text-slate-400">No tailored investments found.</div>}
            </div>
          </div>
        ) : tab === "messages" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Contact Messages</h3>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                {messages.length} Total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Sender</th>
                    <th className="px-6 py-4 font-bold">Message</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {messages.map((msg) => (
                    <tr key={msg.id} className={`hover:bg-slate-50 transition-colors ${!msg.is_read ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-primary">{msg.first_name} {msg.last_name}</div>
                        <div className="text-xs text-slate-500">{msg.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 max-w-md line-clamp-2">{msg.message}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(msg.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {msg.is_read ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Read</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">New</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!msg.is_read && (
                            <button 
                              onClick={() => handleMarkMessageRead(msg.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as Read"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No messages found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
            ) : null}
          </div>
        </div>
      </div>

        {/* Add Testimonial Modal */}
        {showTestimonialModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-primary p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                <button onClick={() => { setShowTestimonialModal(false); setEditingTestimonial(null); }}><X /></button>
              </div>
              <form className="p-8 space-y-4" onSubmit={handleAddTestimonial}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input type="text" required value={newTestimonial.name} onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <input type="text" required value={newTestimonial.role} onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                  <textarea required value={newTestimonial.content} onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label>
                    <input type="number" min="1" max="5" required value={newTestimonial.rating} onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                    <div className="flex gap-2">
                      <input type="file" ref={testimonialFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'testimonial')} />
                      <button type="button" onClick={() => testimonialFileRef.current?.click()} className="w-full bg-slate-100 p-2 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center text-xs font-bold">
                        <Upload size={16} className="mr-1" /> {uploading ? '...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-primary/90 transition-all">
                  {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Tailored Modal */}
        {showTailoredModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-primary p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingTailored ? 'Edit Investment' : 'Add Investment'}</h3>
                <button onClick={() => { setShowTailoredModal(false); setEditingTailored(null); }}><X /></button>
              </div>
              <form className="p-8 space-y-4" onSubmit={handleAddTailored}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input type="text" required value={newTailored.title} onChange={(e) => setNewTailored({ ...newTailored, title: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea required value={newTailored.description} onChange={(e) => setNewTailored({ ...newTailored, description: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent h-24" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                  <div className="flex gap-2">
                    <input type="file" ref={tailoredFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'tailored')} />
                    <button type="button" onClick={() => tailoredFileRef.current?.click()} className="w-full bg-slate-100 p-2 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center text-xs font-bold">
                      <Upload size={16} className="mr-1" /> {uploading ? '...' : 'Upload'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-primary/90 transition-all">
                  {editingTailored ? 'Update Investment' : 'Add Investment'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add News Modal */}
        {showNewsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-primary p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">{editingNews ? 'Edit News Article' : 'Add New News Article'}</h3>
                <button onClick={() => { setShowNewsModal(false); setEditingNews(null); }}><X /></button>
              </div>
              <form className="p-8 space-y-4 max-h-[80vh] overflow-y-auto" onSubmit={handleAddNews}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input 
                      type="text" required
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                    <input 
                      type="text" required
                      value={newNews.author}
                      onChange={(e) => setNewNews({ ...newNews, author: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (Short Summary)</label>
                  <input 
                    type="text" required
                    value={newNews.description}
                    onChange={(e) => setNewNews({ ...newNews, description: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content (Full Article)</label>
                  <textarea 
                    required rows={6}
                    value={newNews.content}
                    onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent resize-none" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Published Date</label>
                    <input 
                      type="date" required
                      value={newNews.date}
                      onChange={(e) => setNewNews({ ...newNews, date: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" required
                        value={newNews.image_url}
                        onChange={(e) => setNewNews({ ...newNews, image_url: e.target.value })}
                        className="flex-grow border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                      />
                      <input type="file" ref={newsFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'news')} />
                      <button 
                        type="button"
                        onClick={() => newsFileRef.current?.click()}
                        className="bg-slate-100 p-2 rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        <Upload size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-primary/90 transition-all"
                >
                  {editingNews ? 'Update News Article' : 'Publish News Article'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingProduct ? 'Modify Product' : 'Add New Investment Product'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingProduct(null); }}><X /></button>
            </div>
            <form className="p-8 space-y-4" onSubmit={handleAddProduct}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Title</label>
                <input 
                  type="text" required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select 
                    value={newProduct.currency}
                    onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent"
                  >
                    <option value="₦">Naira (₦)</option>
                    <option value="$">Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min. Invest</label>
                  <input 
                    type="number" required
                    value={newProduct.min_investment}
                    onChange={(e) => setNewProduct({ ...newProduct, min_investment: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Return (%)</label>
                  <input 
                    type="number" required
                    value={newProduct.expected_return}
                    onChange={(e) => setNewProduct({ ...newProduct, expected_return: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5 Stars)</label>
                  <input 
                    type="number" required min="1" max="5" step="0.1"
                    value={newProduct.rating}
                    onChange={(e) => setNewProduct({ ...newProduct, rating: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Months)</label>
                <input 
                  type="number" required
                  value={newProduct.duration_months}
                  onChange={(e) => setNewProduct({ ...newProduct, duration_months: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <div className="flex-grow">
                      <input 
                        type="text" required
                        placeholder="Image URL or upload below"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                      />
                    </div>
                    {newProduct.image_url && (
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      ref={productFileRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'product')}
                    />
                    <button 
                      type="button"
                      disabled={uploading}
                      onClick={() => productFileRef.current?.click()}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center"
                    >
                      <Upload size={16} className="mr-2" /> {uploading ? 'Uploading...' : 'Upload from Computer'}
                    </button>
                    <p className="text-[10px] text-slate-400">Recommended: 800x600px</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-primary/90 transition-all">
                {editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Gallery Item Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingGalleryItem ? 'Edit Gallery Image' : 'Add Gallery Image'}</h3>
              <button onClick={() => { setShowGalleryModal(false); setEditingGalleryItem(null); }}><X /></button>
            </div>
            <form className="p-8 space-y-4" onSubmit={handleAddGalleryItem}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Caption (Optional)</label>
                <input 
                  type="text"
                  value={newGalleryItem.caption}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, caption: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  placeholder="Enter a short description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <div className="flex-grow">
                      <input 
                        type="text" required
                        placeholder="Image URL or upload below"
                        value={newGalleryItem.image_url}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, image_url: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                      />
                    </div>
                    {newGalleryItem.image_url && (
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={newGalleryItem.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      ref={galleryFileRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'gallery')}
                    />
                    <button 
                      type="button"
                      disabled={uploading}
                      onClick={() => galleryFileRef.current?.click()}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center"
                    >
                      <Upload size={16} className="mr-2" /> {uploading ? 'Uploading...' : 'Upload from Computer'}
                    </button>
                  </div>
                </div>
              </div>
              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-primary/90 transition-all">
                {editingGalleryItem ? 'Update Image' : 'Save Image'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Staff Gallery Item Modal */}
      {showStaffGalleryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingStaffGalleryItem ? 'Edit Staff Image' : 'Add Staff Image'}</h3>
              <button onClick={() => { setShowStaffGalleryModal(false); setEditingStaffGalleryItem(null); }}><X /></button>
            </div>
            <form className="p-8 space-y-4" onSubmit={handleAddStaffGalleryItem}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Caption (Optional)</label>
                <input 
                  type="text"
                  value={newStaffGalleryItem.caption}
                  onChange={(e) => setNewStaffGalleryItem({ ...newStaffGalleryItem, caption: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                  placeholder="Enter a short description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <div className="flex-grow">
                      <input 
                        type="text" required
                        placeholder="Image URL or upload below"
                        value={newStaffGalleryItem.image_url}
                        onChange={(e) => setNewStaffGalleryItem({ ...newStaffGalleryItem, image_url: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                      />
                    </div>
                    {newStaffGalleryItem.image_url && (
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={newStaffGalleryItem.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      ref={staffGalleryFileRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'staff_gallery')}
                    />
                    <button 
                      type="button"
                      disabled={uploading}
                      onClick={() => staffGalleryFileRef.current?.click()}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center"
                    >
                      <Upload size={16} className="mr-2" /> {uploading ? 'Uploading...' : 'Upload from Computer'}
                    </button>
                  </div>
                </div>
              </div>
              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-primary/90 transition-all">
                {editingStaffGalleryItem ? 'Update Image' : 'Save Image'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingMember ? 'Modify Team Member' : 'Add New Team Member'}</h3>
              <button onClick={() => { setShowTeamModal(false); setEditingMember(null); }}><X /></button>
            </div>
            <form className="p-8 space-y-4" onSubmit={handleAddMember}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role / Designation</label>
                <input 
                  type="text" required
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={newMember.category}
                  onChange={(e) => setNewMember({ ...newMember, category: e.target.value as any })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent"
                >
                  <option value="board">Board of Directors</option>
                  <option value="management">Management</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo</label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <div className="flex-grow">
                      <input 
                        type="text" required
                        placeholder="Image URL or upload below"
                        value={newMember.image_url}
                        onChange={(e) => setNewMember({ ...newMember, image_url: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" 
                      />
                    </div>
                    {newMember.image_url && (
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        <img src={newMember.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      ref={teamFileRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'team')}
                    />
                    <button 
                      type="button"
                      disabled={uploading}
                      onClick={() => teamFileRef.current?.click()}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center"
                    >
                      <Upload size={16} className="mr-2" /> {uploading ? 'Uploading...' : 'Upload from Computer'}
                    </button>
                    <p className="text-[10px] text-slate-400">Recommended: Square (400x400px)</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-primary/90 transition-all">
                {editingMember ? 'Update Member' : 'Save Team Member'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
