import {
  Company,
  Site,
  Employee,
  CertificateType,
  EmployeeCertificate,
  Inspection,
  CorrectiveAction,
  Subscription,
  Profile,
  CompanyMember
} from '../types';

export const INITIAL_COMPANY: Company = {
  id: 'cmp-alfanar-01',
  name: 'Al-Fanar Contracting KSA',
  name_ar: 'شركة الفنار للمقاولات المحدودة',
  cr_number: '1010294821',
  vat_number: '31029482100003',
  default_language: 'en',
  timezone: 'Asia/Riyadh',
  logo_url: 'https://lh3.googleusercontent.com/aida/AEtjO1VX1V9SdRFFhgpboEFUm-W8JErTdQ41dlAyiY7-1B6v4Gk_xMV6YnX6rfBNzva_JqoI8tlkJ2l5Hl3Rrwl2U4tnqmLyWgqjBIUG9etkwyKSbtxJnY5sRXBbEOPRBgL-GmsMzVuMp2mvJOZQL-ba9tzViN2M4YQ3AuGdfB4AFiY9PN8kTULEtL4eX2z3l5L05jr_3zjMGVpuUa3gvzSD_R2dJz8Ejv4wF0MOxKiLA_brkA',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-10-22T08:00:00Z'
};

export const INITIAL_USER: Profile = {
  id: 'usr-tariq-otaibi',
  email: 'tariq.otaibi@alfanar.com',
  full_name: 'Eng. Tariq Al-Otaibi',
  full_name_ar: 'م. طارق العتيبي',
  phone: '+966 50 192 8491',
  avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDksBcF3N42VeGUydZc2M3lAuVDj03-KWWxv_yBZDIICQHQaF64BAXnDLVgn6fD-OKFgrsZg5cGhfyk88YR1sntM5h4EKlP41WEE7-gc_-u5e92yfPL4jS3UbY5PSa2URRe01kD_WuzOzk9aHNbqYNID630vcxgw35zlP2LazzmNtk6YmF3k-Mbk9b5ifNjhhfsPfYXslRAcXIhy1c9KlCEf98qCtoDVZXENBYPND9q',
  preferred_language: 'en',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-10-22T08:00:00Z'
};

export const INITIAL_MEMBERS: CompanyMember[] = [
  {
    id: 'mem-1',
    company_id: 'cmp-alfanar-01',
    user_id: 'usr-tariq-otaibi',
    role: 'owner',
    is_active: true,
    joined_at: '2024-01-10T08:00:00Z',
    created_at: '2024-01-10T08:00:00Z',
    user: INITIAL_USER
  },
  {
    id: 'mem-2',
    company_id: 'cmp-alfanar-01',
    user_id: 'usr-zayd-harbi',
    role: 'manager',
    is_active: true,
    joined_at: '2024-02-15T08:00:00Z',
    created_at: '2024-02-15T08:00:00Z',
    user: {
      id: 'usr-zayd-harbi',
      email: 'zayd.harbi@alfanar.com',
      full_name: 'Zayd Al-Harbi',
      full_name_ar: 'زيد الحربي',
      preferred_language: 'ar',
      created_at: '2024-02-15T08:00:00Z',
      updated_at: '2024-10-22T08:00:00Z'
    }
  },
  {
    id: 'mem-3',
    company_id: 'cmp-alfanar-01',
    user_id: 'usr-auditor-viewer',
    role: 'viewer',
    is_active: true,
    joined_at: '2024-05-01T08:00:00Z',
    created_at: '2024-05-01T08:00:00Z',
    user: {
      id: 'usr-auditor-viewer',
      email: 'auditor@neom.com',
      full_name: 'Third-Party NEOM Auditor',
      full_name_ar: 'مدقق هيئة نيوم المعتمد',
      preferred_language: 'en',
      created_at: '2024-05-01T08:00:00Z',
      updated_at: '2024-10-22T08:00:00Z'
    }
  }
];

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-neom-4',
    company_id: 'cmp-alfanar-01',
    name: 'NEOM Spine Sector 4',
    name_ar: 'نيوم - محور العمود الفقري - القطاع 4',
    client_name: 'NEOM Authority / Bechtel',
    location_city: 'Tabuk / NEOM',
    code_reference: 'NEOM-OHS-SEC-14',
    is_active: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'site-metro-3',
    company_id: 'cmp-alfanar-01',
    name: 'Riyadh Metro Western Hub (Line 3)',
    name_ar: 'مترو الرياض - المحور الغربي (المسار 3)',
    client_name: 'Royal Commission for Riyadh City (RCRC)',
    location_city: 'Riyadh',
    code_reference: 'SASO-OHS-101',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'site-redsea-coastal',
    company_id: 'cmp-alfanar-01',
    name: 'Red Sea Project Coastal Zone',
    name_ar: 'مشروع البحر الأحمر - المنطقة الساحلية',
    client_name: 'Red Sea Global (RSG)',
    location_city: 'Umluj',
    code_reference: 'RSG-SAFE-2.4',
    is_active: true,
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  }
];

