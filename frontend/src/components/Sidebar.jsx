import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Clock, User, Settings, LogOut, Zap, X, Target, MessageSquare } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard',    path: '/dashboard', icon: Home },
    { name: 'Upload Resume',path: '/upload',    icon: FileText },
    { name: 'History',      path: '/history',   icon: Clock },
    { name: 'Profile',      path: '/profile',   icon: User },
    { name: 'Settings',     path: '/settings',  icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(226,232,240,0.8)',
          boxShadow: '4px 0 24px rgba(14,165,233,0.04)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0284c7,#6366f1)', boxShadow: '0 4px 12px rgba(14,165,233,0.4)' }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight" style={{ background: 'linear-gradient(135deg,#0284c7,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Resume Assistant</span>
              <span className="block text-[10px] font-semibold text-slate-400 -mt-0.5 tracking-wider"></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Label */}
        <div className="px-5 pb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive 
                    ? 'bg-sky-100 text-sky-600' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-500'
                }`}>
                  <Icon size={16} />
                </div>
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-5 rounded-full bg-gradient-to-b from-sky-400 to-indigo-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Features Section */}
        <div className="px-5 pb-3 pt-4">
          <div className="p-3.5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.08))', border: '1px solid rgba(14,165,233,0.15)' }}>
            <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-2">AI Features</p>
            <p className="text-xs text-slate-500">Go to <strong>History</strong> and open any report to access Skill Gap Analysis and Mock Interview.</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-slate-100" />

        {/* Logout */}
        <div className="p-3 pb-5">
          <button
            onClick={handleLogout}
            className="sidebar-item w-full hover:!bg-red-50 hover:!text-red-500"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 transition-all group-hover:bg-red-50">
              <LogOut size={16} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
