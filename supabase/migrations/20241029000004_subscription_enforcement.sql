-- ==============================================================================
-- Migration: 20241029000004_subscription_enforcement.sql
-- Description: Database-level subscription tier limits enforcement for SiteReady GCC
-- Tables: employees, sites, subscriptions
-- ==============================================================================

-- 1. Function to enforce worker capacity on employees insert
CREATE OR REPLACE FUNCTION trg_enforce_subscription_worker_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_max_workers INT;
    v_current_count INT;
BEGIN
    -- Retrieve max_workers from subscription for this company
    SELECT max_workers INTO v_max_workers
    FROM subscriptions
    WHERE company_id = NEW.company_id;

    -- If no subscription found, default to trial limit (25)
    IF v_max_workers IS NULL THEN
        v_max_workers := 25;
    END IF;

    -- Count active employees for this company
    SELECT COUNT(*) INTO v_current_count
    FROM employees
    WHERE company_id = NEW.company_id
      AND employment_status = 'active';

    IF v_current_count >= v_max_workers THEN
        RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED: Company has reached the maximum worker capacity (%) for its subscription tier. Please upgrade.', v_max_workers
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger on employees table
DROP TRIGGER IF EXISTS trg_check_worker_limit ON employees;
CREATE TRIGGER trg_check_worker_limit
    BEFORE INSERT ON employees
    FOR EACH ROW
    EXECUTE FUNCTION trg_enforce_subscription_worker_limit();

-- 3. Function to enforce project site capacity on sites insert
CREATE OR REPLACE FUNCTION trg_enforce_subscription_site_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_max_sites INT;
    v_current_count INT;
BEGIN
    -- Retrieve max_sites from subscription for this company
    SELECT max_sites INTO v_max_sites
    FROM subscriptions
    WHERE company_id = NEW.company_id;

    -- If no subscription found, default to trial limit (3)
    IF v_max_sites IS NULL THEN
        v_max_sites := 3;
    END IF;

    -- Count active sites for this company
    SELECT COUNT(*) INTO v_current_count
    FROM sites
    WHERE company_id = NEW.company_id
      AND is_active = TRUE;

    IF v_current_count >= v_max_sites THEN
        RAISE EXCEPTION 'SUBSCRIPTION_SITE_LIMIT_EXCEEDED: Company has reached the maximum project site capacity (%) for its subscription tier. Please upgrade.', v_max_sites
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger on sites table
DROP TRIGGER IF EXISTS trg_check_site_limit ON sites;
CREATE TRIGGER trg_check_site_limit
    BEFORE INSERT ON sites
    FOR EACH ROW
    EXECUTE FUNCTION trg_enforce_subscription_site_limit();
