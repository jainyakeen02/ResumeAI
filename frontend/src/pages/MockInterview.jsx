import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Send, Loader2, PlayCircle, Bot, User, List } from 'lucide-react';
import api from '../utils/api';

export default function MockInterview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStart = async () => {
    setStartLoading(true);
    setError('');
    try {
      // 1. Generate Questions
      if (jobDescription.trim()) {
        const qRes = await api.post('/interview/generate', {
          resume_id: id,
          job_description: jobDescription
        });
        setQuestions(qRes.data.data.questions || []);
      }
      
      // 2. Start Session
      const sRes = await api.post('/interview/session/start', {
        resume_id: id,
        job_description: jobDescription
      });
      setSessionId(sRes.data.session_id);
      setSessionActive(true);
      
      // Initial greeting
      setMessages([{
        role: 'model',
        content: "Hello! I'm your AI Interviewer. I've reviewed your resume. Are you ready to begin the interview?"
      }]);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview. Check API configuration.');
    } finally {
      setStartLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await api.post(`/interview/session/${sessionId}/chat`, {
        message: userMsg
      });
      setMessages(prev => [...prev, { role: 'model', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Let's try that again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!sessionActive) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => navigate('/history')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft size={16} /> Back to History
        </button>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-brand-500" /> AI Mock Interview
          </h2>
          <p className="text-slate-500 mt-1">
            Prepare for your interview by chatting with our AI recruiter.
          </p>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold mb-3">Target Job Description (Optional)</h3>
          <p className="text-sm text-slate-500 mb-3">If you provide a JD, the AI will generate specific technical questions and tailor the interview.</p>
          <textarea 
            className="w-full h-40 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 focus:ring-2 focus:ring-brand-500 outline-none text-sm resize-none"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <button 
            onClick={handleStart}
            disabled={startLoading}
            className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {startLoading ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
            {startLoading ? 'Preparing Interview...' : 'Start Interview'}
          </button>
          {error && <p className="text-red-500 text-sm mt-3 flex items-center gap-2"><AlertCircle size={16} />{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Questions Sidebar (Only visible if JD was provided) */}
      {questions.length > 0 && (
        <div className="lg:w-1/3 glass p-5 rounded-2xl border border-slate-200 dark:border-slate-700 h-full flex flex-col hidden lg:flex">
          <h3 className="font-semibold flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <List className="text-brand-500" size={18} /> Generated Questions
          </h3>
          <div className="overflow-y-auto pr-2 space-y-4 flex-1">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{q.type}</span>
                <p className="text-sm font-medium mt-1 mb-2 text-slate-900 dark:text-white">{q.question}</p>
                <div className="text-xs text-slate-500 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold">Hint:</span> {q.expected_answer_hints}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="flex-1 glass rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI Interviewer</h3>
            <p className="text-xs text-emerald-500 font-medium">● Online</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-sky-100 text-sky-600' : 'bg-brand-100 text-brand-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="relative">
            <input 
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your answer..."
              disabled={chatLoading}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!inputMessage.trim() || chatLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-brand-600"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