export const INITIAL_CERT_TYPES: CertificateType[] = [
  {
    id: 'ct-aramco-rigging',
    company_id: 'cmp-alfanar-01',
    name: 'Saudi Aramco Rigging Specialist Level 1',
    name_ar: 'أخصائي حبال وتثبيت أرامكو السعودية - المستوى 1',
    issuing_authority: 'Saudi Aramco Inspection Dept',
    requires_expiry: true,
    validity_months: 36,
    reminder_days_before: 30,
    is_mandatory: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'ct-tuv-crane',
    company_id: 'cmp-alfanar-01',
    name: 'TÜV Heavy Crane Signaling & Banksman',
    name_ar: 'توجيه الرافعات والإشارات - تي يو في راينلاند',
    issuing_authority: 'TÜV Middle East Certification',
    requires_expiry: true,
    validity_months: 24,
    reminder_days_before: 30,
    is_mandatory: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'ct-sec-hv',
    company_id: 'cmp-alfanar-01',
    name: 'SEC High-Voltage Authorized Electrical Person (AEP)',
    name_ar: 'الشخص المخول للجهد العالي (AEP) - الكهرباء السعودية',
    issuing_authority: 'Saudi Electricity Company (SEC)',
    requires_expiry: true,
    validity_months: 24,
    reminder_days_before: 30,
    is_mandatory: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'ct-cisrs-scaffold',
    company_id: 'cmp-alfanar-01',
    name: 'CISRS Advanced Scaffolding Inspector Level 3',
    name_ar: 'مفتش سقالات متقدم فئة 3 - CISRS',
    issuing_authority: 'CISRS International GCC',
    requires_expiry: true,
    validity_months: 36,
    reminder_days_before: 30,
    is_mandatory: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'ct-nebosh-igc',
    company_id: 'cmp-alfanar-01',
    name: 'NEBOSH International General Certificate (IGC)',
    name_ar: 'الشهادة العامة الدولية في الصحة والسلامة (NEBOSH IGC)',
    issuing_authority: 'NEBOSH UK Examination Board',
    requires_expiry: false, // Lifetime
    validity_months: 0,
    reminder_days_before: 0,
    is_mandatory: false,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'ct-civil-defense-998',
    company_id: 'cmp-alfanar-01',
    name: 'Civil Defense Fire Safety Marshal (Code 998)',
    name_ar: 'مرشد سلامة من الحرائق - الدفاع المدني (998)',
    issuing_authority: 'General Directorate of Civil Defense KSA',
    requires_expiry: true,
    validity_months: 24,
    reminder_days_before: 30,
    is_mandatory: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-mohammad-salem',
    company_id: 'cmp-alfanar-01',
    site_id: 'site-neom-4',
    employee_no: 'SR-8921',
    full_name: 'Mohammad Salem Al-Dosari',
    full_name_ar: 'محمد سالم الدوسري',
    job_title: 'Senior Rigging Specialist & Crane Signaler',
    job_title_ar: 'أخصائي رافعات وحبال متقدم وموجه',
    iqama_national_id: '2398412093',
    nationality: 'Saudi Arabian',
    nationality_ar: 'سعودي',
    phone: '+966 54 819 2039',
    email: 'mohammad.salem@redsearigging.com',
    joining_date: '2022-03-15',
    employment_status: 'active',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDRpWWZ_EqTLf9nAGPT16EN3pTtKFrNsiUsjZAYjf1Mo2LwAa-v93WApnDAnvfPwtFRNZn2d9tkWyS728xnpRhr50KsTh0b4qA7t8vMRSWAN5q5plZ6zSybrklqvJbskel0ipmcT3qKHGDiYo5iqJIjsTDlkFomjrvVFGI1aaVqbNlEYIiMK3ria1NTpPIZYHpGfAttQZ6hXSvhUt_B4NN9xtWSQeO_lj3BGCFG-u5',
    notes: 'Certified Aramco Rigger 1. Lead rigger for NEOM tunnel boring staging.',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'emp-bilal-ahmed',
    company_id: 'cmp-alfanar-01',
    site_id: 'site-metro-3',
    employee_no: 'SR-8942',
    full_name: 'Bilal Ahmed',
    full_name_ar: 'بلال أحمد',
    job_title: 'Tower Crane Operator',
    job_title_ar: 'مشغل رافعات برجية',
    iqama_national_id: '2310849201',
    nationality: 'Pakistani',
    nationality_ar: 'باكستاني',
    phone: '+966 56 123 4567',
    email: 'bilal.ahmed@gulfmep.com',
    joining_date: '2023-01-10',
    employment_status: 'active',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhuWi0K2iCkqpZZT0D4ZW0evJ-u9RbrHmGRfIQoljL0ZPuzJhnG4XnjNqiMg1k_-aZo32-TFAk_Oty23CqNvmBSrQgGBRDgbH4KL43IJLHLO-OSX98arJueEej_aVNhxOZJDQYDn0gx4J9raoBONY63k0SckfkYU6ZCZugb7-Atrjef-juKnBdAlpn8ImCGeSIRNj2xTxuuMtw-sVv5mChbBo8vjKfsBsCa1yBPmr4',
    notes: 'Crane operator for Riyadh Metro Package 4. TÜV credential expires within 5 days.',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'emp-suresh-chandran',
    company_id: 'cmp-alfanar-01',
    site_id: 'site-redsea-coastal',
    employee_no: 'SR-8955',
    full_name: 'Suresh Chandran',
    full_name_ar: 'سوريش تشاندران',
    job_title: 'Master Scaffolder & Inspector',
    job_title_ar: 'مفتش ومشرف سقالات معتمد',
    iqama_national_id: '2390192847',
    nationality: 'Indian',
    nationality_ar: 'هندي',
    phone: '+966 55 987 6543',
    email: 'suresh.c@modernscaffolding.com',
    joining_date: '2022-08-01',
    employment_status: 'suspended',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCZTZERYB2KGTFWHxC2-W1SOkId5YjEWN-CQqmqCZBfJdoxdP8nrLDyKfeLMBu6ESV5a8apAK9UKXG5KcaTOMUoCRzJ9g4B7E5du7M3XY96vVqpBle-950S_ZUPOgnL54F2XzWBN3xykXJw8G6A6i_VlO6o_-smI9Jc8Cntn_cWw04HsrD0kTFYFR6qR1r7qunVAWZB1Mc2KZ-Tq2jP3_r0YY4cxDvIQG2A8tn4Vcl',
    notes: 'Barred at turnstile. Iqama expired 3 days ago. Fast renewal in progress with Qiwa.',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'emp-omar-ghamdi',
    company_id: 'cmp-alfanar-01',
    site_id: 'site-neom-4',
    employee_no: 'SR-8980',
    full_name: 'Omar Al-Ghamdi',
    full_name_ar: 'عمر الغامدي',
    job_title: 'HV Electrical Specialist',
    job_title_ar: 'أخصائي كهرباء جهد عالي',
    iqama_national_id: '1089201948',
    nationality: 'Saudi Arabian',
    nationality_ar: 'سعودي',
    phone: '+966 50 443 2190',
    email: 'omar.ghamdi@alfanar.com',
    joining_date: '2021-06-01',
    employment_status: 'active',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn95uG7Zo8tefS7dKGu4F-_R1S2CO2jGRVsQ06kvKBex898wXi2JITNE-kUYqhVI0i7e5J27xIQyjqQ8aVC1GT2lYIoL8TC_yrkqa5e2zGWttIBM89qsqxeCr1snefynGOSpQLxtsKwVuLvLWpWVikBms2rweY9LN8_BmNT1dE50QSyicTl-ZL-lB6Fo8u2lK6eAzhoU1OPeT0jhVQDA-zMdSTHYtlA1rckqCdf0G0',
    notes: 'Authorized Electrical Person (AEP) for SEC substation connection.',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'emp-tariq-mansoor',
    company_id: 'cmp-alfanar-01',
    site_id: 'site-neom-4',
    employee_no: 'SR-8971',
    full_name: 'Tariq Mansoor',
    full_name_ar: 'طارق منصور',
    job_title: 'High-Voltage Cable Splicer',
    job_title_ar: 'فني توصيل كابلات جهد عالي',
    iqama_national_id: '2398129041',
    nationality: 'Pakistani',
    nationality_ar: 'باكستاني',
    phone: '+966 55 334 1122',
    email: 'tariq.m@redsearigging.com',
    joining_date: '2022-11-15',
    employment_status: 'suspended',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWfp4rcViizeb3AcWWyVFesw2Rs4VEoWivaXXEqyaybWN_cZIAf_yU8e4pz2xfPvJQJ8-A0wWHl_iGkihjA5lst4hnAXHutmJDZF0WhFkLd-DLc_h1IyTCjrTgg_G7Vsegou7ozPvjjRlKuigRd7SAiBN3ABpUmVepekf6WlJ_5bte8gV7uH4_pMV0SkXPVOMlx2Q-UnZuijNb0ZGAwzjDCib4W6PjpFCZg5M5w473',
    notes: 'Barred at turnstile. SEC High Voltage qualification expired 5 days ago.',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'emp-zayd-harbi',
    company_id: 'cmp-alfanar-01',
    site_id: 'site-neom-4',
    employee_no: 'SR-8911',
    full_name: 'Zayd Al-Harbi',
    full_name_ar: 'زيد الحربي',
    job_title: 'Site Safety Marshal & HSE Officer',
    job_title_ar: 'مسؤول سلامة ميداني ومراقب صحة وسلامة',
    iqama_national_id: '1083920194',
    nationality: 'Saudi Arabian',
    nationality_ar: 'سعودي',
    phone: '+966 50 771 8822',
    email: 'zayd.harbi@alfanar.com',
    joining_date: '2020-04-10',
    employment_status: 'active',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDksBcF3N42VeGUydZc2M3lAuVDj03-KWWxv_yBZDIICQHQaF64BAXnDLVgn6fD-OKFgrsZg5cGhfyk88YR1sntM5h4EKlP41WEE7-gc_-u5e92yfPL4jS3UbY5PSa2URRe01kD_WuzOzk9aHNbqYNID630vcxgw35zlP2LazzmNtk6YmF3k-Mbk9b5ifNjhhfsPfYXslRAcXIhy1c9KlCEf98qCtoDVZXENBYPND9q',
    notes: 'NEBOSH IGC Certified Safety Marshal. Leads weekly tool-box safety briefings.',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  }
];

