import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Building2, BarChart, FileJson, Database, Settings, LogOut, TerminalSquare, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setRole } = useStore();

  const navItems = [
    { icon: Shield, label: 'Overview', path: '/admin/overview' },
    { icon: Building2, label: 'Companies', path: '/admin/companies' },
    { icon: BarChart, label: 'Benchmarks', path: '/admin/benchmarks' },
    { icon: FileJson, label: 'Inventory Library', path: '/admin/templates' },
    { icon: BookOpen, label: 'Employee Library', path: '/admin/library' },
    { icon: Database, label: 'Interventions', path: '/admin/interventions' },
    { icon: TerminalSquare, label: 'Prompt Center', path: '/admin/prompt-center' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    setRole(null);
    navigate('/login');
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border bg-primary/5">
          <Shield className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">InsighLoop <span className="text-xs font-normal text-muted-foreground ml-1">ADMIN</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Admin Panel'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">Super Admin</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
