import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, Profile, UserRole, Site } from '../types';
import { db, isLiveMode, supabase } from './supabase';
import { INITIAL_USER } from './demoData';

interface AuthContextType {
  user: Profile | null;
  company: Company | null;
  role: UserRole;
  selectedSiteId: string;
  sites: Site[];
  isAuthenticated: boolean;
  isLoading: boolean;
  setSelectedSiteId: (siteId: string) => void;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, fullName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  onboardCompany: (data: {
    name: string;
    name_ar?: string;
    cr_number?: string;
    default_language: 'en' | 'ar';
    initialSiteName: string;
  }) => Promise<void>;
  switchRole: (role: UserRole) => void;
  can: (action: 'manage_company' | 'manage_users' | 'manage_sites' | 'manage_employees' | 'manage_certificates' | 'manage_inspections') => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('siteready_auth_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('siteready_auth_role');
    return (saved as UserRole) || 'owner';
  });
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserData = async () => {
    try {
      const cmp = await db.getCompany();
      const siteList = await db.getSites();
      setCompany(cmp);
      setSites(siteList);
    } catch (err) {
      console.error('Failed to load company/sites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial live Supabase session check if live mode is enabled
    if (isLiveMode && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncSupabaseSessionUser(session.user);
        } else {
          refreshUserData();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          syncSupabaseSessionUser(session.user);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      refreshUserData();
    }

    const unsubscribe = db.subscribe(() => {
      refreshUserData();
    });
    return unsubscribe;
  }, []);

  const syncSupabaseSessionUser = async (sbUser: any) => {
    try {
      if (!supabase) return;
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single();

      if (profile) {
        setUser(profile as Profile);
        localStorage.setItem('siteready_auth_user', JSON.stringify(profile));
      }

      // Fetch company membership and active role
      const { data: member } = await supabase
        .from('company_members')
        .select('*, company:companies(*)')
        .eq('user_id', sbUser.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (member) {
        setRole(member.role as UserRole);
        localStorage.setItem('siteready_auth_role', member.role);
        if (member.company) {
          setCompany(member.company as Company);
        }
      }
    } catch (err) {
      console.warn('Failed to sync live Supabase session details:', err);
    } finally {
      refreshUserData();
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isLiveMode && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          throw new Error(error.message);
        }
        if (data.user) {
          await syncSupabaseSessionUser(data.user);
          return;
        }
      }

      // Demo authentication simulation
      const loggedInUser: Profile = {
        ...INITIAL_USER,
        email,
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase()
      };
      setUser(loggedInUser);
      localStorage.setItem('siteready_auth_user', JSON.stringify(loggedInUser));
      await refreshUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password?: string, fullName?: string) => {
    setIsLoading(true);
    try {
      if (isLiveMode && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0]
            }
          }
        });
        if (error) {
          throw new Error(error.message);
        }
        if (data.user) {
          await syncSupabaseSessionUser(data.user);
          return;
        }
      }

      const newUser: Profile = {
        id: 'usr-' + Date.now().toString(36),
        email,
        full_name: fullName || email.split('@')[0],
        preferred_language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUser(newUser);
      setRole('owner');
      localStorage.setItem('siteready_auth_user', JSON.stringify(newUser));
      localStorage.setItem('siteready_auth_role', 'owner');
      await refreshUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isLiveMode && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Live Supabase sign out error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('siteready_auth_user');
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      if (isLiveMode && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) {
          throw new Error(error.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('siteready_auth_role', newRole);
  };

  const onboardCompany = async (data: {
    name: string;
    name_ar?: string;
    cr_number?: string;
    default_language: 'en' | 'ar';
    initialSiteName: string;
  }) => {
    setIsLoading(true);
    try {
      if (isLiveMode && supabase) {
        const { data: rpcData, error } = await supabase.rpc('create_company_with_owner', {
          p_company_name: data.name,
          p_company_name_ar: data.name_ar,
          p_cr_number: data.cr_number,
          p_default_language: data.default_language,
          p_initial_site_name: data.initialSiteName
        });
        if (!error && rpcData?.company_id) {
          await refreshUserData();
          return;
        }
      }

      const updatedCompany = await db.updateCompany({
        name: data.name,
        name_ar: data.name_ar,
        cr_number: data.cr_number,
        default_language: data.default_language
      });
      setCompany(updatedCompany);

      if (data.initialSiteName) {
        await db.createSite({
          company_id: updatedCompany.id,
          name: data.initialSiteName,
          name_ar: data.name_ar ? `${data.initialSiteName} (الموقع الرئيسي)` : undefined,
          is_active: true
        });
      }
      await refreshUserData();
    } finally {
      setIsLoading(false);
    }
  };

  // Role permissions evaluation (Owner, Manager, Viewer)
  const can = (
    action: 'manage_company' | 'manage_users' | 'manage_sites' | 'manage_employees' | 'manage_certificates' | 'manage_inspections'
  ): boolean => {
    if (role === 'owner') return true;
    if (role === 'manager') {
      return (
        action === 'manage_employees' ||
        action === 'manage_certificates' ||
        action === 'manage_inspections' ||
        action === 'manage_sites'
      );
    }
    // Viewer has read-only access to all records
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        role,
        selectedSiteId,
        sites,
        isAuthenticated: !!user,
        isLoading,
        setSelectedSiteId,
        login,
        signup,
        resetPassword,
        logout,
        onboardCompany,
        switchRole,
        can,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
