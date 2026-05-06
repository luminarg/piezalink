export type UserRole = "admin" | "vendor";

export interface Vendor {
  id: string;
  user_id: string;
  company_name: string;
  logo_url?: string;
  description?: string;
  phone: string;
  whatsapp: string;
  email: string;
  city?: string;
  state?: string;
  country?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: string;
  vendor_id: string;
  part_number: string;
  description: string;
  compatibility: string;
  stock_quantity: number;
  brand?: string;
  category?: string;
  slug?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
}

export interface ContactRequest {
  id: string;
  part_id: string;
  vendor_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message?: string;
  created_at: string;
  part?: Part;
}

export interface Subscription {
  id: string;
  vendor_id: string;
  plan: "trial" | "basic" | "pro";
  status: "active" | "inactive" | "expired";
  started_at: string;
  expires_at: string;
}

export interface AdSpace {
  id: string;
  vendor_id?: string;
  title: string;
  position: "home_top" | "search_sidebar" | "search_top";
  image_url: string;
  link_url: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface PartEvent {
  id: string;
  part_id: string;
  vendor_id: string;
  event_type: "view" | "whatsapp_click";
  created_at: string;
}

export interface DashboardMetrics {
  total_parts: number;
  total_views: number;
  total_whatsapp_clicks: number;
  total_contacts: number;
  views_last_7_days: number;
  clicks_last_7_days: number;
}
