import { useState } from 'react';
import { User, Mail, Calendar, FileText, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.username || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const [formData, setFormData] = useState({ username: user.username || '', email: user.email || '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      // Update localStorage immediately with new name/email
      const updatedUser = { ...user, username: formData.username, email: formData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account information.</p>
      </div>

      {/* Avatar Card */}
      <div className="glass rounded-2xl p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-brand-500/30 shrink-0">
          {initials}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{displayName}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              Member since {memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="glass rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Edit Information</h3>
        <form onSubmit={handleSave} className="space-y-5">
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl text-sm border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle size={16} /> {success}
            </div>
          )}
          {error && (
            <div className="text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
