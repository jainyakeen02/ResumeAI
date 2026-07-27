import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  UploadCloud, CheckCircle, Clock, ArrowRight, TrendingUp, Award,
  Sparkles, Layers, FileText, CheckCircle2, BarChart3, Target, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState({ total_uploads: 0, analyzed: 0, pending: 0, avg_ats_score: 0 });
  const [activity, setActivity] = useState([]);
  const [timeframe, setTimeframe] = useState('12'); // '12', '6', '3'
  const [loading, setLoading] = useState(true);

  // Get username from stored user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.username || user.email || 'User';

  const generate12MonthsActivity = (userResumes) => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const fullMonthName = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      const matchingResumes = userResumes.filter(r => {
        if (!r.created_at) return false;
        const itemDate = new Date(r.created_at);
        return itemDate.getFullYear() === year && itemDate.getMonth() === month;
      });

      const count = matchingResumes.length;
      const scores = matchingResumes
        .map(r => r.analysis_result?.ats_score)
        .filter(s => typeof s === 'number');

      const avg_score = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      months.push({
        name: monthName,
        full_month: fullMonthName,
        resumes: count,
        avg_score: avg_score
      });
    }
    return months;
  };

  const calculateCategoryScores = (userResumes) => {
    const totals = { contact: 0, sections: 0, skills: 0, impact: 0, formatting: 0 };
    let count = 0;

    userResumes.forEach(r => {
      const cats = r.analysis_result?.category_scores;
      if (cats) {
        totals.contact += (cats.contact || 0);
        totals.sections += (cats.sections || 0);
        totals.skills += (cats.skills || 0);
        totals.impact += (cats.impact || 0);
        totals.formatting += (cats.formatting || 0);
        count++;
      }
    });

    if (count === 0) return null;

    return [
      { name: 'Contact Details', score: Math.round((totals.contact / count / 15) * 100), color: '#0284c7' },
      { name: 'Section Structure', score: Math.round((totals.sections / count / 20) * 100), color: '#0ea5e9' },
      { name: 'Keyword Match', score: Math.round((totals.skills / count / 25) * 100), color: '#38bdf8' },
      { name: 'Impact Metrics', score: Math.round((totals.impact / count / 20) * 100), color: '#6366f1' },
      { name: 'Formatting Quality', score: Math.round((totals.formatting / count / 20) * 100), color: '#10b981' },
    ];
  };

  const extractUserSkills = (userResumes) => {
    const counts = {};
    userResumes.forEach(r => {
      const skillsList = r.analysis_result?.skills || [];
      skillsList.forEach(s => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  };

  const extractUserFeedback = (userResumes) => {
    const allFeedback = [];
    userResumes.forEach(r => {
      const fb = r.analysis_result?.feedback || [];
      fb.forEach(item => {
        if (!allFeedback.includes(item)) {
          allFeedback.push(item);
        }
      });
    });
    return allFeedback.slice(0, 5);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      let allUserResumes = [];
      try {
        const historyRes = await api.get('/resume/history');
        allUserResumes = historyRes.data.history || [];
      } catch (err) {
        console.warn('Backend server offline, reading local user uploads.');
      } finally {
        const localHistory = JSON.parse(localStorage.getItem('local_history') || '[]');
        const combined = [...localHistory, ...allUserResumes];
        
        // Remove duplicate items by id if any
        const uniqueResumes = Array.from(new Map(combined.map(item => [item.id || item.filename, item])).values());
        
        setResumes(uniqueResumes);

        const total = uniqueResumes.length;
        const analyzed = uniqueResumes.filter(r => r.analysis_result?.status === 'completed' || r.analysis_result?.ats_score).length;
        const pending = total - analyzed;
        
        const scores = uniqueResumes
          .map(r => r.analysis_result?.ats_score)
          .filter(s => typeof s === 'number');

        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        setStats({
          total_uploads: total,
          analyzed: analyzed,
          pending: pending,
          avg_ats_score: avgScore
        });

        setActivity(generate12MonthsActivity(uniqueResumes));
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredActivity = activity.slice(activity.length - parseInt(timeframe, 10));
  const categoryScores = calculateCategoryScores(resumes);
  const topSkills = extractUserSkills(resumes);
  const userFeedback = extractUserFeedback(resumes);

  const statCards = [
    {
      title: 'Total Resumes Uploaded',
      value: stats.total_uploads,
      sub: stats.total_uploads > 0 ? `${stats.total_uploads} active files` : 'No resumes uploaded yet',
      icon: UploadCloud,
      color: 'text-sky-600',
      bg: 'bg-sky-50 dark:bg-sky-900/30',
      borderColor: 'border-sky-100 dark:border-sky-800'
    },
    {
      title: 'Average ATS Score',
      value: stats.avg_ats_score > 0 ? `${stats.avg_ats_score}%` : 'N/A',
      sub: stats.avg_ats_score > 0 ? 'Calculated from your uploads' : 'Upload a resume to see score',
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      borderColor: 'border-emerald-100 dark:border-emerald-800'
    },
    {
      title: 'Successfully Analyzed',
      value: stats.analyzed,
      sub: stats.analyzed > 0 ? `${stats.analyzed} resumes processed` : '0 processed',
      icon: CheckCircle,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      borderColor: 'border-indigo-100 dark:border-indigo-800'
    },
    {
      title: 'Pending Processing',
      value: stats.pending,
      sub: stats.pending > 0 ? `${stats.pending} in queue` : 'Queue empty',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      borderColor: 'border-amber-100 dark:border-amber-800'
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles size={14} className="text-amber-300" /> Real-time Resume Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-sky-100 text-sm sm:text-base mt-1.5 max-w-xl">
            {stats.total_uploads > 0
              ? `Displaying real ATS analytics from your ${stats.total_uploads} uploaded resume(s).`
              : 'Upload your first resume to view your real ATS scores, 12-month activity, and skill analytics.'}
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2.5 bg-white text-sky-700 hover:bg-sky-50 font-bold px-6 py-3.5 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
          >
            <UploadCloud size={20} />
            Upload Resume
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* 4 Real Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border ${stat.borderColor} shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.title}</span>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="mt-3">
                {loading ? (
                  <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  {stat.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 12 Months Activity Chart Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-sky-600" size={22} />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Upload & ATS Score Activity ({timeframe} Months)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real upload frequency and average ATS compatibility score per month based strictly on your inputs.
            </p>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            {[
              { label: '3 Months', val: '3' },
              { label: '6 Months', val: '6' },
              { label: '12 Months', val: '12' },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => setTimeframe(item.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === item.val
                    ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(2, 132, 199, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-xl border border-slate-800">
                          <p className="font-bold text-sky-300">{data.full_month || data.name}</p>
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400" /> Resumes Uploaded:{' '}
                            <strong className="text-white">{data.resumes}</strong>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Avg ATS Score:{' '}
                            <strong className="text-emerald-300">{data.avg_score > 0 ? `${data.avg_score}%` : 'N/A'}</strong>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="resumes" name="Uploads" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid Section: Category Breakdown + Skills & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real ATS Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Target className="text-sky-600" size={20} />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                ATS Evaluation Breakdown
              </h3>
            </div>
            {categoryScores && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                Real Upload Averages
              </span>
            )}
          </div>

          {categoryScores ? (
            <div className="space-y-4">
              {categoryScores.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{cat.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <Target size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="font-medium">No evaluation data available yet.</p>
              <p className="text-xs mt-1">Upload your first resume to see real section score breakdowns.</p>
            </div>
          )}
        </div>

        {/* Real Extracted Top Skills Cloud */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="text-sky-600" size={20} />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Detected Keywords & Skills
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">{topSkills.length} Identified Skills</span>
          </div>

          {topSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {topSkills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900 transition-all hover:scale-105"
                >
                  <span>{skill.name}</span>
                  <span className="w-4 h-4 rounded-full bg-sky-200 dark:bg-sky-800 text-[10px] text-sky-800 dark:text-sky-200 flex items-center justify-center font-bold">
                    {skill.count}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No skills extracted yet. Upload a resume to populate skills.</p>
          )}

          {/* AI Insights list from real user feedback */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">AI Analysis Feedback</h4>
            {userFeedback.length > 0 ? (
              userFeedback.map((item, idx) => (
                <div key={idx} className="flex gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-2">No AI feedback items yet. Upload a resume to receive tailored recommendations.</p>
            )}
          </div>
        </div>
      </div>

      {/* Real Uploads Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-sky-600" size={20} />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Uploaded Resumes</h3>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
          >
            View History <ArrowRight size={14} />
          </Link>
        </div>

        {resumes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">ATS Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {resumes.slice(0, 5).map((item) => (
                  <tr key={item.id || item.filename} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {item.filename}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.analysis_result?.ats_score ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.analysis_result.ats_score}% ATS Score
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Processing</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/history"
                        className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950 px-3 py-1.5 rounded-lg border border-sky-100 dark:border-sky-900 transition-colors inline-block"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 space-y-3">
            <UploadCloud size={44} className="mx-auto text-slate-300 dark:text-slate-700" />
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">No resumes uploaded yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload your first resume to see real ATS analysis data here.</p>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Upload Resume <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


