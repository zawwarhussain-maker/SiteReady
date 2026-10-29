-- ==============================================================================
-- SiteReady GCC — Normalized PostgreSQL Schema & Multi-Tenant RLS Security Architecture
-- Target: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'viewer');
CREATE TYPE employment_status AS ENUM ('active', 'suspended', 'terminated', 'on_leave');
CREATE TYPE certificate_status AS ENUM ('valid', 'expiring_soon', 'expired', 'missing', 'no_expiry');
CREATE TYPE inspection_status AS ENUM ('draft', 'in_progress', 'completed_pass', 'completed_fail', 'cancelled');
CREATE TYPE checkpoint_result AS ENUM ('pass', 'fail', 'na');
CREATE TYPE action_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE action_status AS ENUM ('open', 'in_progress', 'resolved', 'verified_closed');
CREATE TYPE subscription_tier AS ENUM ('trial', 'starter', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'expired');

-- 3. CORE TENANT & USER TABLES

-- Companies (Tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    cr_number VARCHAR(50), -- KSA Commercial Registration (10 digits)
    vat_number VARCHAR(50),
    default_language VARCHAR(5) DEFAULT 'en' CHECK (default_language IN ('en', 'ar')),
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (Linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- matches auth.users.id
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    full_name_ar VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    preferred_language VARCHAR(5) DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Members (Multi-Tenant Access Bridge)
CREATE TABLE company_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    invited_email VARCHAR(255),
    invitation_token TEXT,
    invitation_accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- Sites (Multiple sites under one company)
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    client_name VARCHAR(255),
    location_city VARCHAR(100),
    code_reference VARCHAR(100), -- e.g. NEOM-OHS-SEC-14
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKFORCE & COMPLIANCE TABLES

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    employee_no VARCHAR(50) NOT NULL, -- e.g. SR-8921
    full_name VARCHAR(255) NOT NULL,
    full_name_ar VARCHAR(255),
    job_title VARCHAR(150) NOT NULL,
    job_title_ar VARCHAR(150),
    iqama_national_id VARCHAR(50) NOT NULL,
    nationality VARCHAR(100) DEFAULT 'Saudi Arabian',
    nationality_ar VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    joining_date DATE,
    employment_status employment_status DEFAULT 'active',
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, employee_no)
);

-- Certificate Types catalog
CREATE TABLE certificate_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    issuing_authority VARCHAR(255),
    requires_expiry BOOLEAN DEFAULT TRUE,
    validity_months INT DEFAULT 24,
    reminder_days_before INT DEFAULT 30,
    is_mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Certificates
CREATE TABLE employee_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    certificate_type_id UUID NOT NULL REFERENCES certificate_types(id) ON DELETE RESTRICT,
    license_number VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE, -- NULL when requires_expiry is FALSE
    attachment_path TEXT, -- private Supabase storage path
    attachment_filename VARCHAR(255),
    status certificate_status DEFAULT 'valid',
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INSPECTIONS & CORRECTIVE ACTIONS

-- Inspections
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    inspection_type VARCHAR(100) NOT NULL, -- e.g. Pre-Operation, Scafftag, Trench Safety
    inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    status inspection_status DEFAULT 'draft',
    summary_notes TEXT,
    supervisor_signature_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspection Checklist Items
CREATE TABLE inspection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    category VARCHAR(100) DEFAULT 'General Safety',
    item_text TEXT NOT NULL,
    item_text_ar TEXT,
    result checkpoint_result DEFAULT 'na',
    notes TEXT,
    photo_path TEXT,
    sort_order INT DEFAULT 0
);

