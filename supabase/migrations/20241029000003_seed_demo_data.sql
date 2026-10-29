-- ==============================================================================
-- SiteReady GCC — Migration 003: Multi-Tenant Seed Data for Verification
-- Two distinct companies: Al-Fanar Contracting KSA vs Red Sea Horizon Contracting
-- ==============================================================================

-- 1. COMPANIES (TENANTS)
INSERT INTO public.companies (id, name, name_ar, cr_number, vat_number, default_language, timezone)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Al-Fanar Contracting KSA', 'شركة الفنار للمقاولات المحدودة', '1010294821', '31029482100003', 'en', 'Asia/Riyadh'),
    ('b0000000-0000-0000-0000-000000000002', 'Red Sea Horizon Contracting', 'شركة أفق البحر الأحمر للمقاولات', '4030198422', '31039842200003', 'ar', 'Asia/Riyadh')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. USER PROFILES
INSERT INTO public.profiles (id, email, full_name, full_name_ar, phone, preferred_language)
VALUES
    -- Tenant A Users
    ('10000000-0000-0000-0000-000000000001', 'tariq.otaibi@alfanar.com', 'Eng. Tariq Al-Otaibi', 'م. طارق العتيبي', '+966501928491', 'en'),
    ('10000000-0000-0000-0000-000000000002', 'zayd.harbi@alfanar.com', 'Zayd Al-Harbi', 'زيد الحربي', '+966552948192', 'ar'),
    ('10000000-0000-0000-0000-000000000003', 'auditor@neom.com', 'Third-Party NEOM Auditor', 'مدقق هيئة نيوم المعتمد', '+966540192841', 'en'),
    -- Tenant B Users
    ('20000000-0000-0000-0000-000000000001', 'faisal.dossary@redseahorizon.sa', 'Faisal Al-Dossary', 'فيصل الدوسري', '+966509988112', 'ar'),
    ('20000000-0000-0000-0000-000000000002', 'omar.sulaiman@redseahorizon.sa', 'Omar Al-Sulaiman', 'عمر السليمان', '+966551122334', 'ar'),
    ('20000000-0000-0000-0000-000000000003', 'rsg.auditor@redseaglobal.com', 'Red Sea Global Client Auditor', 'مدقق شركة البحر الأحمر الدولية', '+966539988776', 'en')
ON CONFLICT (id) DO NOTHING;

-- 3. COMPANY MEMBERSHIPS (Multi-Tenant Role Bridge)
INSERT INTO public.company_members (company_id, user_id, role, is_active)
VALUES
    -- Company A (Al-Fanar)
    ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'owner', TRUE),
    ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'manager', TRUE),
    ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'viewer', TRUE),
    -- Company B (Red Sea Horizon)
    ('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'owner', TRUE),
    ('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'manager', TRUE),
    ('b0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'viewer', TRUE)
ON CONFLICT (company_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- 4. PROJECT SITES
INSERT INTO public.sites (id, company_id, name, name_ar, client_name, location_city, code_reference, is_active)
VALUES
    -- Company A Sites
    ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'NEOM Spine Sector 4', 'نيوم - محور العمود الفقري - القطاع 4', 'NEOM Authority / Bechtel', 'Tabuk / NEOM', 'NEOM-OHS-SEC-14', TRUE),
    ('a1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Riyadh Metro Western Hub (Line 3)', 'مترو الرياض - المحور الغربي (المسار 3)', 'Royal Commission for Riyadh City', 'Riyadh', 'SASO-OHS-101', TRUE),
    -- Company B Sites
    ('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'AMAALA Triple Bay Marina Package', 'مشروع أمالا - مارينا خليج تريبل', 'Red Sea Global (RSG)', 'Tabuk Coastal', 'RSG-AMAALA-08', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. CERTIFICATE MASTER TYPES
INSERT INTO public.certificate_types (id, company_id, name, name_ar, issuing_authority, requires_expiry, validity_months, reminder_days_before, is_mandatory)
VALUES
    -- Company A Types
    ('ac000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Saudi Aramco Rigging Specialist Level 1', 'أخصائي حبال وتثبيت أرامكو السعودية - المستوى 1', 'Saudi Aramco Inspection Dept', TRUE, 36, 30, TRUE),
    ('ac000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Mobile Crane Operator Certification (TÜV)', 'رخصة مشغل رافعة متحركة معتمدة (توف)', 'TÜV Middle East', TRUE, 12, 30, TRUE),
    ('ac000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'First Aid & CPR Card (Saudi Red Crescent)', 'بطاقة مسعف أولي وإنعاش قلبي (الهلال الأحمر)', 'Saudi Red Crescent Authority', TRUE, 24, 30, TRUE),
    -- Company B Types
    ('bc000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Marine Diving & Underwater Piling Permit', 'تصريح أعمال الغوص ودق الخوازيق البحرية', 'Saudi Coast Guard & Ports Auth', TRUE, 12, 30, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. EMPLOYEES
INSERT INTO public.employees (id, company_id, site_id, employee_no, full_name, full_name_ar, job_title, job_title_ar, iqama_national_id, nationality, phone, employment_status, joining_date)
VALUES
    -- Company A Workforce
    ('ae000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'SR-8921', 'Mohammad Salem Al-Shammari', 'محمد بن سالم الشمري', 'Rigging Supervisor & Signalman', 'مشرف تصبير وإشارات رافعات', '1092837461', 'Saudi Arabia', '+966501234567', 'active', '2022-03-01'),
    ('ae000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'SR-8928', 'Rahul Sharma', 'راهول شارما', 'Heavy Mobile Crane Operator (120T)', 'مشغل رافعة متحركة ثقيلة (120 طن)', '2398471928', 'India', '+966558877665', 'active', '2023-01-15'),
    -- Company B Workforce
    ('be000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'RSH-101', 'Ibrahim Al-Nasser', 'إبراهيم الناصر', 'Marine Piling Superintendent', 'مشرف أعمال الخوازيق البحرية', '1088443322', 'Saudi Arabia', '+966504433221', 'active', '2023-05-10')
ON CONFLICT (id) DO NOTHING;

-- 7. EMPLOYEE CERTIFICATES
INSERT INTO public.employee_certificates (id, company_id, employee_id, certificate_type_id, license_number, issue_date, expiry_date, status)
VALUES
    -- Company A: Mohammad Salem (Valid Aramco Rigging)
    ('a2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ae000000-0000-0000-0000-000000000001', 'ac000000-0000-0000-0000-000000000001', 'ARAMCO-RIG-2024-984', '2024-01-15', CURRENT_DATE + INTERVAL '180 days', 'valid'),
    -- Company A: Rahul Sharma (Expired TÜV Crane Operator - Barred Gate Interlock!)
    ('a2000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ae000000-0000-0000-0000-000000000002', 'ac000000-0000-0000-0000-000000000002', 'TUV-CRN-2023-412', '2023-10-10', CURRENT_DATE - INTERVAL '5 days', 'expired'),
    -- Company B: Ibrahim Al-Nasser (Valid Marine Diving)
    ('b2000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'be000000-0000-0000-0000-000000000001', 'bc000000-0000-0000-0000-000000000001', 'CG-PORT-2024-099', '2024-03-01', CURRENT_DATE + INTERVAL '90 days', 'valid')
ON CONFLICT (id) DO NOTHING;

-- 8. SUBSCRIPTIONS
INSERT INTO public.subscriptions (id, company_id, tier, status, max_workers, max_sites)
VALUES
    ('a3000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'enterprise', 'trial', 200, 10),
    ('b3000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'starter', 'active', 25, 2)
ON CONFLICT (company_id) DO NOTHING;
