import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { HardHat, Lock, Mail, ArrowRight, ArrowLeft, Shield, Globe } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const { t, locale, toggleLanguage, isRtl } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState('tariq.otaibi@alfanar.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('requiredField'));
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: UserRole, demoEmail: string) => {
    setIsLoading(true);
    switchRole(demoRole);
    await login(demoEmail);
    navigate('/dashboard');
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Language Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#16324F] hover:bg-slate-50 shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-[#168C82]" />
          <span>{locale === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#16324F] flex items-center justify-center text-white shadow-lg mb-4">
          <HardHat className="w-8 h-8 text-[#168C82]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#172B3A] tracking-tight">
          {t('brandName')}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {t('signInSubtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-[#E2E8F0]">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('emailLabel')}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] focus:border-[#16324F]"
                  placeholder="name@company.com.sa"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#172B3A]">
                  {t('passwordLabel')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#168C82] hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F] focus:border-[#16324F]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#16324F] text-white text-xs sm:text-sm font-bold hover:bg-[#0F2236] transition-colors shadow-md disabled:opacity-70 mt-2"
            >
              <span>{isLoading ? t('loading') : t('signInButton')}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              {isRtl ? 'تسجيل دخول سريع للتجربة (اختر الصلاحية):' : 'Instant Demo Login (Select Role):'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('owner', 'tariq.otaibi@alfanar.com')}
                className="p-2 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 text-[11px] font-bold text-amber-900 transition-colors flex flex-col items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('roleOwner')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('manager', 'zayd.harbi@alfanar.com')}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-[11px] font-bold text-blue-900 transition-colors flex flex-col items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('roleManager')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('viewer', 'auditor@neom.com')}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors flex flex-col items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('roleViewer')}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#64748B]">
              {t('noAccountPrompt')}{' '}
              <Link to="/register" className="font-bold text-[#168C82] hover:underline">
                {t('signUpPrompt')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