-- Corrective Actions
CREATE TABLE corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    inspection_item_id UUID REFERENCES inspection_items(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    description TEXT,
    priority action_priority DEFAULT 'medium',
    status action_status DEFAULT 'open',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SUBSCRIPTIONS, REMINDERS & AUDIT TRAILS

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    tier subscription_tier DEFAULT 'trial',
    status subscription_status DEFAULT 'trial',
    max_workers INT DEFAULT 25,
    max_sites INT DEFAULT 3,
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Reminder Jobs
CREATE TABLE reminder_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'certificate' | 'inspection' | 'action'
    entity_id UUID NOT NULL,
    reminder_type VARCHAR(50) NOT NULL, -- '30d_notice' | '14d_notice' | '7d_notice' | 'expired'
    scheduled_for DATE NOT NULL,
    sent_at TIMESTAMPTZ,
    channel VARCHAR(50) DEFAULT 'in_app', -- 'in_app' | 'email' | 'whatsapp'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Events
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INDEXES FOR PERFORMANCE & AUDITING
CREATE INDEX idx_company_members_user ON company_members(user_id);
CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_site ON employees(site_id);
CREATE INDEX idx_employee_certificates_expiry ON employee_certificates(expiry_date, status);
CREATE INDEX idx_employee_certificates_employee ON employee_certificates(employee_id);
CREATE INDEX idx_inspections_site ON inspections(site_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_corrective_actions_due ON corrective_actions(due_date, status);
CREATE INDEX idx_audit_events_company ON audit_events(company_id, created_at DESC);

-- 8. HELPER SECURITY DEFINER FUNCTIONS (RLS Authorization)
CREATE OR REPLACE FUNCTION get_user_company_ids(uid UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT company_id 
    FROM company_members 
    WHERE user_id = uid AND is_active = TRUE;
$$;

CREATE OR REPLACE FUNCTION get_user_company_role(uid UUID, cid UUID)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role 
    FROM company_members 
    WHERE user_id = uid AND company_id = cid AND is_active = TRUE
    LIMIT 1;
$$;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update their own profile
CREATE POLICY profiles_user_policy ON profiles
    FOR ALL USING (id = auth.uid());

-- Companies: Members can view their companies; only Owners can update
CREATE POLICY companies_select_policy ON companies
    FOR SELECT USING (id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY companies_update_policy ON companies
    FOR UPDATE USING (get_user_company_role(auth.uid(), id) = 'owner');

CREATE POLICY companies_insert_policy ON companies
    FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Company Members: Members can view team; Owners can manage
CREATE POLICY company_members_select_policy ON company_members
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY company_members_modify_policy ON company_members
    FOR ALL USING (get_user_company_role(auth.uid(), company_id) = 'owner');

-- Sites: Members can view; Owners & Managers can modify
CREATE POLICY sites_select_policy ON sites
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY sites_modify_policy ON sites
    FOR ALL USING (get_user_company_role(auth.uid(), company_id) IN ('owner', 'manager'));

-- Employees: Members can view; Owners & Managers can modify
CREATE POLICY employees_select_policy ON employees
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY employees_modify_policy ON employees
    FOR ALL USING (get_user_company_role(auth.uid(), company_id) IN ('owner', 'manager'));

-- Certificate Types: Members can view; Owners & Managers can modify
CREATE POLICY cert_types_select_policy ON certificate_types
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY cert_types_modify_policy ON certificate_types
    FOR ALL USING (get_user_company_role(auth.uid(), company_id) IN ('owner', 'manager'));

-- Employee Certificates: Members can view; Owners & Managers can modify
CREATE POLICY employee_certs_select_policy ON employee_certificates
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY employee_certs_modify_policy ON employee_certificates
    FOR ALL USING (get_user_company_role(auth.uid(), company_id) IN ('owner', 'manager'));

-- Inspections: Members can view; Owners & Managers can modify
CREATE POLICY inspections_select_policy ON inspections
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY inspections_modify_policy ON inspections
    FOR ALL USING (get_user_company_role(auth.uid(), company_id) IN ('owner', 'manager'));

-- Inspection Items: Inherits via Inspection company_id
CREATE POLICY inspection_items_select_policy ON inspection_items
    FOR SELECT USING (
        inspection_id IN (
            SELECT id FROM inspections 
            WHERE company_id IN (SELECT get_user_company_ids(auth.uid()))
        )
    );

CREATE POLICY inspection_items_modify_policy ON inspection_items
    FOR ALL USING (
        inspection_id IN (
            SELECT id FROM inspections 
            WHERE get_user_company_role(auth.uid(), company_id) IN ('owner', 'manager')
        )
    );

-- Corrective Actions: Members can view; Owners & Managers can modify
CREATE POLICY corrective_actions_select_policy ON corrective_actions
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY corrective_actions_modify_policy ON corrective_actions
    FOR ALL USING (get_user_company_role(auth.uid(), company_id) IN ('owner', 'manager'));

-- Subscriptions: Members can view; Only Owners can modify
CREATE POLICY subscriptions_select_policy ON subscriptions
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY subscriptions_modify_policy ON subscriptions
    FOR ALL USING (get_user_company_role(auth.uid(), company_id) = 'owner');

-- Reminder Jobs: Members can view their company reminders
CREATE POLICY reminder_jobs_select_policy ON reminder_jobs
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- Audit Events: Members can view; Insert only by system
CREATE POLICY audit_events_select_policy ON audit_events
    FOR SELECT USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- 10. REAL-TIME BUSINESS LOGIC: CERTIFICATE STATUS CALCULATION
CREATE OR REPLACE FUNCTION compute_certificate_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expiry_date IS NULL THEN
        NEW.status := 'no_expiry';
    ELSIF NEW.expiry_date < CURRENT_DATE THEN
        NEW.status := 'expired';
    ELSIF NEW.expiry_date <= (CURRENT_DATE + INTERVAL '30 days') THEN
        NEW.status := 'expiring_soon';
    ELSE
        NEW.status := 'valid';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_certificate_status
    BEFORE INSERT OR UPDATE OF expiry_date ON employee_certificates
    FOR EACH ROW
    EXECUTE FUNCTION compute_certificate_status();