export const INITIAL_CERTIFICATES: EmployeeCertificate[] = [
  {
    id: 'cert-1',
    company_id: 'cmp-alfanar-01',
    employee_id: 'emp-mohammad-salem',
    certificate_type_id: 'ct-aramco-rigging',
    license_number: 'SA-RGL1-2023-8841',
    issue_date: '2023-08-15',
    expiry_date: '2026-08-14',
    status: 'valid',
    verified_by: 'usr-tariq-otaibi',
    verified_at: '2023-08-16T10:00:00Z',
    attachment_path: 'certificates/sa-rig-8841.pdf',
    attachment_filename: 'Saudi_Aramco_Rigger_Level1_MohammadSalem.pdf',
    notes: 'Verified against Aramco Inspection database.',
    created_at: '2023-08-16T10:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'cert-2',
    company_id: 'cmp-alfanar-01',
    employee_id: 'emp-bilal-ahmed',
    certificate_type_id: 'ct-tuv-crane',
    license_number: 'TUV-CRN-9912',
    issue_date: '2022-11-04',
    expiry_date: '2024-11-03', // 5 days from now
    status: 'expiring_soon',
    verified_by: 'usr-tariq-otaibi',
    verified_at: '2022-11-05T09:00:00Z',
    attachment_path: 'certificates/tuv-crane-9912.pdf',
    attachment_filename: 'TUV_Crane_Signaling_BilalAhmed.pdf',
    notes: 'Renewal booking scheduled with TÜV Riyadh for 01 Nov 2024.',
    created_at: '2022-11-05T09:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'cert-3',
    company_id: 'cmp-alfanar-01',
    employee_id: 'emp-suresh-chandran',
    certificate_type_id: 'ct-cisrs-scaffold',
    license_number: 'CISRS-GCC-88219',
    issue_date: '2021-10-20',
    expiry_date: '2024-10-20', // Expired
    status: 'expired',
    verified_by: 'usr-tariq-otaibi',
    verified_at: '2021-10-21T08:00:00Z',
    attachment_path: 'certificates/cisrs-88219.pdf',
    attachment_filename: 'CISRS_Level3_SureshChandran.pdf',
    notes: 'Expired card caused gate interlock hold. Re-assessment booked.',
    created_at: '2021-10-21T08:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'cert-4',
    company_id: 'cmp-alfanar-01',
    employee_id: 'emp-omar-ghamdi',
    certificate_type_id: 'ct-sec-hv',
    license_number: 'SEC-HV-AEP-9912',
    issue_date: '2024-01-15',
    expiry_date: '2026-01-15',
    status: 'valid',
    verified_by: 'usr-tariq-otaibi',
    verified_at: '2024-01-16T11:00:00Z',
    attachment_path: 'certificates/sec-aep-9912.pdf',
    attachment_filename: 'SEC_Authorized_Person_OmarGhamdi.pdf',
    notes: 'Fully certified for 132kV and 380kV substation access.',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'cert-5',
    company_id: 'cmp-alfanar-01',
    employee_id: 'emp-zayd-harbi',
    certificate_type_id: 'ct-nebosh-igc',
    license_number: 'NEB-IGC-2023-9901',
    issue_date: '2023-11-20',
    expiry_date: undefined, // Lifetime
    status: 'no_expiry',
    verified_by: 'usr-tariq-otaibi',
    verified_at: '2023-11-21T10:00:00Z',
    attachment_path: 'certificates/nebosh-igc-9901.pdf',
    attachment_filename: 'NEBOSH_IGC_Certificate_ZaydHarbi.pdf',
    notes: 'Lifetime certification credential verified with UK board.',
    created_at: '2023-11-21T10:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  }
];

export const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'ins-01',
    company_id: 'cmp-alfanar-01',
    site_id: 'site-neom-4',
    title: 'CAT 320D Hydraulic Excavator Pre-Operation Audit',
    title_ar: 'فحص ما قبل التشغيل لحفارة هيدروليكية CAT 320D',
    inspection_type: 'Heavy Machinery Pre-Op',
    inspector_id: 'usr-zayd-harbi',
    scheduled_date: '2024-10-22',
    completed_at: '2024-10-22T07:15:00Z',
    status: 'completed_pass',
    summary_notes: 'All high-pressure hydraulic hoses, roll-over cage, reversing alarms passed 100%. Site gate clearance granted.',
    created_at: '2024-10-21T14:00:00Z',
    updated_at: '2024-10-22T07:15:00Z',
    items: [
      { id: 'item-1', inspection_id: 'ins-01', category: 'Hydraulics', item_text: 'Hydraulic hose integrity & high-pressure seal inspection', item_text_ar: 'سلامة الخراطيم الهيدروليكية وموانع التسرب عالية الضغط', result: 'pass', sort_order: 1 },
      { id: 'item-2', inspection_id: 'ins-01', category: 'Cabin Safety', item_text: 'Operator ROPS/FOPS certified roll-over cage & seatbelt', item_text_ar: 'هيكل حماية المشغل المعتمد وحزام الأمان ثلاثي النقاط', result: 'pass', sort_order: 2 },
      { id: 'item-3', inspection_id: 'ins-01', category: 'Electrical & Alarm', item_text: 'Audible reversing alarm & 360-degree strobe beacon', item_text_ar: 'جهاز إنذار الرجوع للخلف الصوتي والفلاشر التحذيري', result: 'pass', sort_order: 3 }
    ]
  },
  {
    id: 'ins-02',
    company_id: 'cmp-alfanar-01',
    site_id: 'site-neom-4',
    title: 'Deep Excavation Shoring & Dewatering Trench Safety',
    title_ar: 'سلامة تدعيم الحفريات العميقة ونزح المياه الجوفية',
    inspection_type: 'Trench & Excavation Safety',
    inspector_id: 'usr-tariq-otaibi',
    scheduled_date: '2024-10-21', // Yesterday (Overdue)
    completed_at: undefined,
    status: 'in_progress',
    summary_notes: 'Monitoring prisms show 3mm lateral soil displacement. Immediate sheet pile bracing reinforcement required.',
    created_at: '2024-10-20T10:00:00Z',
    updated_at: '2024-10-22T08:00:00Z',
    items: [
      { id: 'item-4', inspection_id: 'ins-02', category: 'Shoring Structure', item_text: 'Sheet pile displacement monitoring prisms read via total station', item_text_ar: 'قراءة مناشير مراقبة إزاحة الستائر اللوحية بالمحطة المتكاملة', result: 'fail', notes: '3mm displacement flagged at Pier 4', sort_order: 1 },
      { id: 'item-5', inspection_id: 'ins-02', category: 'Dewatering Pumps', item_text: 'Submersible dewatering pumps earth leakage breaker test', item_text_ar: 'اختبار قواطع التسريب الأرضي لمضخات نزح المياه الغاطسة', result: 'fail', notes: 'Pump 02 tripping breaker', sort_order: 2 }
    ]
  }
];

