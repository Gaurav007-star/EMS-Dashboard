import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ModeToggle } from './mode-toggle';
import {
  LayoutDashboard,
  Users,
  GitFork,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  ChevronRight,
  Trash2,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [binCount, setBinCount] = useState(0);

  const showStatsAndEmployeeList = user?.role === 'Super Admin' || user?.role === 'HR Manager';

  const fetchBinCount = useCallback(async () => {
    try {
      const res = await api.get('/employees/stats');
      if (res.data.success && res.data.stats.deletedCount !== undefined) {
        setBinCount(res.data.stats.deletedCount);
      }
    } catch {
      // silently fail — not critical
    }
  }, []);

  useEffect(() => {
    if (showStatsAndEmployeeList) fetchBinCount();
    const onBinUpdated = () => fetchBinCount();
    window.addEventListener('bin-updated', onBinUpdated);
    return () => window.removeEventListener('bin-updated', onBinUpdated);
  }, [fetchBinCount, showStatsAndEmployeeList]);

  if (!user) return <>{children}</>;

  const menuItems = [
    ...(showStatsAndEmployeeList
      ? [
          {
            name: 'Dashboard',
            path: '/',
            icon: LayoutDashboard,
            description: 'Analytics & Overview',
          },
          {
            name: 'Employees',
            path: '/employees',
            icon: Users,
            description: 'Directory & Management',
          },
          {
            name: 'Bin',
            path: '/bin',
            icon: Trash2,
            description: 'Soft Deleted Records',
          },
        ]
      : []),
    {
      name: 'Org Hierarchy',
      path: '/hierarchy',
      icon: GitFork,
      description: 'Reporting Structure',
    },
    {
      name: 'My Profile',
      path: `/employees/${user.id}`,
      icon: User,
      description: 'Personal Information',
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Role badge color
  const roleBadgeColor =
    user.role === 'Super Admin'
      ? 'bg-destructive/20 text-destructive border border-destructive/30'
      : user.role === 'HR Manager'
        ? 'bg-primary/15 text-primary border border-primary/25'
        : 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border/60 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30 shrink-0">
          <Briefcase size={17} />
        </div>
        <div className="leading-none">
          <h1 className="text-[15px] font-bold text-sidebar-foreground tracking-tight">
            EMS Portal
          </h1>
          <p className="text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-widest mt-0.5">
            Management Suite
          </p>
        </div>
      </div>

      {/* ── User Card ─────────────────────────────────────────── */}
      <div className="mx-3 mt-4 mb-2 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/30 p-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User size={18} className="text-sidebar-foreground" />
              </div>
            )}
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-sidebar ring-0" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
              {user.name}
            </p>
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md font-semibold mt-0.5 leading-none ${roleBadgeColor}`}>
              {user.role}
            </span>
          </div>
          <ModeToggle />
        </div>
      </div>

      {/* ── Section Label ─────────────────────────────────────── */}
      <div className="px-5 mb-1.5 mt-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/40">
          Navigation
        </span>
      </div>

      {/* ── Nav Items ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-150 group
                ${active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                }
              `}
            >
              {/* Icon container */}
              <span className={`
                flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-150
                ${active
                  ? 'bg-sidebar-primary-foreground/15'
                  : 'bg-sidebar-accent/60 group-hover:bg-sidebar-accent'
                }
              `}>
                <Icon size={15} />
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none">{item.name}</p>
                <p className={`text-[10px] mt-0.5 truncate leading-none ${active ? 'text-sidebar-primary-foreground/60' : 'text-sidebar-foreground/50'}`}>
                  {item.description}
                </p>
              </div>

              {item.name === 'Bin' && binCount > 0 && (
                <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md bg-sidebar-accent text-sidebar-foreground/70 leading-none shrink-0">
                  {binCount}
                </span>
              )}

              {active && (
                <ChevronRight size={13} className="shrink-0 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer / Logout ───────────────────────────────────── */}
      <div className="p-3 border-t border-sidebar-border/60 mt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-150 group"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-accent/60 group-hover:bg-destructive/15 transition-colors duration-150 shrink-0">
            <LogOut size={15} />
          </span>
          <span className="text-sm font-semibold">Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border/60 shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 bg-sidebar border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Briefcase size={15} />
            </div>
            <h1 className="font-bold text-sm text-sidebar-foreground tracking-tight">EMS Portal</h1>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm">
            <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl">
              <div className="h-14 flex items-center justify-between px-5 border-b border-sidebar-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Briefcase size={15} />
                  </div>
                  <span className="font-bold text-sm text-sidebar-foreground">EMS Portal</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </div>
            {/* Click-outside to close */}
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
