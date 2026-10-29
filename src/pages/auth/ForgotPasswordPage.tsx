import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';
import { useI18n } from '../../lib/i18nContext';
import { HardHat, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const { t, isRtl } = useI18n();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#16324F] flex items-center justify-center text-white shadow-lg mb-4">
          <HardHat className="w-8 h-8 text-[#168C82]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#172B3A] tracking-tight">
          {t('forgotPassword')}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {isRtl
            ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور'
            : 'Enter your corporate email to receive a password recovery link'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-[#E2E8F0]">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#172B3A]">
                {isRtl ? 'تم إرسال رابط الاستعادة' : 'Reset Link Sent'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                {isRtl
                  ? `أرسلنا رابط التحقق إلى ${email}. يرجى مراجعة بريدك الإلكتروني.`
                  : `We sent a secure recovery link to ${email}. Check your inbox.`}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#168C82] hover:underline"
              >
                <BackIcon className="w-4 h-4" />
                <span>{t('backToSignIn')}</span>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#16324F] text-white text-xs sm:text-sm font-bold hover:bg-[#0F2236] transition-colors shadow-md disabled:opacity-70"
              >
                <span>{isLoading ? t('loading') : t('resetPasswordButton')}</span>
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172B3A]"
                >
                  <BackIcon className="w-3.5 h-3.5" />
                  <span>{t('backToSignIn')}</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
