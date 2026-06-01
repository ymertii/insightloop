import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Lightbulb, MessageCircle, BookOpen, LogOut, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export function EmployeeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setRole } = useStore();

  const navItems = [
    { icon: Home, label: 'Home', path: '/employee/home' },
    { icon: BarChart2, label: 'My Stats', path: '/employee/my-stats' },
    { icon: Lightbulb, label: 'Insights', path: '/employee/insights' },
    { icon: MessageCircle, label: 'Help Coach', path: '/employee/help-coach' },
    { icon: BookOpen, label: 'Library', path: '/employee/library' },
  ];

  const handleLogout = () => {
    setRole(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">InsighLoop</span>
        </div>
        
        <div className="p-6 pb-2">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
              JD
            </div>
            <div>
              <div className="text-sm font-semibold">Jane Doe</div>
              <div className="text-xs text-slate-500">Product Designer</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Welcome'}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
