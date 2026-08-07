import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Target, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import api from '../utils/api';

export default function SkillGap() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description to analyze.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await api.post(`/resume/${id}/gap-analysis`, {
        job_description: jobDescription
      });
      setResult(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform analysis. Please ensure API is reachable and Gemini key is set.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to History
      </button>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="text-brand-500" />
          Skill Gap Analysis
        </h2>
        <p className="text-slate-500 mt-1">
          Paste the target Job Description to see how well your resume matches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[500px]">
          <h3 className="font-semibold mb-3">Job Description</h3>
          <textarea 
            className="flex-1 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 focus:ring-2 focus:ring-brand-500 outline-none text-sm resize-none"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
          </button>
          {error && <p className="text-red-500 text-sm mt-3 flex items-center gap-2"><AlertCircle size={16} />{error}</p>}
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-[500px] overflow-y-auto">
          {result ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 rounded-full border-4 border-brand-500 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-brand-600 dark:text-brand-400">{result.match_percentage}%</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Match Score</h3>
                  <p className="text-sm text-slate-500">Based on core skills and requirements.</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Matching Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {result.matching_skills.map(s => (
                    <span key={s} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">{s}</span>
                  ))}
                  {result.matching_skills.length === 0 && <span className="text-sm text-slate-500">None found.</span>}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><AlertCircle size={16} className="text-rose-500" /> Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills.map(s => (
                    <span key={s} className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">{s}</span>
                  ))}
                  {result.missing_skills.length === 0 && <span className="text-sm text-slate-500">None found. Perfect match!</span>}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-amber-500" /> Recommendations</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-slate-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Target size={48} className="mb-4 opacity-50" />
              <p>Run the analysis to see your skill gaps.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
