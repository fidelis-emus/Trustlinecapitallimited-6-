export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  onboarding_data?: string;
  onboarding_completed: boolean;
  balance: number;
  role: 'user' | 'admin';
}

export interface Product {
  id: string; // Changed to string for Firestore
  title: string;
  description: string;
  min_investment: number;
  expected_return: number;
  duration_months: number;
  risk_level: 'low' | 'medium' | 'high';
  category: 'fixed_income' | 'dollar' | 'portfolio';
  image_url: string;
  currency: string;
  rating: number;
  view_rate: number;
  rate_3m?: number;
  rate_6m?: number;
  rate_12m?: number;
}

export interface Investment {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  expected_return: number;
  start_date: string;
  maturity_date: string;
  status: 'active' | 'matured' | 'withdrawn';
  product_title: string;
  currency: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'earning';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  logo_url: string;
  sec_logo_url: string;
  site_name: string;
  site_subtext: string;
  md_speech_image: string;
  vision_text: string;
  mission_text: string;
  md_speech_text: string;
  md_name: string;
  md_title: string;
  enquiries_number: string;
  email_address: string;
  contact_address: string;
  core_values: { title: string, icon: string }[];
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image_url: string;
  rating: number;
}

export interface TailoredInvestment {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  category: "board" | "management" | "staff";
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  date: string;
  image_url: string;
  category: string;
}
