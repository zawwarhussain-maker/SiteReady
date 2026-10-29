-- ==============================================================================
-- SiteReady GCC — Migration 002: Audit Trail Triggers & Scheduled Reminders
-- Target: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. AUTOMATED AUDIT TRAIL LOGGING TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.log_entity_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_action VARCHAR(100);
    v_entity_type VARCHAR(100);
    v_entity_id UUID;
    v_old JSONB := NULL;
    v_new JSONB := NULL;
BEGIN
    v_user_id := auth.uid();
    v_entity_type := TG_TABLE_NAME;

    IF TG_OP = 'INSERT' THEN
        v_action := TG_TABLE_NAME || '_CREATED';
        v_entity_id := NEW.id;
        v_company_id := NEW.company_id;
        v_new := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := TG_TABLE_NAME || '_UPDATED';
        v_entity_id := NEW.id;
        v_company_id := NEW.company_id;
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);

        -- Special contextual action names for safety compliance
        IF TG_TABLE_NAME = 'inspections' AND OLD.status != NEW.status AND NEW.status IN ('completed_pass', 'completed_fail') THEN
            v_action := 'INSPECTION_COMPLETED';
        ELSIF TG_TABLE_NAME = 'company_members' AND OLD.role != NEW.role THEN
            v_action := 'MEMBER_ROLE_CHANGED';
        ELSIF TG_TABLE_NAME = 'employee_certificates' AND OLD.expiry_date != NEW.expiry_date THEN
            v_action := 'CERTIFICATE_RENEWED';
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_action := TG_TABLE_NAME || '_DELETED';
        v_entity_id := OLD.id;
        v_company_id := OLD.company_id;
        v_old := to_jsonb(OLD);
    END IF;

    -- Avoid infinite loops or empty companies
    IF v_company_id IS NOT NULL THEN
        INSERT INTO public.audit_events (
            company_id,
            user_id,
            action,
            entity_type,
            entity_id,
            old_values,
            new_values,
            created_at
        ) VALUES (
            v_company_id,
            v_user_id,
            v_action,
            v_entity_type,
            v_entity_id,
            v_old,
            v_new,
            NOW()
        );
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Attach audit triggers
DROP TRIGGER IF EXISTS trg_audit_employees ON public.employees;
CREATE TRIGGER trg_audit_employees
    AFTER INSERT OR UPDATE OR DELETE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION public.log_entity_audit_event();

DROP TRIGGER IF EXISTS trg_audit_certificates ON public.employee_certificates;
CREATE TRIGGER trg_audit_certificates
    AFTER INSERT OR UPDATE OR DELETE ON public.employee_certificates
    FOR EACH ROW EXECUTE FUNCTION public.log_entity_audit_event();

DROP TRIGGER IF EXISTS trg_audit_inspections ON public.inspections;
CREATE TRIGGER trg_audit_inspections
    AFTER INSERT OR UPDATE OR DELETE ON public.inspections
    FOR EACH ROW EXECUTE FUNCTION public.log_entity_audit_event();

DROP TRIGGER IF EXISTS trg_audit_members ON public.company_members;
CREATE TRIGGER trg_audit_members
    AFTER UPDATE OR DELETE ON public.company_members
    FOR EACH ROW EXECUTE FUNCTION public.log_entity_audit_event();

