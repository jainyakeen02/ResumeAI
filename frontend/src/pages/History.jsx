import { useState, useEffect } from 'react';
import { FileText, Download, Clock, AlertCircle, Search } from 'lucide-react';
import api from '../utils/api';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      let remoteHistory = [];
      try {
        const response = await api.get('/resume/history');
        remoteHistory = response.data.history || [];
      } catch (err) {
        console.warn('Backend server offline, using local storage history.');
      } finally {
        const localHistory = JSON.parse(localStorage.getItem('local_history') || '[]');
        const combined = [...localHistory, ...remoteHistory];
        if (combined.length === 0) {
          const sampleItem = {
            id: 'sample-1',
            filename: 'Software_Developer_Resume.pdf',
            created_at: new Date().toISOString(),
            analysis_result: {
              status: 'completed',
              ats_score: 88,
              contact_info: { email: 'alex.smith@example.com', phone: '+1 (555) 234-5678', linkedin: 'linkedin.com/in/alexsmith' },
              skills: ['React', 'Node.js', 'Python', 'TypeScript', 'Docker', 'AWS', 'REST APIs'],
              category_scores: { contact: 15, sections: 19, skills: 23, impact: 15, formatting: 16 },
              feedback: [
                'Include bullet points with clear numerical metrics (e.g., improved response time by 40%).',
                'Strong skill keyword match found across modern web engineering stacks.'
              ]
            }
          };
          setHistory([sampleItem]);
        } else {
          setHistory(combined);
        }
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Analysis History</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Review your past resume analyses and AI reports.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search filenames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white text-sm transition-all"
          />
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
                <th className="py-3.5 px-4 sm:px-6 font-semibold text-slate-600 dark:text-slate-300">File Name</th>
                <th className="py-3.5 px-4 sm:px-6 font-semibold text-slate-600 dark:text-slate-300">Upload Date</th>
                <th className="py-3.5 px-4 sm:px-6 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="py-3.5 px-4 sm:px-6 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading history...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center text-red-500">
                      <AlertCircle size={32} className="mb-2" />
                      {error}
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    No resumes found. Upload your first resume to get started!
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400 shrink-0">
                          <FileText size={18} />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">{item.filename}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock size={15} />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {item.analysis_result?.status === 'completed' ? 'Completed' : 'Processed'}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button 
                        onClick={() => setSelectedReport(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                      >
                        <Download size={15} />
                        Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
              <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate pr-2">
                <FileText className="text-brand-500 shrink-0" size={22} />
                <span className="truncate">Report: {selectedReport.filename}</span>
              </h3>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <AlertCircle size={22} className="rotate-45" /> {/* Close Icon */}
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {selectedReport.analysis_result?.status === 'completed' ? (
                <>
                  {/* ATS Score Header */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-5 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center sm:text-left">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border-4 border-brand-500 shadow-sm shrink-0">
                      <span className="text-2xl sm:text-3xl font-bold text-brand-600 dark:text-brand-400">{selectedReport.analysis_result.ats_score}</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">ATS Compatibility Score</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Calculated using industry ATS metrics (contact completeness, sections, keyword match, and quantifiable achievements).</p>
                    </div>
                  </div>

                  {/* Category Score Breakdown */}
                  {selectedReport.analysis_result.category_scores && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-700 pb-2">Score Breakdown</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                          <p className="text-[11px] text-slate-500">Contact Info</p>
                          <p className="text-sm font-bold text-sky-700">{selectedReport.analysis_result.category_scores.contact} / 15</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                          <p className="text-[11px] text-slate-500">Sections</p>
                          <p className="text-sm font-bold text-sky-700">{selectedReport.analysis_result.category_scores.sections} / 20</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                          <p className="text-[11px] text-slate-500">Skills & Keywords</p>
                          <p className="text-sm font-bold text-sky-700">{selectedReport.analysis_result.category_scores.skills} / 25</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                          <p className="text-[11px] text-slate-500">Impact Metrics</p>
                          <p className="text-sm font-bold text-sky-700">{selectedReport.analysis_result.category_scores.impact} / 20</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                          <p className="text-[11px] text-slate-500">Formatting</p>
                          <p className="text-sm font-bold text-sky-700">{selectedReport.analysis_result.category_scores.formatting} / 20</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Info & Detected Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-700 pb-2">Contact Details</h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <li><strong>Email:</strong> {selectedReport.analysis_result.contact_info?.email || 'Not found'}</li>
                        <li><strong>Phone:</strong> {selectedReport.analysis_result.contact_info?.phone || 'Not found'}</li>
                        {selectedReport.analysis_result.contact_info?.linkedin && <li><strong>LinkedIn:</strong> {selectedReport.analysis_result.contact_info.linkedin}</li>}
                        {selectedReport.analysis_result.contact_info?.github && <li><strong>GitHub:</strong> {selectedReport.analysis_result.contact_info.github}</li>}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-700 pb-2">Detected Keywords ({selectedReport.analysis_result.skills?.length || 0})</h4>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                        {selectedReport.analysis_result.skills?.map(skill => (
                          <span key={skill} className="px-2 py-0.5 text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded-lg">
                            {skill}
                          </span>
                        )) || <span className="text-xs text-slate-500">No skills detected.</span>}
                      </div>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm border-b border-slate-200 dark:border-slate-700 pb-2">ATS Recommendations</h4>
                    <ul className="space-y-2.5">
                      {selectedReport.analysis_result.feedback?.map((item, index) => (
                        <li key={index} className="flex gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p>Analysis is pending processing. Please check back shortly.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setSelectedReport(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
