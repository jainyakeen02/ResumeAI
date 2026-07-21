import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-sky-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56,189,248,0.22) 0%, transparent 60%)',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
