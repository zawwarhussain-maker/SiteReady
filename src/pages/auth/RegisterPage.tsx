import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { HardHat, Lock, Mail, User, ArrowRight, ArrowLeft, Building2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { signup } = useAuth();
  const { t, isRtl } = useI18n();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !fullName || !email || !password) {
      setError(t('requiredField'));
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, fullName);
      navigate('/onboarding');
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#16324F] flex items-center justify-center text-white shadow-lg mb-4">
          <HardHat className="w-8 h-8 text-[#168C82]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#172B3A] tracking-tight">
          {t('signUpTitle')}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {isRtl
            ? 'ابدأ إدارة سلامة عمالك ومقاوليك في المملكة والخليج'
            : 'Start managing contractor safety and workforce compliance'}
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
                {t('companyName')}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                  placeholder="e.g. Al-Fanar Contracting KSA"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('fullName')}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                  placeholder="e.g. Eng. Tariq Al-Otaibi"
                />
              </div>
            </div>

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
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                  placeholder="name@company.com.sa"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B3A] mb-1">
                {t('passwordLabel')}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#16324F]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#168C82] text-white text-xs sm:text-sm font-bold hover:bg-[#116e66] transition-colors shadow-md disabled:opacity-70 mt-2"
            >
              <span>{isLoading ? t('loading') : t('createAccountButton')}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#64748B]">
              {t('hasAccountPrompt')}{' '}
              <Link to="/login" className="font-bold text-[#168C82] hover:underline">
                {t('signInButton')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
