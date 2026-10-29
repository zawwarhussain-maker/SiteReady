export type UserRole = 'owner' | 'manager' | 'viewer';

export type EmploymentStatus = 'active' | 'suspended' | 'terminated' | 'on_leave';

export type CertificateStatus = 'valid' | 'expiring_soon' | 'expired' | 'missing' | 'no_expiry';

export type InspectionStatus = 'draft' | 'in_progress' | 'completed_pass' | 'completed_fail' | 'cancelled';

export type CheckpointResult = 'pass' | 'fail' | 'na';

export type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

export type ActionStatus = 'open' | 'in_progress' | 'resolved' | 'verified_closed';

export type SubscriptionTier = 'trial' | 'starter' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';

export interface Company {
  id: string;
  name: string;
  name_ar?: string;
  cr_number?: string;
  vat_number?: string;
  default_language: 'en' | 'ar';
  timezone: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  full_name_ar?: string;
  phone?: string;
  avatar_url?: string;
  preferred_language: 'en' | 'ar';
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id?: string;
  role: UserRole;
  is_active: boolean;
  invited_email?: string;
  joined_at?: string;
  created_at: string;
  user?: Profile;
}

export interface Site {
  id: string;
  company_id: string;
  name: string;
  name_ar?: string;
  client_name?: string;
  location_city?: string;
  code_reference?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  site_id?: string;
  employee_no: string;
  full_name: string;
  full_name_ar?: string;
  job_title: string;
  job_title_ar?: string;
  iqama_national_id: string;
  nationality: string;
  nationality_ar?: string;
  phone?: string;
  email?: string;
  joining_date?: string;
  employment_status: EmploymentStatus;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  site?: Site;
  certificates?: EmployeeCertificate[];
}

export interface CertificateType {
  id: string;
  company_id: string;
  name: string;
  name_ar?: string;
  issuing_authority?: string;
  requires_expiry: boolean;
  validity_months: number;
  reminder_days_before: number;
  is_mandatory: boolean;
  created_at: string;
  updated_at: string;
}

export interface CertificateRenewalRecord {
  id: string;
  certificate_id: string;
  previous_expiry_date?: string;
  new_expiry_date: string;
  renewed_at: string;
  renewed_by_name?: string;
  notes?: string;
}

export interface EmployeeCertificate {
  id: string;
  company_id: string;
  employee_id: string;
  certificate_type_id: string;
  license_number: string;
  issue_date: string;
  expiry_date?: string;
  attachment_path?: string;
  attachment_filename?: string;
  status: CertificateStatus;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  certificate_type?: CertificateType;
  employee?: Employee;
  renewal_history?: CertificateRenewalRecord[];
}

export interface Inspection {
  id: string;
  company_id: string;
  site_id: string;
  title: string;
  title_ar?: string;
  inspection_type: string;
  inspector_id?: string;
  scheduled_date: string;
  completed_at?: string;
  status: InspectionStatus;
  summary_notes?: string;
  supervisor_signature_path?: string;
  created_at: string;
  updated_at: string;
  site?: Site;
  inspector?: Profile;
  items?: InspectionItem[];
  corrective_actions?: CorrectiveAction[];
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  category: string;
  item_text: string;
  item_text_ar?: string;
  result: CheckpointResult;
  notes?: string;
  photo_path?: string;
  sort_order: number;
}

export interface CorrectiveAction {
  id: string;
  company_id: string;
  inspection_id?: string;
  inspection_item_id?: string;
  title: string;
  title_ar?: string;
  description?: string;
  priority: ActionPriority;
  status: ActionStatus;
  assigned_to?: string;
  due_date: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
}

export interface Subscription {
  id: string;
  company_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  max_workers: number;
  max_sites: number;
  trial_ends_at: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  company_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at: string;
  user?: Profile;
}

export interface DashboardMetrics {
  totalEmployees: number;
  validCertificates: number;
  expiringCertificates: number;
  expiredCertificates: number;
  overdueInspections: number;
  openCorrectiveActions: number;
  complianceRate: number;
}
