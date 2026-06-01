import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Target, ClipboardList, Settings, LogOut, Activity, Briefcase } from 'lucide-react';
import { useStore } from '../store/useStore';

export function CompanyLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTenant, setRole } = useStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/company/dashboard' },
    { icon: FileText, label: 'Reports', path: '/company/reports' },
    { icon: Users, label: 'Departments', path: '/company/departments' },
    { icon: Target, label: 'Personas', path: '/company/personas' },
    { icon: ClipboardList, label: 'Tests & Inventories', path: '/company/tests' },
    { icon: Activity, label: 'Action Plans', path: '/company/action-plans' },
    { icon: Settings, label: 'Settings', path: '/company/settings' },
  ];

  const handleLogout = () => {
    setRole(null);
    navigate('/login');
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Briefcase className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">InsighLoop</span>
        </div>
        
        <div className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Current Tenant</div>
          <div className="bg-secondary/50 rounded-md px-3 py-2 text-sm font-medium border border-border">
            {currentTenant}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold">
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Overview'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              HR
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