export const INITIAL_ACTIONS: CorrectiveAction[] = [
  {
    id: 'act-01',
    company_id: 'cmp-alfanar-01',
    inspection_id: 'ins-02',
    inspection_item_id: 'item-4',
    title: 'Install secondary horizontal waler beam at Deep Excavation Trench 04',
    title_ar: 'تركيب كمرة تدعيم أفقية ثانوية في حفرية الأساسات العميقة',
    description: 'Stabilize sheet pile displacement at NEOM Spine Sector 4 foundation box before resuming earthworks.',
    priority: 'critical',
    status: 'in_progress',
    assigned_to: 'usr-tariq-otaibi',
    due_date: '2024-10-24',
    created_at: '2024-10-21T10:00:00Z',
    updated_at: '2024-10-22T08:00:00Z'
  },
  {
    id: 'act-02',
    company_id: 'cmp-alfanar-01',
    title: 'Renew expired Saudi Aramco Rigger Level 2 card for Rahul Sharma',
    title_ar: 'تجديد اعتماد أرامكو للرافعات المستوى 2 لراهول شارما',
    description: 'Book immediate assessment slot at Saudi Aramco Inspection Center Ras Tanura.',
    priority: 'high',
    status: 'open',
    assigned_to: 'usr-zayd-harbi',
    due_date: '2024-10-28',
    created_at: '2024-10-22T06:00:00Z',
    updated_at: '2024-10-22T06:00:00Z'
  }
];

export const INITIAL_SUBSCRIPTION: Subscription = {
  id: 'sub-01',
  company_id: 'cmp-alfanar-01',
  tier: 'enterprise',
  status: 'trial',
  max_workers: 200,
  max_sites: 10,
  trial_ends_at: '2024-11-15T00:00:00Z',
  current_period_end: '2024-11-15T00:00:00Z',
  created_at: '2024-01-10T08:00:00Z',
  updated_at: '2024-10-22T08:00:00Z'
};
