-- ==============================================================================
-- SiteReady GCC — Migration 001: Private Storage Setup & Auth Triggers
-- Target: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. SETUP PRIVATE STORAGE BUCKET FOR SENSITIVE CONTRACTOR DOCUMENTS
-- Private bucket: files are NOT publicly accessible; short-lived signed URLs required
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'contractor-docs',
    'contractor-docs',
    FALSE,
    10485760, -- 10MB limit per document
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = FALSE,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- Note: Row Level Security is already enabled on storage.objects by Supabase by default.
-- Do not run "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;" as storage.objects is owned by supabase_storage_admin.

-- Drop existing policies if any to ensure clean re-runnability
DROP POLICY IF EXISTS "contractor_docs_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "contractor_docs_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "contractor_docs_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "contractor_docs_delete_policy" ON storage.objects;

-- Policy 1: SELECT (Download / View via Signed URL)
-- File path format: <company_id>/<folder>/<filename>
-- User must be an active member of the company matching the top-level folder
CREATE POLICY "contractor_docs_select_policy" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'contractor-docs'
        AND (storage.foldername(name))[1]::uuid IN (SELECT get_user_company_ids(auth.uid()))
    );

-- Policy 2: INSERT (Upload Document)
-- User must be an Owner or Manager of the company matching the top-level folder
CREATE POLICY "contractor_docs_insert_policy" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'contractor-docs'
        AND get_user_company_role(auth.uid(), (storage.foldername(name))[1]::uuid) IN ('owner', 'manager')
    );

-- Policy 3: UPDATE (Replace Document)
CREATE POLICY "contractor_docs_update_policy" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'contractor-docs'
        AND get_user_company_role(auth.uid(), (storage.foldername(name))[1]::uuid) IN ('owner', 'manager')
    );

-- Policy 4: DELETE (Remove Document)
CREATE POLICY "contractor_docs_delete_policy" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'contractor-docs'
        AND get_user_company_role(auth.uid(), (storage.foldername(name))[1]::uuid) IN ('owner', 'manager')
    );

-- ==============================================================================
-- 2. AUTHENTICATION HOOKS & AUTOMATIC PROFILE CREATION
-- Automatically creates a profile record in public.profiles when a user signs up
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        preferred_language,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Drop trigger if exists, then attach to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. ATOMIC COMPANY ONBOARDING STORED PROCEDURE
-- Allows an authenticated user to create their company, become the 'owner',
-- create an initial site, setup standard credential types, and initialize a trial.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_company_with_owner(
    p_company_name VARCHAR(255),
    p_company_name_ar VARCHAR(255) DEFAULT NULL,
    p_cr_number VARCHAR(50) DEFAULT NULL,
    p_vat_number VARCHAR(50) DEFAULT NULL,
    p_default_language VARCHAR(5) DEFAULT 'en',
    p_initial_site_name VARCHAR(255) DEFAULT 'Main Project Site'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_site_id UUID;
    v_sub_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to create a company';
    END IF;

    -- 1. Create company
    INSERT INTO public.companies (
        name,
        name_ar,
        cr_number,
        vat_number,
        default_language,
        timezone
    ) VALUES (
        p_company_name,
        p_company_name_ar,
        p_cr_number,
        p_vat_number,
        p_default_language,
        'Asia/Riyadh'
    ) RETURNING id INTO v_company_id;

    -- 2. Add authenticated user as Owner
    INSERT INTO public.company_members (
        company_id,
        user_id,
        role,
        is_active,
        invitation_accepted_at
    ) VALUES (
        v_company_id,
        v_user_id,
        'owner',
        TRUE,
        NOW()
    );

    -- 3. Create initial site
    INSERT INTO public.sites (
        company_id,
        name,
        name_ar,
        is_active
    ) VALUES (
        v_company_id,
        p_initial_site_name,
        CASE WHEN p_company_name_ar IS NOT NULL THEN p_initial_site_name || ' (الموقع الرئيسي)' ELSE NULL END,
        TRUE
    ) RETURNING id INTO v_site_id;

    -- 4. Create default 14-day enterprise trial subscription
    INSERT INTO public.subscriptions (
        company_id,
        tier,
        status,
        max_workers,
        max_sites,
        trial_ends_at,
        current_period_end
    ) VALUES (
        v_company_id,
        'enterprise',
        'trial',
        200,
        10,
        NOW() + INTERVAL '14 days',
        NOW() + INTERVAL '14 days'
    ) RETURNING id INTO v_sub_id;

    -- 5. Seed standard GCC / Aramco mandatory credential types
    INSERT INTO public.certificate_types (company_id, name, name_ar, issuing_authority, requires_expiry, validity_months, reminder_days_before, is_mandatory)
    VALUES
        (v_company_id, 'Saudi Aramco Rigging Specialist Level 1', 'أخصائي حبال وتثبيت أرامكو السعودية - المستوى 1', 'Saudi Aramco Inspection Dept', TRUE, 36, 30, TRUE),
        (v_company_id, 'NEBOSH International General Certificate (IGC)', 'الشهادة العامة الدولية للسلامة والصحة المهنية (نيبوش)', 'NEBOSH UK', FALSE, 0, 0, FALSE),
        (v_company_id, 'Mobile Crane Operator Certification (TÜV)', 'رخصة مشغل رافعة متحركة معتمدة (توف)', 'TÜV Middle East', TRUE, 12, 30, TRUE),
        (v_company_id, 'First Aid & CPR Card (Saudi Red Crescent)', 'بطاقة مسعف أولي وإنعاش قلبي (الهلال الأحمر السعودي)', 'Saudi Red Crescent Authority', TRUE, 24, 30, TRUE),
        (v_company_id, 'Scaffolding Erector / Inspector (CITB / CISRS)', 'فاحص ومفتش سقالات معتمد', 'CISRS Middle East', TRUE, 24, 30, TRUE);

    -- 6. Log audit event
    INSERT INTO public.audit_events (
        company_id,
        user_id,
        action,
        entity_type,
        entity_id,
        new_values
    ) VALUES (
        v_company_id,
        v_user_id,
        'COMPANY_CREATED',
        'companies',
        v_company_id,
        jsonb_build_object('name', p_company_name, 'cr_number', p_cr_number)
    );

    RETURN jsonb_build_object(
        'company_id', v_company_id,
        'site_id', v_site_id,
        'subscription_id', v_sub_id,
        'role', 'owner'
    );
END;
$$;
