import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Clock, User, Settings, LogOut, Zap, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard',      path: '/dashboard', icon: Home },
    { name: 'Upload Resume',  path: '/upload',    icon: FileText },
    { name: 'History',        path: '/history',   icon: Clock },
    { name: 'Profile',        path: '/profile',   icon: User },
    { name: 'Settings',       path: '/settings',  icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'rgba(255,255,255,0.96)',
          borderRight: '1px solid #bae6fd',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header / Logo */}
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', boxShadow: '0 0 16px rgba(14,165,233,0.3)' }}
            >
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-sky-700 tracking-tight">ResumeAI</span>
          </div>

          {/* Close button for Mobile/Tablet */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-sky-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive ? 'text-sky-700' : 'text-slate-500 hover:text-sky-700'
                }`}
                style={
                  isActive
                    ? {
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        boxShadow: 'inset 0 0 20px rgba(14,165,233,0.05)',
                      }
                    : {}
                }
              >
                <Icon
                  size={18}
                  className={`transition-all duration-200 ${
                    isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-sky-600'
                  }`}
                  style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(14,165,233,0.35))' } : {}}
                />
                {item.name}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500"
                    style={{ boxShadow: '0 0 6px rgba(14,165,233,0.65)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4" style={{ borderTop: '1px solid #e0f2fe' }} />

        {/* Logout */}
        <div className="p-3 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 transition-all duration-200 group"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.cssText += 'background:#fef2f2;border-color:#fecaca;')}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
