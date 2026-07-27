import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import api from '../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSuccessfulRegister = (token, user) => {
    const existing = JSON.parse(localStorage.getItem('registered_users') || '[]');
    if (!existing.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      existing.push(user);
      localStorage.setItem('registered_users', JSON.stringify(existing));
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.token && response.data.user) {
        handleSuccessfulRegister(response.data.token, response.data.user);
      } else {
        navigate('/login');
      }
    } catch (err) {
      if (!err.response) {
        // Fallback for offline mode
        const newUser = {
          id: 'user-' + Date.now(),
          username: formData.username || 'New User',
          email: formData.email,
          created_at: new Date().toISOString()
        };
        handleSuccessfulRegister('local-token-' + Date.now(), newUser);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
              <Zap size={26} className="text-white sm:w-7 sm:h-7" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Join ResumeAI and land your dream job</p>
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
                className="flex items-center gap-2 text-red-500 p-3 rounded-xl text-xs sm:text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl py-3 pl-11 pr-4 text-slate-900 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-base sm:text-sm transition-all"
                  placeholder="••••••••"
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
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

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
