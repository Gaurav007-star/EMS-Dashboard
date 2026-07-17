import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,

  Users,
  GitFork,
  Shield,
} from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../components/ui/input-group';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const FEATURES = [
  { icon: Users, label: 'Employee Directory', desc: 'Full profile & CRUD management' },
  { icon: GitFork, label: 'Org Hierarchy', desc: 'Visual reporting tree' },
  { icon: Shield, label: 'Role-based Access', desc: 'Admin, HR & Employee tiers' },
];

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'Employee') navigate(`/employees/${user.id}`);
      else navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identity.trim() || !password.trim()) {
      setError('Please enter both your credentials and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(identity, password);
    } catch (err: any) {
      setError(err || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">

      {/* ── Left Panel (branded) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col bg-sidebar border-r border-sidebar-border shrink-0 relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--sidebar-foreground) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Brand mark */}
        <div className="relative z-10 p-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30">
              <Briefcase size={19} />
            </div>
            <div className="leading-none">
              <h1 className="text-[15px] font-bold text-sidebar-foreground tracking-tight">EMS Portal</h1>
              <p className="text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-widest mt-0.5">
                Management Suite
              </p>
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sidebar-primary mb-3">
            Employee Management System
          </p>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-sidebar-foreground leading-tight tracking-tight">
            Everything you need to manage your team.
          </h2>
          <p className="mt-4 text-sm text-sidebar-foreground/60 leading-relaxed max-w-xs">
            A unified platform for HR teams to manage employees, org structure, salaries, and access control.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-accent border border-sidebar-border shrink-0">
                  <Icon size={14} className="text-sidebar-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-sidebar-foreground leading-none">{label}</p>
                  <p className="text-[11px] text-sidebar-foreground/50 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom label */}
        <div className="relative z-10 px-8 pb-6">
          <p className="text-[10px] text-sidebar-foreground/30 font-medium">
            © {new Date().getFullYear()} EMS Portal · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right Panel (form) ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 overflow-y-auto bg-background">
        <div className="w-full max-w-sm">

          {/* Mobile-only brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar text-sidebar-foreground border border-sidebar-border">
              <Briefcase size={16} />
            </div>
            <span className="font-bold text-foreground text-sm tracking-tight">EMS Portal</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-destructive/8 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-start gap-2.5 text-sm">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identity" className="text-xs font-semibold text-foreground">
                Email or Employee ID
              </Label>
              <InputGroup>
                <InputGroupAddon><Mail /></InputGroupAddon>
                <InputGroupInput
                  id="identity"
                  type="text"
                  required
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="admin123 or john@ems.com"
                />
              </InputGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <InputGroup>
                <InputGroupAddon><Lock /></InputGroupAddon>
                <InputGroupInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <InputGroupAddon
                  align="inline-end"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowPassword(!showPassword)}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && setShowPassword(!showPassword)}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupAddon>
              </InputGroup>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </Button>
          </form>

          {/* Quick credentials helper */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-3 text-center">
              Seeded Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Super Admin', id: 'admin123', pwd: 'admin123' },
                { role: 'HR Manager',  id: 'hr123',    pwd: 'hr123'    },
              ].map(({ role, id, pwd }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setIdentity(id); setPassword(pwd); }}
                  className="text-left bg-muted/40 hover:bg-muted/70 border border-border hover:border-foreground/20 p-2.5 rounded-xl transition-all duration-150 group"
                >
                  <span className="block text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">{role}</span>
                  <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">{id} / {pwd}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
