import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Company,
  Site,
  Employee,
  CertificateType,
  EmployeeCertificate,
  CertificateRenewalRecord,
  Inspection,
  InspectionItem,
  CorrectiveAction,
  Subscription,
  Profile,
  CompanyMember,
  DashboardMetrics,
  AuditEvent,
  UserRole
} from '../types';
import {
  INITIAL_COMPANY,
  INITIAL_USER,
  INITIAL_MEMBERS,
  INITIAL_SITES,
  INITIAL_CERT_TYPES,
  INITIAL_EMPLOYEES,
  INITIAL_CERTIFICATES,
  INITIAL_INSPECTIONS,
  INITIAL_ACTIONS,
  INITIAL_SUBSCRIPTION
} from './demoData';
import { calculateCertificateStatus } from './certificateUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isRealSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('your-project.supabase.co') &&
  supabaseUrl.startsWith('http');

export const supabase: SupabaseClient | null = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export const isLiveMode = isRealSupabaseConfigured;

// Local persistent mock store keys
const STORAGE_PREFIX = 'siteready_v1_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

class DataStore {
  private company: Company;
  private sites: Site[];
  private certificateTypes: CertificateType[];
  private employees: Employee[];
  private certificates: EmployeeCertificate[];
  private inspections: Inspection[];
  private actions: CorrectiveAction[];
  private members: CompanyMember[];
  private subscription: Subscription;
  private auditEvents: AuditEvent[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.company = loadFromStorage('company', INITIAL_COMPANY);
    this.sites = loadFromStorage('sites', INITIAL_SITES);
    this.certificateTypes = loadFromStorage('cert_types', INITIAL_CERT_TYPES);
    this.employees = loadFromStorage('employees', INITIAL_EMPLOYEES);
    this.certificates = loadFromStorage('certificates', INITIAL_CERTIFICATES);
    this.inspections = loadFromStorage('inspections', INITIAL_INSPECTIONS);
    this.actions = loadFromStorage('actions', INITIAL_ACTIONS);
    this.members = loadFromStorage('members', INITIAL_MEMBERS);
    this.subscription = loadFromStorage('subscription', INITIAL_SUBSCRIPTION);
    this.auditEvents = loadFromStorage('audit_events', [
      {
        id: 'aud-01',
        company_id: INITIAL_COMPANY.id,
        user_id: INITIAL_USER.id,
        action: 'INSPECTION_COMPLETED',
        entity_type: 'inspections',
        entity_id: 'ins-01',
        created_at: '2024-10-22T08:30:00Z',
        user: INITIAL_USER
      },
      {
        id: 'aud-02',
        company_id: INITIAL_COMPANY.id,
        user_id: INITIAL_USER.id,
        action: 'CERTIFICATE_RENEWAL_ALERT',
        entity_type: 'employee_certificates',
        entity_id: 'cert-02',
        created_at: '2024-10-22T06:15:00Z',
        user: INITIAL_USER
      }
    ]);

    this.syncCertificateStatuses();
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public resetToSeedData() {
    this.company = INITIAL_COMPANY;
    this.sites = INITIAL_SITES;
    this.certificateTypes = INITIAL_CERT_TYPES;
    this.employees = INITIAL_EMPLOYEES;
    this.certificates = INITIAL_CERTIFICATES;
    this.inspections = INITIAL_INSPECTIONS;
    this.actions = INITIAL_ACTIONS;
    this.members = INITIAL_MEMBERS;
    this.subscription = INITIAL_SUBSCRIPTION;
    this.saveAll();
    this.notify();
  }

  private saveAll() {
    saveToStorage('company', this.company);
    saveToStorage('sites', this.sites);
    saveToStorage('cert_types', this.certificateTypes);
    saveToStorage('employees', this.employees);
    saveToStorage('certificates', this.certificates);
    saveToStorage('inspections', this.inspections);
    saveToStorage('actions', this.actions);
    saveToStorage('members', this.members);
    saveToStorage('subscription', this.subscription);
    saveToStorage('audit_events', this.auditEvents);
  }

  private syncCertificateStatuses() {
    this.certificates = this.certificates.map((cert) => {
      const type = this.certificateTypes.find((t) => t.id === cert.certificate_type_id);
      const computedStatus = calculateCertificateStatus(cert.expiry_date, type?.requires_expiry ?? true);
      return {
        ...cert,
        status: computedStatus
      };
    });
  }

  // Company Methods
  public async getCompany(): Promise<Company> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase.from('companies').select('*').limit(1).single();
        if (!error && data) return data as Company;
      } catch (err) {
        console.warn('Live Supabase getCompany failed, falling back to local store:', err);
      }
    }
    return { ...this.company };
  }

  public async updateCompany(updates: Partial<Company>): Promise<Company> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('companies')
          .update(updates)
          .eq('id', this.company.id)
          .select()
          .single();
        if (!error && data) {
          this.company = data as Company;
          this.notify();
          return this.company;
        }
      } catch (err) {
        console.warn('Live Supabase updateCompany failed:', err);
      }
    }
    this.company = { ...this.company, ...updates, updated_at: new Date().toISOString() };
    saveToStorage('company', this.company);
    this.notify();
    return { ...this.company };
  }

  // Sites Methods
  public async getSites(activeOnly = true): Promise<Site[]> {
    if (isLiveMode && supabase) {
      try {
        let query = supabase.from('sites').select('*').order('name');
        if (activeOnly) {
          query = query.eq('is_active', true);
        }
        const { data, error } = await query;
        if (!error && data) return data as Site[];
      } catch (err) {
        console.warn('Live Supabase getSites fallback:', err);
      }
    }
    if (activeOnly) {
      return this.sites.filter((s) => s.is_active);
    }
    return [...this.sites];
  }

  public async createSite(siteData: Omit<Site, 'id' | 'created_at' | 'updated_at'>): Promise<Site> {
    if (this.subscription && this.sites.length >= this.subscription.max_sites) {
      throw new Error(
        `Subscription tier limit reached: Maximum ${this.subscription.max_sites} project sites allowed. Please upgrade your subscription.`
      );
    }

    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase.from('sites').insert(siteData).select().single();
        if (!error && data) {
          this.notify();
          return data as Site;
        }
      } catch (err) {
        console.warn('Live Supabase createSite fallback:', err);
      }
    }
    const newSite: Site = {
      ...siteData,
      id: 'site-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.sites.push(newSite);
    saveToStorage('sites', this.sites);
    this.notify();
    return newSite;
  }

  public async updateSite(id: string, updates: Partial<Site>): Promise<Site> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase.from('sites').update(updates).eq('id', id).select().single();
        if (!error && data) {
          this.notify();
          return data as Site;
        }
      } catch (err) {
        console.warn('Live Supabase updateSite fallback:', err);
      }
    }
    const idx = this.sites.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Site not found');
    this.sites[idx] = { ...this.sites[idx], ...updates, updated_at: new Date().toISOString() };
    saveToStorage('sites', this.sites);
    this.notify();
    return { ...this.sites[idx] };
  }

  // Certificate Types
  public async getCertificateTypes(): Promise<CertificateType[]> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase.from('certificate_types').select('*').order('name');
        if (!error && data) return data as CertificateType[];
      } catch (err) {
        console.warn('Live Supabase getCertificateTypes fallback:', err);
      }
    }
    return [...this.certificateTypes];
  }

  public async createCertificateType(
    data: Omit<CertificateType, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CertificateType> {
    if (isLiveMode && supabase) {
      try {
        const { data: inserted, error } = await supabase.from('certificate_types').insert(data).select().single();
        if (!error && inserted) {
          this.notify();
          return inserted as CertificateType;
        }
      } catch (err) {
        console.warn('Live Supabase createCertificateType fallback:', err);
      }
    }
    const newType: CertificateType = {
      ...data,
      id: 'cert-type-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.certificateTypes.push(newType);
    saveToStorage('cert_types', this.certificateTypes);
    this.notify();
    return newType;
  }

  // Employees
  public async getEmployees(siteId?: string): Promise<Employee[]> {
    if (isLiveMode && supabase) {
      try {
        let query = supabase
          .from('employees')
          .select('*, site:sites(*), certificates:employee_certificates(*, certificate_type:certificate_types(*))')
          .order('full_name');
        if (siteId && siteId !== 'all') {
          query = query.eq('site_id', siteId);
        }
        const { data, error } = await query;
        if (!error && data) return data as Employee[];
      } catch (err) {
        console.warn('Live Supabase getEmployees fallback:', err);
      }
    }

    let list = this.employees;
    if (siteId && siteId !== 'all') {
      list = list.filter((e) => e.site_id === siteId);
    }

    return list.map((emp) => {
      const site = this.sites.find((s) => s.id === emp.site_id);
      const certs = this.certificates
        .filter((c) => c.employee_id === emp.id)
        .map((c) => ({
          ...c,
          certificate_type: this.certificateTypes.find((t) => t.id === c.certificate_type_id)
        }));

      return {
        ...emp,
        site,
        certificates: certs
      };
    });
  }

  public async getEmployeeById(id: string): Promise<Employee | null> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*, site:sites(*), certificates:employee_certificates(*, certificate_type:certificate_types(*))')
          .eq('id', id)
          .single();
        if (!error && data) return data as Employee;
      } catch (err) {
        console.warn('Live Supabase getEmployeeById fallback:', err);
      }
    }

    const emp = this.employees.find((e) => e.id === id);
    if (!emp) return null;
    const site = this.sites.find((s) => s.id === emp.site_id);
    const certs = this.certificates
      .filter((c) => c.employee_id === emp.id)
      .map((c) => ({
        ...c,
        certificate_type: this.certificateTypes.find((t) => t.id === c.certificate_type_id)
      }));

    return {
      ...emp,
      site,
      certificates: certs
    };
  }

  public async createEmployee(
    data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Employee> {
    if (this.subscription && this.employees.length >= this.subscription.max_workers) {
      throw new Error(
        `Subscription tier limit reached: Maximum ${this.subscription.max_workers} active workers allowed. Please upgrade your subscription.`
      );
    }

    const exists = this.employees.some((e) => e.iqama_national_id === data.iqama_national_id);
    if (exists) {
      throw new Error('An employee with this Iqama / National ID already exists.');
    }

    if (isLiveMode && supabase) {
      try {
        const { data: inserted, error } = await supabase.from('employees').insert(data).select().single();
        if (!error && inserted) {
          this.notify();
          return inserted as Employee;
        } else if (error) {
          throw new Error(error.message);
        }
      } catch (err: unknown) {
        if (err instanceof Error) throw err;
      }
    }

    const newEmp: Employee = {
      ...data,
      id: 'emp-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.employees.unshift(newEmp);
    saveToStorage('employees', this.employees);

    this.logAudit({
      action: 'EMPLOYEE_CREATED',
      entity_type: 'employees',
      entity_id: newEmp.id,
      new_values: { name: newEmp.full_name, employee_no: newEmp.employee_no }
    });

    this.notify();
    return newEmp;
  }

  public async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select().single();
        if (!error && data) {
          this.notify();
          return data as Employee;
        }
      } catch (err) {
        console.warn('Live Supabase updateEmployee fallback:', err);
      }
    }

    const idx = this.employees.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Employee not found');

    if (updates.iqama_national_id && updates.iqama_national_id !== this.employees[idx].iqama_national_id) {
      const exists = this.employees.some(
        (e) => e.iqama_national_id === updates.iqama_national_id && e.id !== id
      );
      if (exists) {
        throw new Error('An employee with this Iqama / National ID already exists.');
      }
    }

    const updated = {
      ...this.employees[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.employees[idx] = updated;
    saveToStorage('employees', this.employees);

    this.logAudit({
      action: 'EMPLOYEE_UPDATED',
      entity_type: 'employees',
      entity_id: id,
      new_values: updates as Record<string, unknown>
    });

    this.notify();
    return updated;
  }

  public async deleteEmployee(id: string): Promise<void> {
    if (isLiveMode && supabase) {
      try {
        await supabase.from('employees').delete().eq('id', id);
        this.notify();
        return;
      } catch (err) {
        console.warn('Live Supabase deleteEmployee fallback:', err);
      }
    }

    this.employees = this.employees.filter((e) => e.id !== id);
    this.certificates = this.certificates.filter((c) => c.employee_id !== id);
    saveToStorage('employees', this.employees);
    saveToStorage('certificates', this.certificates);

    this.logAudit({
      action: 'EMPLOYEE_DELETED',
      entity_type: 'employees',
      entity_id: id
    });

    this.notify();
  }

  // Certificates
  public async getCertificates(siteId?: string): Promise<EmployeeCertificate[]> {
    if (isLiveMode && supabase) {
      try {
        let query = supabase
          .from('employee_certificates')
          .select('*, employee:employees(*), certificate_type:certificate_types(*)')
          .order('expiry_date', { ascending: true, nullsFirst: false });
        if (siteId && siteId !== 'all') {
          query = query.eq('employee.site_id', siteId);
        }
        const { data, error } = await query;
        if (!error && data) return data as EmployeeCertificate[];
      } catch (err) {
        console.warn('Live Supabase getCertificates fallback:', err);
      }
    }

    let emps = this.employees;
    if (siteId && siteId !== 'all') {
      emps = emps.filter((e) => e.site_id === siteId);
    }
    const empIds = new Set(emps.map((e) => e.id));

    return this.certificates
      .filter((c) => empIds.has(c.employee_id))
      .map((cert) => {
        const emp = this.employees.find((e) => e.id === cert.employee_id);
        const certType = this.certificateTypes.find((t) => t.id === cert.certificate_type_id);
        return {
          ...cert,
          employee: emp,
          certificate_type: certType
        };
      });
  }

  public async createCertificate(
    data: Omit<EmployeeCertificate, 'id' | 'status' | 'created_at' | 'updated_at'>
  ): Promise<EmployeeCertificate> {
    const certType = this.certificateTypes.find((t) => t.id === data.certificate_type_id);
    const computedStatus = calculateCertificateStatus(
      data.expiry_date,
      certType?.requires_expiry ?? true
    );

    if (isLiveMode && supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('employee_certificates')
          .insert({
            ...data,
            status: computedStatus
          })
          .select('*, employee:employees(*), certificate_type:certificate_types(*)')
          .single();
        if (!error && inserted) {
          this.notify();
          return inserted as EmployeeCertificate;
        } else if (error) {
          throw new Error(error.message);
        }
      } catch (err: unknown) {
        if (err instanceof Error) throw err;
      }
    }

    const newCert: EmployeeCertificate = {
      ...data,
      id: 'cert-' + Date.now().toString(36),
      status: computedStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.certificates.unshift(newCert);
    saveToStorage('certificates', this.certificates);

    this.logAudit({
      action: 'CERTIFICATE_ADDED',
      entity_type: 'employee_certificates',
      entity_id: newCert.id,
      new_values: {
        license_number: newCert.license_number,
        expiry: newCert.expiry_date,
        status: newCert.status
      }
    });

    this.notify();
    return newCert;
  }

  public async updateCertificate(
    id: string,
    updates: Partial<EmployeeCertificate>
  ): Promise<EmployeeCertificate> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('employee_certificates')
          .update(updates)
          .eq('id', id)
          .select('*, employee:employees(*), certificate_type:certificate_types(*)')
          .single();
        if (!error && data) {
          this.notify();
          return data as EmployeeCertificate;
        }
      } catch (err) {
        console.warn('Live Supabase updateCertificate fallback:', err);
      }
    }

    const idx = this.certificates.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Certificate not found');

    const current = this.certificates[idx];
    const certTypeId = updates.certificate_type_id || current.certificate_type_id;
    const certType = this.certificateTypes.find((t) => t.id === certTypeId);
    const expiryDate = updates.expiry_date !== undefined ? updates.expiry_date : current.expiry_date;

    const computedStatus = calculateCertificateStatus(
      expiryDate,
      certType?.requires_expiry ?? true
    );

    const updated: EmployeeCertificate = {
      ...current,
      ...updates,
      status: computedStatus,
      updated_at: new Date().toISOString()
    };

    this.certificates[idx] = updated;
    saveToStorage('certificates', this.certificates);

    this.logAudit({
      action: 'CERTIFICATE_UPDATED',
      entity_type: 'employee_certificates',
      entity_id: id,
      new_values: updates as Record<string, unknown>
    });

    this.notify();
    return updated;
  }

  public async deleteCertificate(id: string): Promise<void> {
    if (isLiveMode && supabase) {
      try {
        await supabase.from('employee_certificates').delete().eq('id', id);
        this.notify();
        return;
      } catch (err) {
        console.warn('Live Supabase deleteCertificate fallback:', err);
      }
    }

    this.certificates = this.certificates.filter((c) => c.id !== id);
    saveToStorage('certificates', this.certificates);

    this.logAudit({
      action: 'CERTIFICATE_DELETED',
      entity_type: 'employee_certificates',
      entity_id: id
    });

    this.notify();
  }

  public async getCertificateById(id: string): Promise<EmployeeCertificate | null> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('employee_certificates')
          .select('*, employee:employees(*), certificate_type:certificate_types(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data as EmployeeCertificate;
      } catch (err) {
        console.warn('Live Supabase getCertificateById fallback:', err);
      }
    }

    const cert = this.certificates.find((c) => c.id === id);
    if (!cert) return null;
    return {
      ...cert,
      employee: this.employees.find((e) => e.id === cert.employee_id),
      certificate_type: this.certificateTypes.find((t) => t.id === cert.certificate_type_id)
    };
  }

  public async renewCertificate(
    id: string,
    newExpiryDate: string,
    notes?: string,
    renewedByName?: string
  ): Promise<EmployeeCertificate> {
    const idx = this.certificates.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Certificate not found');

    const current = this.certificates[idx];
    const previousExpiry = current.expiry_date;
    const certType = this.certificateTypes.find((t) => t.id === current.certificate_type_id);
    const newStatus = calculateCertificateStatus(newExpiryDate, certType?.requires_expiry ?? true);

    const renewalEntry: CertificateRenewalRecord = {
      id: 'ren-' + Date.now().toString(36),
      certificate_id: id,
      previous_expiry_date: previousExpiry,
      new_expiry_date: newExpiryDate,
      renewed_at: new Date().toISOString(),
      renewed_by_name: renewedByName || INITIAL_USER.full_name,
      notes
    };

    const history = current.renewal_history ? [...current.renewal_history, renewalEntry] : [renewalEntry];

    if (isLiveMode && supabase) {
      try {
        await supabase
          .from('employee_certificates')
          .update({
            expiry_date: newExpiryDate,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Live Supabase renewCertificate fallback:', err);
      }
    }

    const updated: EmployeeCertificate = {
      ...current,
      expiry_date: newExpiryDate,
      status: newStatus,
      updated_at: new Date().toISOString(),
      renewal_history: history
    };

    this.certificates[idx] = updated;
    saveToStorage('certificates', this.certificates);

    this.logAudit({
      action: 'CERTIFICATE_RENEWED',
      entity_type: 'employee_certificates',
      entity_id: id,
      new_values: { previous_expiry: previousExpiry, new_expiry: newExpiryDate, status: newStatus }
    });

    this.notify();
    return updated;
  }

  public async attachCertificateDocument(
    certificateId: string,
    file: File
  ): Promise<{ path: string; url: string }> {
    const uploadRes = await this.uploadDocument(file, 'certificates');

    if (isLiveMode && supabase) {
      try {
        await supabase
          .from('employee_certificates')
          .update({
            attachment_path: uploadRes.path,
            attachment_filename: file.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', certificateId);
      } catch (err) {
        console.warn('Live Supabase attachCertificateDocument fallback:', err);
      }
    }

    const idx = this.certificates.findIndex((c) => c.id === certificateId);
    if (idx !== -1) {
      this.certificates[idx] = {
        ...this.certificates[idx],
        attachment_path: uploadRes.path,
        attachment_filename: file.name,
        updated_at: new Date().toISOString()
      };
      saveToStorage('certificates', this.certificates);
      this.notify();
    }

    return uploadRes;
  }

  // Inspections
  public async getInspections(siteId?: string): Promise<Inspection[]> {
    if (isLiveMode && supabase) {
      try {
        let query = supabase
          .from('inspections')
          .select('*, site:sites(*), items:inspection_items(*), corrective_actions:corrective_actions(*)')
          .order('scheduled_date', { ascending: false });
        if (siteId && siteId !== 'all') {
          query = query.eq('site_id', siteId);
        }
        const { data, error } = await query;
        if (!error && data) return data as Inspection[];
      } catch (err) {
        console.warn('Live Supabase getInspections fallback:', err);
      }
    }

    let list = this.inspections;
    if (siteId && siteId !== 'all') {
      list = list.filter((i) => i.site_id === siteId);
    }

    return list.map((ins) => ({
      ...ins,
      site: this.sites.find((s) => s.id === ins.site_id),
      inspector: INITIAL_USER,
      corrective_actions: this.actions.filter((a) => a.inspection_id === ins.id)
    }));
  }

  public async createInspection(
    data: Omit<Inspection, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Inspection> {
    if (isLiveMode && supabase) {
      try {
        const { items, ...insData } = data;
        const { data: inserted, error } = await supabase.from('inspections').insert(insData).select().single();
        if (!error && inserted) {
          if (items && items.length > 0) {
            const formattedItems = items.map((item) => ({
              ...item,
              inspection_id: inserted.id
            }));
            await supabase.from('inspection_items').insert(formattedItems);
          }
          this.notify();
          return inserted as Inspection;
        }
      } catch (err) {
        console.warn('Live Supabase createInspection fallback:', err);
      }
    }

    const newIns: Inspection = {
      ...data,
      id: 'ins-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.inspections.unshift(newIns);
    saveToStorage('inspections', this.inspections);

    this.logAudit({
      action: 'INSPECTION_CREATED',
      entity_type: 'inspections',
      entity_id: newIns.id,
      new_values: { title: newIns.title, site_id: newIns.site_id }
    });

    this.notify();
    return newIns;
  }

  public async updateInspection(id: string, updates: Partial<Inspection>): Promise<Inspection> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase.from('inspections').update(updates).eq('id', id).select().single();
        if (!error && data) {
          this.notify();
          return data as Inspection;
        }
      } catch (err) {
        console.warn('Live Supabase updateInspection fallback:', err);
      }
    }

    const idx = this.inspections.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Inspection not found');

    const updated = {
      ...this.inspections[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.inspections[idx] = updated;
    saveToStorage('inspections', this.inspections);

    this.logAudit({
      action: 'INSPECTION_UPDATED',
      entity_type: 'inspections',
      entity_id: id,
      new_values: updates as Record<string, unknown>
    });

    this.notify();
    return updated;
  }

  public async completeInspection(
    id: string,
    items: InspectionItem[],
    summaryNotes?: string
  ): Promise<Inspection> {
    const hasFails = items.some((item) => item.result === 'fail');
    const finalStatus = hasFails ? 'completed_fail' : 'completed_pass';

    if (isLiveMode && supabase) {
      try {
        await supabase
          .from('inspections')
          .update({
            status: finalStatus,
            summary_notes: summaryNotes,
            completed_at: new Date().toISOString()
          })
          .eq('id', id);

        for (const item of items) {
          if (item.id.startsWith('item-')) {
            await supabase.from('inspection_items').insert({
              inspection_id: id,
              category: item.category,
              item_text: item.item_text,
              item_text_ar: item.item_text_ar,
              result: item.result,
              notes: item.notes,
              sort_order: item.sort_order
            });
          } else {
            await supabase.from('inspection_items').update(item).eq('id', item.id);
          }
        }
      } catch (err) {
        console.warn('Live Supabase completeInspection fallback:', err);
      }
    }

    const idx = this.inspections.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Inspection not found');

    const updated: Inspection = {
      ...this.inspections[idx],
      items,
      summary_notes: summaryNotes || this.inspections[idx].summary_notes,
      status: finalStatus,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.inspections[idx] = updated;

    items.forEach((item) => {
      if (item.result === 'fail') {
        const existingAction = this.actions.find((a) => a.inspection_item_id === item.id);
        if (!existingAction) {
          const actionTitle = `Remediate: ${item.item_text}`;
          const newAction: CorrectiveAction = {
            id: 'act-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000),
            company_id: updated.company_id,
            inspection_id: updated.id,
            inspection_item_id: item.id,
            title: actionTitle,
            title_ar: item.item_text_ar ? `إجراء تصحيحي: ${item.item_text_ar}` : undefined,
            description: item.notes || 'Corrective action generated from safety audit non-compliance.',
            priority: 'high',
            status: 'open',
            assigned_to: INITIAL_USER.id,
            due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          this.actions.unshift(newAction);
        }
      }
    });

    saveToStorage('inspections', this.inspections);
    saveToStorage('actions', this.actions);

    this.logAudit({
      action: 'INSPECTION_COMPLETED',
      entity_type: 'inspections',
      entity_id: id,
      new_values: { status: finalStatus, failCount: items.filter((i) => i.result === 'fail').length }
    });

    this.notify();
    return updated;
  }

  public async saveDraftInspection(
    id: string,
    items: InspectionItem[],
    summaryNotes?: string
  ): Promise<Inspection> {
    if (isLiveMode && supabase) {
      try {
        await supabase
          .from('inspections')
          .update({
            status: 'in_progress',
            summary_notes: summaryNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        for (const item of items) {
          if (item.id.startsWith('item-')) {
            await supabase.from('inspection_items').insert({
              inspection_id: id,
              category: item.category,
              item_text: item.item_text,
              item_text_ar: item.item_text_ar,
              result: item.result,
              notes: item.notes,
              sort_order: item.sort_order
            });
          } else {
            await supabase.from('inspection_items').update(item).eq('id', item.id);
          }
        }
      } catch (err) {
        console.warn('Live Supabase saveDraftInspection fallback:', err);
      }
    }

    const idx = this.inspections.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Inspection not found');

    const updated: Inspection = {
      ...this.inspections[idx],
      items,
      summary_notes: summaryNotes || this.inspections[idx].summary_notes,
      status: 'in_progress',
      updated_at: new Date().toISOString()
    };

    this.inspections[idx] = updated;
    saveToStorage('inspections', this.inspections);

    this.logAudit({
      action: 'INSPECTION_DRAFT_SAVED',
      entity_type: 'inspections',
      entity_id: id,
      new_values: { status: 'in_progress' }
    });

    this.notify();
    return updated;
  }

  public async deleteInspection(id: string): Promise<void> {
    if (isLiveMode && supabase) {
      try {
        await supabase.from('inspections').delete().eq('id', id);
        this.notify();
        return;
      } catch (err) {
        console.warn('Live Supabase deleteInspection fallback:', err);
      }
    }

    this.inspections = this.inspections.filter((i) => i.id !== id);
    this.actions = this.actions.filter((a) => a.inspection_id !== id);
    saveToStorage('inspections', this.inspections);
    saveToStorage('actions', this.actions);

    this.logAudit({
      action: 'INSPECTION_DELETED',
      entity_type: 'inspections',
      entity_id: id
    });

    this.notify();
  }

  // Corrective Actions
  public async getCorrectiveActions(siteId?: string): Promise<CorrectiveAction[]> {
    if (isLiveMode && supabase) {
      try {
        let query = supabase.from('corrective_actions').select('*').order('due_date', { ascending: true });
        const { data, error } = await query;
        if (!error && data) return data as CorrectiveAction[];
      } catch (err) {
        console.warn('Live Supabase getCorrectiveActions fallback:', err);
      }
    }

    let actions = this.actions;
    if (siteId && siteId !== 'all') {
      const siteInspections = new Set(this.inspections.filter((i) => i.site_id === siteId).map((i) => i.id));
      actions = actions.filter((a) => a.inspection_id && siteInspections.has(a.inspection_id));
    }

    return actions.map((act) => ({
      ...act,
      assignee: INITIAL_USER
    }));
  }

  public async createCorrectiveAction(
    data: Omit<CorrectiveAction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CorrectiveAction> {
    if (isLiveMode && supabase) {
      try {
        const { data: inserted, error } = await supabase.from('corrective_actions').insert(data).select().single();
        if (!error && inserted) {
          this.notify();
          return inserted as CorrectiveAction;
        }
      } catch (err) {
        console.warn('Live Supabase createCorrectiveAction fallback:', err);
      }
    }

    const newAct: CorrectiveAction = {
      ...data,
      id: 'act-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.actions.unshift(newAct);
    saveToStorage('actions', this.actions);

    this.logAudit({
      action: 'ACTION_CREATED',
      entity_type: 'corrective_actions',
      entity_id: newAct.id,
      new_values: { title: newAct.title, priority: newAct.priority }
    });

    this.notify();
    return newAct;
  }

  public async updateCorrectiveAction(
    id: string,
    updates: Partial<CorrectiveAction>
  ): Promise<CorrectiveAction> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('corrective_actions')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          this.notify();
          return data as CorrectiveAction;
        }
      } catch (err) {
        console.warn('Live Supabase updateCorrectiveAction fallback:', err);
      }
    }

    const idx = this.actions.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Action not found');

    const updated = {
      ...this.actions[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.status === 'resolved' || updates.status === 'verified_closed') {
      updated.resolved_at = new Date().toISOString();
    }

    this.actions[idx] = updated;
    saveToStorage('actions', this.actions);

    this.logAudit({
      action: 'ACTION_UPDATED',
      entity_type: 'corrective_actions',
      entity_id: id,
      new_values: updates as Record<string, unknown>
    });

    this.notify();
    return updated;
  }

  public async resolveCorrectiveAction(
    id: string,
    resolutionNotes: string,
    resolvedByName?: string
  ): Promise<CorrectiveAction> {
    const idx = this.actions.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Corrective action not found');

    const now = new Date().toISOString();
    const current = this.actions[idx];

    if (isLiveMode && supabase) {
      try {
        await supabase
          .from('corrective_actions')
          .update({
            status: 'resolved',
            resolved_at: now,
            resolution_notes: resolutionNotes,
            updated_at: now
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Live Supabase resolveCorrectiveAction fallback:', err);
      }
    }

    const updated: CorrectiveAction = {
      ...current,
      status: 'resolved',
      resolved_at: now,
      resolution_notes: resolutionNotes,
      updated_at: now
    };

    this.actions[idx] = updated;
    saveToStorage('actions', this.actions);

    this.logAudit({
      action: 'ACTION_RESOLVED',
      entity_type: 'corrective_actions',
      entity_id: id,
      new_values: {
        status: 'resolved',
        resolved_by: resolvedByName || INITIAL_USER.full_name,
        resolution_notes: resolutionNotes
      }
    });

    this.notify();
    return updated;
  }

  public async deleteCorrectiveAction(id: string): Promise<void> {
    if (isLiveMode && supabase) {
      try {
        await supabase.from('corrective_actions').delete().eq('id', id);
        this.notify();
        return;
      } catch (err) {
        console.warn('Live Supabase deleteCorrectiveAction fallback:', err);
      }
    }

    this.actions = this.actions.filter((a) => a.id !== id);
    saveToStorage('actions', this.actions);

    this.logAudit({
      action: 'ACTION_DELETED',
      entity_type: 'corrective_actions',
      entity_id: id
    });

    this.notify();
  }

  // Team Members
  public async getTeamMembers(): Promise<CompanyMember[]> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('company_members')
          .select('*, user:profiles(*)')
          .order('created_at');
        if (!error && data) return data as CompanyMember[];
      } catch (err) {
        console.warn('Live Supabase getTeamMembers fallback:', err);
      }
    }
    return [...this.members];
  }

  public async inviteTeamMember(email: string, role: UserRole): Promise<CompanyMember> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('company_members')
          .insert({
            company_id: this.company.id,
            invited_email: email,
            role,
            is_active: true
          })
          .select('*, user:profiles(*)')
          .single();
        if (!error && data) {
          this.notify();
          return data as CompanyMember;
        }
      } catch (err) {
        console.warn('Live Supabase inviteTeamMember fallback:', err);
      }
    }

    const newMember: CompanyMember = {
      id: 'mem-' + Date.now().toString(36),
      company_id: this.company.id,
      invited_email: email,
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      user: {
        id: 'usr-' + Date.now().toString(36),
        email,
        full_name: email.split('@')[0],
        preferred_language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    this.members.push(newMember);
    saveToStorage('members', this.members);

    this.logAudit({
      action: 'TEAM_MEMBER_INVITED',
      entity_type: 'company_members',
      entity_id: newMember.id,
      new_values: { email, role }
    });

    this.notify();
    return newMember;
  }

  public async updateMemberRole(memberId: string, role: UserRole): Promise<CompanyMember> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('company_members')
          .update({ role })
          .eq('id', memberId)
          .select('*, user:profiles(*)')
          .single();
        if (!error && data) {
          this.notify();
          return data as CompanyMember;
        }
      } catch (err) {
        console.warn('Live Supabase updateMemberRole fallback:', err);
      }
    }

    const idx = this.members.findIndex((m) => m.id === memberId);
    if (idx === -1) throw new Error('Member not found');

    this.members[idx] = {
      ...this.members[idx],
      role
    };
    saveToStorage('members', this.members);

    this.logAudit({
      action: 'MEMBER_ROLE_CHANGED',
      entity_type: 'company_members',
      entity_id: memberId,
      new_values: { role }
    });

    this.notify();
    return { ...this.members[idx] };
  }

  public async toggleMemberStatus(memberId: string): Promise<CompanyMember> {
    if (isLiveMode && supabase) {
      try {
        const member = this.members.find((m) => m.id === memberId);
        const { data, error } = await supabase
          .from('company_members')
          .update({ is_active: member ? !member.is_active : false })
          .eq('id', memberId)
          .select('*, user:profiles(*)')
          .single();
        if (!error && data) {
          this.notify();
          return data as CompanyMember;
        }
      } catch (err) {
        console.warn('Live Supabase toggleMemberStatus fallback:', err);
      }
    }

    const idx = this.members.findIndex((m) => m.id === memberId);
    if (idx === -1) throw new Error('Member not found');

    this.members[idx] = {
      ...this.members[idx],
      is_active: !this.members[idx].is_active
    };
    saveToStorage('members', this.members);
    this.notify();
    return { ...this.members[idx] };
  }

  // Subscription
  public async getSubscription(): Promise<Subscription> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase.from('subscriptions').select('*').limit(1).single();
        if (!error && data) return data as Subscription;
      } catch (err) {
        console.warn('Live Supabase getSubscription fallback:', err);
      }
    }
    return { ...this.subscription };
  }

  // Dashboard Metrics
  public async getMetrics(siteId?: string): Promise<DashboardMetrics> {
    const emps = await this.getEmployees(siteId);
    const certs = await this.getCertificates(siteId);
    const inspections = await this.getInspections(siteId);
    const actions = await this.getCorrectiveActions(siteId);

    const totalEmployees = emps.length;
    const validCertificates = certs.filter((c) => c.status === 'valid' || c.status === 'no_expiry').length;
    const expiringCertificates = certs.filter((c) => c.status === 'expiring_soon').length;
    const expiredCertificates = certs.filter((c) => c.status === 'expired' || c.status === 'missing').length;

    const overdueInspections = inspections.filter((i) => {
      if (i.status === 'completed_pass' || i.status === 'completed_fail') return false;
      const scheduled = new Date(i.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return scheduled < today;
    }).length;

    const openCorrectiveActions = actions.filter((a) => a.status === 'open' || a.status === 'in_progress').length;

    const totalScoredCerts = validCertificates + expiringCertificates + expiredCertificates;
    const complianceRate = totalScoredCerts > 0 ? Math.round((validCertificates / totalScoredCerts) * 100) : 100;

    return {
      totalEmployees,
      validCertificates,
      expiringCertificates,
      expiredCertificates,
      overdueInspections,
      openCorrectiveActions,
      complianceRate
    };
  }

  // Audit
  public async getAuditEvents(): Promise<AuditEvent[]> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_events')
          .select('*, user:profiles(*)')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data) return data as AuditEvent[];
      } catch (err) {
        console.warn('Live Supabase getAuditEvents fallback:', err);
      }
    }
    return [...this.auditEvents];
  }

  private logAudit(event: Omit<AuditEvent, 'id' | 'company_id' | 'user_id' | 'created_at' | 'user'>) {
    const newEvent: AuditEvent = {
      ...event,
      id: 'aud-' + Date.now().toString(36),
      company_id: this.company.id,
      user_id: INITIAL_USER.id,
      created_at: new Date().toISOString(),
      user: INITIAL_USER
    };
    this.auditEvents.unshift(newEvent);
    if (this.auditEvents.length > 50) {
      this.auditEvents = this.auditEvents.slice(0, 50);
    }
    saveToStorage('audit_events', this.auditEvents);
  }

  // Document Storage (Private Supabase Storage with Signed URLs)
  public async uploadDocument(file: File, folder: string): Promise<{ path: string; url: string }> {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${this.company.id}/${folder}/${Date.now()}_${cleanFileName}`;

    if (isLiveMode && supabase) {
      try {
        // Upload to private bucket 'contractor-docs'
        const { error: uploadError } = await supabase.storage
          .from('contractor-docs')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Document upload failed: ${uploadError.message}`);
        }

        // Generate 15-minute restricted signed URL (never public URL)
        const { data: signedData, error: signError } = await supabase.storage
          .from('contractor-docs')
          .createSignedUrl(storagePath, 900); // 15 minutes = 900s

        if (signError || !signedData?.signedUrl) {
          throw new Error('Failed to generate secure signed URL');
        }

        return {
          path: storagePath,
          url: signedData.signedUrl
        };
      } catch (err) {
        console.warn('Supabase storage upload error, falling back to local object URL:', err);
      }
    }

    // Local / Offline fallback preview URL
    const url = URL.createObjectURL(file);
    return { path: storagePath, url };
  }

  public async getDocumentSignedUrl(path: string): Promise<string> {
    if (isLiveMode && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('contractor-docs')
          .createSignedUrl(path, 900);
        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err) {
        console.warn('Failed to retrieve signed URL:', err);
      }
    }
    return '#';
  }
}

export const db = new DataStore();
