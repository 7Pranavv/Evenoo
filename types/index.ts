export type UserRole = 'participant' | 'organizer' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  wallet_balance: number;
  organizer_verification_status: 'unverified' | 'pending' | 'verified';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category_id: string | null;
  subcategory_id: string | null;
  event_type: 'individual' | 'team';
  event_level: 'college' | 'inter_college' | 'state' | 'national';
  event_mode: 'online' | 'offline' | 'hybrid';
  registration_start: string | null;
  registration_end: string | null;
  event_start: string | null;
  event_end: string | null;
  result_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_maps_link: string | null;
  platform_name: string | null;
  meeting_link: string | null;
  access_code: string | null;
  organizer_type: 'individual' | 'club' | 'college';
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  max_participants: number | null;
  registration_visibility: 'public' | 'private' | 'college_only';
  eligibility_criteria: string | null;
  participant_instructions: string | null;
  min_team_size: number;
  max_team_size: number;
  max_team_size_custom: number | null;
  team_name_required: boolean;
  team_leader_mandatory: boolean;
  allow_self_registration_only: boolean;
  submission_required: boolean;
  submission_type: 'file' | 'link' | 'text' | null;
  allowed_file_formats: string[];
  submission_deadline: string | null;
  max_file_size_mb: number;
  fee_type: 'free' | 'paid';
  fee_structure: 'per_person' | 'per_team_flat' | 'per_person_with_cap' | null;
  fee_per_person: number;
  team_flat_fee: number;
  team_fee_cap: number;
  payment_deadline: string | null;
  late_fee: number;
  refund_policy: 'no_refund' | 'partial_refund' | 'refund_before_deadline';
  prize_pool_amount: number;
  prize_pool_type: 'monetary' | 'non_monetary';
  prize_breakdown: Array<{ position: string; amount: string }>;
  certificate_types: string[];
  certificate_issuer: string | null;
  logo_url: string | null;
  banner_url: string | null;
  gallery_urls: string[];
  sponsor_logos: any[];
  instagram_link: string | null;
  youtube_link: string | null;
  website_link: string | null;
  hashtags: string[];
  promotional_description: string | null;
  rules_and_regulations: string | null;
  code_of_conduct: string | null;
  disclaimer: string | null;
  registrations_enabled: boolean;
  registrations_paused: boolean;
  auto_close_on_capacity: boolean;
  featured: boolean;
  verified_badge: boolean;
  admin_notes: string | null;
  analytics_access_enabled: boolean;
  admin_approval_note: string | null;
  created_by: string;
  status: 'draft' | 'pending_approval' | 'live' | 'completed' | 'cancelled';
  view_count: number;
  created_at: string;
  updated_at: string;
  // joined
  categories?: Category | null;
}

export interface Ticket {
  id: string;
  event_id: string;
  registration_id: string | null;
  team_registration_id: string | null;
  member_name: string;
  member_email: string;
  uid: string | null;
  status: 'active' | 'used' | 'cancelled';
  checked_in_at: string | null;
  checked_in_by: string | null;
  issued_at: string;
  events?: {
    id: string;
    name: string;
    event_start: string | null;
    venue_name: string | null;
    platform_name: string | null;
    banner_url: string | null;
  } | null;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  event_id: string | null;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  type: 'individual' | 'team_bulk' | 'team_join';
  team_registration_id: string | null;
  team_code: string | null;
  team_name: string | null;
  team_leader_uid: string | null;
  members: Array<{
    uid: string | null;
    name: string;
    email: string;
    phone: string;
    college: string;
    ticket_id: string;
  }>;
  total_fee: number;
  fee_breakdown: Record<string, any>;
  payment_status: 'paid' | 'pending' | 'refunded';
  registered_by: string;
  registered_at: string;
}

export interface Notification {
  id: string;
  recipient_uid: string;
  title: string;
  body: string;
  type: string;
  related_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  uid: string;
  name: string;
  category: string;
  description: string | null;
  portfolio_images: string[];
  rating: number;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorInventoryItem {
  id: string;
  vendor_id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  pricing_type: 'per_person' | 'per_day' | 'per_event';
  quantity: number;
  availability_status: 'available' | 'booked' | 'unavailable';
  images: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface VendorBooking {
  id: string;
  vendor_id: string;
  organizer_uid: string;
  organizer_name: string;
  event_id: string | null;
  event_name: string;
  event_date: string | null;
  event_level: string | null;
  inventory_item_id: string | null;
  inventory_item_name: string;
  message: string | null;
  vendor_response: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface CreateEventDraft {
  // A
  name: string;
  tagline: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  event_type: 'individual' | 'team';
  event_level: 'college' | 'inter_college' | 'state' | 'national';
  event_mode: 'online' | 'offline' | 'hybrid';
  // B
  registration_start: string;
  registration_end: string;
  event_start: string;
  event_end: string;
  result_date: string;
  // C
  venue_name: string;
  venue_address: string;
  venue_maps_link: string;
  platform_name: string;
  meeting_link: string;
  access_code: string;
  // D
  organizer_type: 'individual' | 'club' | 'college';
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  // E
  max_participants: string;
  registration_visibility: 'public' | 'private' | 'college_only';
  eligibility_criteria: string;
  participant_instructions: string;
  // F
  min_team_size: string;
  max_team_size: string;
  max_team_size_custom: string;
  team_name_required: boolean;
  team_leader_mandatory: boolean;
  allow_self_registration_only: boolean;
  // G
  submission_required: boolean;
  submission_type: 'file' | 'link' | 'text';
  allowed_file_formats: string[];
  submission_deadline: string;
  max_file_size_mb: string;
  // H
  fee_type: 'free' | 'paid';
  fee_structure: 'per_person' | 'per_team_flat' | 'per_person_with_cap';
  fee_per_person: string;
  team_flat_fee: string;
  team_fee_cap: string;
  payment_deadline: string;
  late_fee: string;
  refund_policy: 'no_refund' | 'partial_refund' | 'refund_before_deadline';
  // I
  prize_pool_amount: string;
  prize_pool_type: 'monetary' | 'non_monetary';
  prize_breakdown: Array<{ position: string; amount: string }>;
  certificate_types: string[];
  certificate_issuer: string;
  // J
  logo_url: string;
  banner_url: string;
  // K
  instagram_link: string;
  youtube_link: string;
  website_link: string;
  hashtags: string[];
  // L
  rules_and_regulations: string;
  code_of_conduct: string;
  disclaimer: string;
  terms_accepted: boolean;
}
