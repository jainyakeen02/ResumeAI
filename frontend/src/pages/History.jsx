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
      try {
        const response = await api.get('/resume/history');
        setHistory(response.data.history);
      } catch (err) {
        setError('Failed to fetch resume history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis History</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review your past resume analyses and AI reports.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search filenames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white transition-all"
          />
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300">File Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300">Upload Date</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
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
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
                          <FileText size={20} />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white truncate max-w-xs">{item.filename}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                        <Clock size={16} />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {item.analysis_result?.status === 'pending_ml_analysis' ? 'Pending ML' : 'Processed'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedReport(item)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                      >
                        <Download size={16} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="text-brand-500" size={24} />
                Analysis Report: {selectedReport.filename}
              </h3>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <AlertCircle size={24} className="rotate-45" /> {/* Close Icon */}
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedReport.analysis_result?.status === 'completed' ? (
                <>
                  <div className="flex items-center gap-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border-4 border-brand-500 shadow-sm">
                      <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">{selectedReport.analysis_result.ats_score}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">ATS Score</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Based on industry standards for Applicant Tracking Systems.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Contact Info</h4>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <li><strong>Email:</strong> {selectedReport.analysis_result.contact_info?.email || 'Not found'}</li>
                        <li><strong>Phone:</strong> {selectedReport.analysis_result.contact_info?.phone || 'Not found'}</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Detected Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.analysis_result.skills?.map(skill => (
                          <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded-lg">
                            {skill}
                          </span>
                        )) || <span className="text-sm text-slate-500">No skills detected.</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">AI Feedback</h4>
                    <ul className="space-y-3">
                      {selectedReport.analysis_result.feedback?.map((item, index) => (
                        <li key={index} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p>Analysis is still pending. Please check back later.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
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
