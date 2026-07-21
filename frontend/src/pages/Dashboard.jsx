import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UploadCloud, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_uploads: 0, analyzed: 0, pending: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get username from stored user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.username || user.email || 'User';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/resume/stats'),
          api.get('/resume/activity'),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data.activity);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Uploads', value: stats.total_uploads, icon: UploadCloud, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { title: 'Analyzed', value: stats.analyzed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {displayName} 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your resume analysis today.
          </p>
        </div>
        <Link
          to="/upload"
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
        >
          Upload New Resume
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="glass rounded-2xl p-6 transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  {loading ? (
                    <div className="h-8 w-12 mt-1 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Upload Activity (Last 6 Months)</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activity.every(m => m.resumes === 0) ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <UploadCloud size={48} className="mb-3 text-slate-300 dark:text-slate-600" />
            <p className="font-medium">No activity yet</p>
            <p className="text-sm mt-1">Upload your first resume to see activity here.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="resumes" name="Uploads" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {stats.total_uploads === 0 && !loading && (
        <div className="glass rounded-2xl p-8 text-center border-2 border-dashed border-brand-200 dark:border-brand-800">
          <UploadCloud size={48} className="mx-auto mb-4 text-brand-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Get Started!</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Upload your first resume to get an AI-powered ATS analysis.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all"
          >
            Upload Resume <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
