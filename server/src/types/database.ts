import { RowDataPacket } from 'mysql2';

export interface IDbResult extends RowDataPacket {}

export interface IRole extends IDbResult {
  id: number;
  slug: 'sudo' | 'admin' | 'technician' | 'moderator' | 'member';
  label: string;
  is_system: number;
}

export interface IAppSetting extends IDbResult {
  id: number;
  setting_key: string;
  setting_value: string;
  description: string | null;
  updated_at: Date;
}

export interface ICmsPage extends IDbResult {
  id: number;
  slug: string;
  title: string;
  content_html: string | null;
  updated_at: Date;
}

export interface IAuditLog extends IDbResult {
  id: number;
  user_id: number | null;
  action: string;
  entity_id: number | null;
  details: any;
  ip_address: string | null;
  created_at: Date;
}

export interface INotificationLog extends IDbResult {
  id: number;
  user_id: number | null;
  contact_target: string | null;
  channel: 'whatsapp' | 'email' | 'sms';
  message_type: string;
  status: 'sent' | 'failed' | 'delivered';
  created_at: Date;
}

export interface IVerificationCode extends IDbResult {
  id: number;
  identity: string;
  code: string;
  expires_at: Date;
  created_at: Date;
}

export interface IUser extends IDbResult {
  id: number;
  email: string | null;
  phone: string | null;
  password_hash: string;
  role_id: number;
  is_active: number;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  role_slug?: string; // join
}

export interface ISession extends IDbResult {
  id: number;
  user_id: number;
  token_hash: string;
  device_fingerprint: string | null;
  ip_address: string | null;
  expires_at: Date;
  created_at: Date;
}

// ========================================================
// C. BUSINESS: MEMBERS & EVENTS
// ========================================================

export interface IMemberCategory extends IDbResult {
  id: number;
  slug: string;
  label: string;
  is_system: number;
  deleted_at: Date | null;
}

export interface IMember extends IDbResult {
  id: number;
  user_id: number | null;
  barcode: string | null;
  
  firstname: string;
  lastname: string;
  birthdate: Date;
  
  phone_contact: string | null;
  email_contact: string | null;
  
  category_id: number;
  arrival_year_quimper: number;
  
  address_fr_line1: string | null;
  address_fr_line2: string | null;
  address_fr_zip: string | null;
  address_fr_city: string | null;
  
  address_tr_line1: string | null;
  address_tr_line2: string | null;
  address_tr_city: string | null;
  address_tr_region: string | null;
  
  has_cenaze_fonu: number;
  stripe_customer_id: string | null;
  
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface IEvent extends IDbResult {
  id: number;
  title: string;
  description: string | null;
  event_date: Date;
  total_seats: number;
  max_seats_per_member: number | null;
  
  is_lottery: number;
  status: 'draft' | 'open' | 'closed' | 'completed';
  
  created_at: Date;
}

export interface IEventRegistration extends IDbResult {
  id: number;
  event_id: number;
  member_id: number;
  
  quantity_requested: number;
  quantity_allocated: number | null;
  
  status: 'pending' | 'approved' | 'rejected' | 'waitlist';
  ticket_sent_at: Date | null;
  
  created_at: Date;
}

// ========================================================
// D. FINANCE
// ========================================================

export interface IFeeType extends IDbResult {
  id: number;
  slug: string;
  label: string;
  is_recurring: number;
  is_system: number;
  deleted_at: Date | null;
}

export interface IFeeSchedule extends IDbResult {
  id: number;
  year: number;
  fee_type_id: number;
  category_id: number;
  amount: string;
}

export interface IMemberDue extends IDbResult {
  id: number;
  member_id: number;
  year: number;
  fee_type_id: number;
  
  amount_due: string;
  amount_paid: string | null;
  
  status: 'pending' | 'partial' | 'paid' | 'waived' | 'cancelled';
  
  created_at: Date;
  updated_at: Date;
}

export interface IPayment extends IDbResult {
  id: number;
  member_id: number;
  recorded_by_user_id: number | null;
  
  amount: string;
  method: 'cash' | 'card' | 'transfer' | 'check' | 'stripe';
  transaction_date: Date | null;
  
  stripe_payment_id: string | null;
  check_reference: string | null;
  notes: string | null;
  
  is_cancelled: number;
  cancelled_at: Date | null;
}