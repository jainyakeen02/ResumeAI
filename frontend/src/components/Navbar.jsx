import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user.username || user.email || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
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
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-20"
      style={{
        background: 'rgba(255,255,255,0.88)',
        borderBottom: '1px solid rgba(186,230,253,0.9)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Search */}
      <div className="flex-1 flex items-center max-w-sm gap-2 px-4 py-2 rounded-xl text-sm"
        style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
      >
        <Search size={15} className="text-sky-500 shrink-0" />
        <input
          type="text"
          placeholder="Search resumes..."
          className="w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 text-sm"
        />
      </div>

      <div className="flex items-center gap-3 ml-4">

        {/* Notification */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-400 rounded-full"
            style={{ boxShadow: '0 0 6px rgba(14,165,233,0.7)' }}
          />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all"
            style={{
              border: '1px solid #bae6fd',
              background: dropdownOpen ? '#f0f9ff' : 'rgba(255,255,255,0.8)',
            }}
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
                boxShadow: '0 0 10px rgba(14,165,233,0.3)',
              }}
            >
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">{user.email || ''}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-1.5 z-50 animate-fadeIn overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.98)',
                border: '1px solid #bae6fd',
                boxShadow: '0 20px 60px rgba(14,165,233,0.15)',
              }}
            >
              {/* Header */}
              <div className="px-4 py-3 mb-1" style={{ borderBottom: '1px solid #e0f2fe' }}>
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
              </div>

              <Link to="/profile" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition-all"
              >
                <User size={15} className="text-sky-600" /> My Profile
              </Link>

              <Link to="/settings" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition-all"
              >
                <Settings size={15} className="text-sky-600" /> Settings
              </Link>

              <div className="mt-1 pt-1" style={{ borderTop: '1px solid #e0f2fe' }}>
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 w-full transition-all"
                >
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
