import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Zap, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

const OTP_LENGTH = 6;

export default function Register() {
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ── Step 1: Send OTP ───────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/send-register-otp', formData);
      setSuccessMsg(res.data.message || `Verification code sent to ${formData.email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & Create Account ───────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the complete ${OTP_LENGTH}-digit code.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-register-otp', {
        ...formData,
        otp,
      });
      // Auto-login after account creation
      if (res.data.user) {
        const loginRes = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', loginRes.data.token);
        localStorage.setItem('user', JSON.stringify(loginRes.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/send-register-otp', formData);
      setSuccessMsg(`New code sent to ${formData.email}`);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background: '#f0f9ff',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,0.28) 0%, transparent 70%)',
      }}
    >
      <div
        className="fixed top-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none"
        style={{ background: 'rgba(125,211,252,0.28)', filter: 'blur(80px)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#0284c7,#38bdf8)',
                boxShadow: '0 0 30px rgba(14,165,233,0.3), 0 0 60px rgba(14,165,233,0.15)',
              }}
            >
              {step === 1 ? <Zap size={26} className="text-white" /> : <ShieldCheck size={26} className="text-white" />}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {step === 1
              ? 'Join ResumeAI and land your dream job'
              : `Enter the 6-digit code sent to ${formData.email}`}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-5 sm:p-8"
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid #bae6fd',
            boxShadow: '0 20px 60px rgba(14,165,233,0.16)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-5">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step >= s ? 'linear-gradient(135deg,#0284c7,#38bdf8)' : '#e2e8f0',
                    color: step >= s ? 'white' : '#94a3b8',
                  }}
                >
                  {step > s ? <CheckCircle size={14} /> : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s ? 'text-sky-700' : 'text-slate-400'}`}>
                  {s === 1 ? 'Details' : 'Verify'}
                </span>
                {s < 2 && <div className="flex-1 h-px bg-slate-200" />}
              </div>
            ))}
          </div>

          {/* Error / success alerts */}
          {error && (
            <div
              className="flex items-center gap-2 text-red-500 p-3 rounded-xl text-xs sm:text-sm mb-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
          {successMsg && !error && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs sm:text-sm mb-4">
              <CheckCircle size={16} className="shrink-0 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* ── STEP 1: Form ─────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full rounded-xl py-3 pl-11 pr-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-base sm:text-sm transition-all"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl py-3 pl-11 pr-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-base sm:text-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl py-3 pl-11 pr-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-base sm:text-sm transition-all"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base flex justify-center items-center gap-2 mt-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-lg"
                style={{
                  background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
                  boxShadow: loading ? 'none' : '0 8px 20px rgba(14,165,233,0.35)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Verification Code <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP Verification ─────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  6-Digit Verification Code
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
                <p className="text-xs text-slate-400 text-center mt-1">
                  Code expires in 10 minutes. Check your spam folder if not received.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== OTP_LENGTH}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base flex justify-center items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-lg"
                style={{
                  background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
                  boxShadow: loading ? 'none' : '0 8px 20px rgba(14,165,233,0.35)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify & Create Account <ArrowRight size={18} /></>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sky-600 font-semibold hover:text-sky-700 disabled:opacity-50"
                >
                  Resend Code
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

          <p className="text-center text-slate-500 mt-6 text-xs sm:text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 font-semibold hover:text-sky-700 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