-- ==============================================================================
-- 2. COMPLIANCE EXPIRY & OVERDUE REMINDERS PROCESSOR
-- Designed for scheduled execution (pg_cron or Supabase Edge Function scheduled daily at 00:00 Asia/Riyadh)
-- Automatically identifies expiring certs at 30, 14, and 7 days, plus overdue items.
-- DEDUPLICATION ENFORCED: Never generates duplicate reminder jobs for the same event and target date.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.process_compliance_reminders()
RETURNS TABLE (
    total_processed INT,
    notice_30d_count INT,
    notice_14d_count INT,
    notice_7d_count INT,
    expired_count INT,
    overdue_inspections_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_30d_count INT := 0;
    v_14d_count INT := 0;
    v_7d_count INT := 0;
    v_exp_count INT := 0;
    v_overdue_ins_count INT := 0;
BEGIN
    -- 1. 30-Day Expiry Notice
    WITH inserted AS (
        INSERT INTO public.reminder_jobs (company_id, entity_type, entity_id, reminder_type, scheduled_for, channel, status)
        SELECT
            c.company_id,
            'certificate',
            c.id,
            '30d_notice',
            v_today,
            'in_app',
            'pending'
        FROM public.employee_certificates c
        WHERE c.expiry_date = (v_today + INTERVAL '30 days')
          AND NOT EXISTS (
              SELECT 1 FROM public.reminder_jobs r
              WHERE r.entity_id = c.id
                AND r.reminder_type = '30d_notice'
                AND r.scheduled_for = v_today
          )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_30d_count FROM inserted;

    -- 2. 14-Day Expiry Notice
    WITH inserted AS (
        INSERT INTO public.reminder_jobs (company_id, entity_type, entity_id, reminder_type, scheduled_for, channel, status)
        SELECT
            c.company_id,
            'certificate',
            c.id,
            '14d_notice',
            v_today,
            'in_app',
            'pending'
        FROM public.employee_certificates c
        WHERE c.expiry_date = (v_today + INTERVAL '14 days')
          AND NOT EXISTS (
              SELECT 1 FROM public.reminder_jobs r
              WHERE r.entity_id = c.id
                AND r.reminder_type = '14d_notice'
                AND r.scheduled_for = v_today
          )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_14d_count FROM inserted;

    -- 3. 7-Day Urgent Expiry Notice
    WITH inserted AS (
        INSERT INTO public.reminder_jobs (company_id, entity_type, entity_id, reminder_type, scheduled_for, channel, status)
        SELECT
            c.company_id,
            'certificate',
            c.id,
            '7d_notice',
            v_today,
            'in_app',
            'pending'
        FROM public.employee_certificates c
        WHERE c.expiry_date = (v_today + INTERVAL '7 days')
          AND NOT EXISTS (
              SELECT 1 FROM public.reminder_jobs r
              WHERE r.entity_id = c.id
                AND r.reminder_type = '7d_notice'
                AND r.scheduled_for = v_today
          )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_7d_count FROM inserted;

    -- 4. Critical Expired Notice (Expired Today or Past)
    WITH inserted AS (
        INSERT INTO public.reminder_jobs (company_id, entity_type, entity_id, reminder_type, scheduled_for, channel, status)
        SELECT
            c.company_id,
            'certificate',
            c.id,
            'expired',
            v_today,
            'in_app',
            'pending'
        FROM public.employee_certificates c
        WHERE c.expiry_date <= v_today
          AND NOT EXISTS (
              SELECT 1 FROM public.reminder_jobs r
              WHERE r.entity_id = c.id
                AND r.reminder_type = 'expired'
                AND r.scheduled_for = v_today
          )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_exp_count FROM inserted;

    -- 5. Overdue Inspections Notice
    WITH inserted AS (
        INSERT INTO public.reminder_jobs (company_id, entity_type, entity_id, reminder_type, scheduled_for, channel, status)
        SELECT
            i.company_id,
            'inspection',
            i.id,
            'overdue_inspection',
            v_today,
            'in_app',
            'pending'
        FROM public.inspections i
        WHERE i.scheduled_date < v_today
          AND i.status NOT IN ('completed_pass', 'completed_fail', 'cancelled')
          AND NOT EXISTS (
              SELECT 1 FROM public.reminder_jobs r
              WHERE r.entity_id = i.id
                AND r.reminder_type = 'overdue_inspection'
                AND r.scheduled_for = v_today
          )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_overdue_ins_count FROM inserted;

    RETURN QUERY SELECT
        (v_30d_count + v_14d_count + v_7d_count + v_exp_count + v_overdue_ins_count),
        v_30d_count,
        v_14d_count,
        v_7d_count,
        v_exp_count,
        v_overdue_ins_count;
END;
$$;
