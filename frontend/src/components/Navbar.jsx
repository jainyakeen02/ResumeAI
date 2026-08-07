import { Bell, Search, User, Settings, LogOut, ChevronDown, Menu, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/upload':     'Upload Resume',
  '/history':    'Analysis History',
  '/profile':    'My Profile',
  '/settings':   'Settings',
};

export default function Navbar({ onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.username || user.email || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const pageTitle = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/gap-analysis') ? 'Skill Gap Analysis' :
     location.pathname.startsWith('/mock-interview') ? 'Mock Interview' : 'ResumeAI');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>

        {/* Page Title */}
        <div className="hidden sm:flex flex-col">
          <h1 className="text-base font-bold text-slate-800 leading-tight">{pageTitle}</h1>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">AI Resume Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* AI Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(99,102,241,0.1))', border: '1px solid rgba(14,165,233,0.2)', color: '#0284c7' }}>
          <Sparkles size={12} /> AI Active
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-sky-500 rounded-full" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all hover:bg-slate-100"
            style={{ border: '1.5px solid rgba(226,232,240,0.8)' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#0284c7,#6366f1)' }}
            >
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[100px]">{user.email || ''}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-1.5 z-50 animate-fadeIn overflow-hidden"
              style={{ background: '#fff', border: '1.5px solid rgba(226,232,240,0.8)', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
            >
              <div className="px-4 py-3 mb-1 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>
              <Link to="/profile" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition-all">
                <User size={15} className="text-sky-500" /> My Profile
              </Link>
              <Link to="/settings" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition-all">
                <Settings size={15} className="text-sky-500" /> Settings
              </Link>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 w-full transition-all">
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
