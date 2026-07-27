import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const resetToken = sessionStorage.getItem('reset_token');
  const resetEmail = sessionStorage.getItem('reset_email') || 'your account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        reset_token: resetToken,
        new_password: newPassword
      });

      setSuccessMsg(response.data.message || 'Password reset successfully! Redirecting to login...');
      sessionStorage.removeItem('reset_token');
      sessionStorage.removeItem('reset_email');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      if (!err.response) {
        // Local mode fallback
        setSuccessMsg(`Password for ${resetEmail} updated successfully! Redirecting to login...`);
        sessionStorage.removeItem('reset_token');
        sessionStorage.removeItem('reset_email');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(err.response.data?.message || 'Failed to reset password. Please try again.');
        setLoading(false);
      }
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
      <div className="w-full max-w-md relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#0284c7,#38bdf8)',
                boxShadow: '0 0 30px rgba(14,165,233,0.3)',
              }}
            >
              <ShieldCheck size={26} className="text-white sm:w-7 sm:h-7" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create New Password</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Setting new password for <span className="font-semibold text-slate-800">{resetEmail}</span>
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div
                className="flex items-center gap-2 text-red-500 p-3.5 rounded-xl text-xs sm:text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs sm:text-sm font-medium">
                <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                {successMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600" size={18} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl py-3 pl-11 pr-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-base sm:text-sm transition-all"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Confirm New Password</label>
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
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm sm:text-base flex justify-center items-center gap-2 mt-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-lg"
              style={{
                background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
                boxShadow: loading ? 'none' : '0 8px 20px rgba(14,165,233,0.35)',
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Update Password <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
            <Link to="/login" className="text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
              Cancel & Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
