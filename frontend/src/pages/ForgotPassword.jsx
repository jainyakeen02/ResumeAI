import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, KeyRound, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

const OTP_LENGTH = 6;

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // ── Step 1: Send OTP ────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/send-reset-otp', { email });
      setSuccessMsg(res.data.message || `Reset code sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the complete ${OTP_LENGTH}-digit code.`);
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-otp', { email, otp });
      setResetToken(res.data.reset_token);
      setSuccessMsg('Identity verified! Please set your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/send-reset-otp', { email });
      setSuccessMsg(`New code sent to ${email}`);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        reset_token: resetToken,
        new_password: newPassword,
      });
      setSuccessMsg(res.data.message || 'Password updated successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Enter Email', 'Verify Code', 'New Password'];
  const stepIcons = [Mail, ShieldCheck, Lock];

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background: '#f0f9ff',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,0.28) 0%, transparent 70%)',
      }}
    >
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#0284c7,#38bdf8)',
                boxShadow: '0 0 30px rgba(14,165,233,0.3)',
              }}
            >
              <KeyRound size={26} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {step === 1 && 'Enter your registered email to receive a reset code'}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && 'Almost done — set your new password'}
          </p>
        </div>

        <div
          className="rounded-2xl p-5 sm:p-8"
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid #bae6fd',
            boxShadow: '0 20px 60px rgba(14,165,233,0.16)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {stepLabels.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                    style={{
                      background: step >= s ? 'linear-gradient(135deg,#0284c7,#38bdf8)' : '#e2e8f0',
                      color: step >= s ? 'white' : '#94a3b8',
                    }}
                  >
                    {step > s ? <CheckCircle size={14} /> : s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block truncate ${step >= s ? 'text-sky-700' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  {s < 3 && <div className="flex-1 h-px bg-slate-200" />}
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          {error && (
            <div
              className="flex items-center gap-2 text-red-500 p-3.5 rounded-xl text-xs sm:text-sm font-medium mb-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
          {successMsg && !error && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs sm:text-sm font-medium mb-4">
              <CheckCircle size={16} className="shrink-0 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl py-3 pl-11 pr-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-base sm:text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base flex justify-center items-center gap-2 mt-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
                  boxShadow: loading ? 'none' : '0 8px 20px rgba(14,165,233,0.35)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Reset Code <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={OTP_LENGTH}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
                  className="w-full rounded-xl py-4 px-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-2xl font-bold text-center tracking-[0.5em] transition-all"
                  placeholder="······"
                />
                <p className="text-xs text-slate-400 text-center">
                  Check your spam folder if not received. Code expires in 10 minutes.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== OTP_LENGTH}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base flex justify-center items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
                  boxShadow: loading ? 'none' : '0 8px 20px rgba(14,165,233,0.35)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify Code <ArrowRight size={18} /></>
                )}
              </button>
              <div className="text-center text-xs text-slate-500">
                Didn't get it?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sky-600 font-semibold hover:text-sky-700 disabled:opacity-50"
                >
                  Resend
                </button>
                {' · '}
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setSuccessMsg(''); setOtp(''); }}
                  className="text-slate-500 font-semibold hover:text-slate-700"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                  <input
                    type="password"
                    required
                    autoFocus
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl py-3 pl-11 pr-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-base sm:text-sm transition-all"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl py-3 pl-11 pr-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-base sm:text-sm transition-all"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base flex justify-center items-center gap-2 mt-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
                  boxShadow: loading ? 'none' : '0 8px 20px rgba(14,165,233,0.35)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Update Password <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-sky-700 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
