import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { DashboardStats } from '../components/DashboardStats';
import { DashboardCharts } from '../components/DashboardCharts';
import {
  Users,
  ArrowRight,
  Calendar,
  ChevronRight,
} from 'lucide-react';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
}

interface RecentEmployee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  joiningDate: string;
  profileImage: string;
}

// Generates a deterministic muted avatar bg from a name
function avatarInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    departmentCount: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState<RecentEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsRes = await api.get('/employees/stats');
        if (statsRes.data.success) setStats(statsRes.data.stats);

        const listRes = await api.get('/employees?sortBy=joiningDate&sortOrder=desc');
        if (listRes.data.success)
          setRecentEmployees(listRes.data.employees.slice(0, 6));
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">

      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back — here's what's happening across your organization.
          </p>
        </div>

      </div>

      {/* ─── Stat Cards ─── */}
      <DashboardStats stats={stats} loading={loading} />

      {/* ─── Charts Row ─── */}
      <DashboardCharts stats={stats} loading={loading} />

      {/* ─── Recent Hires ─── */}
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Hires</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last {recentEmployees.length} onboarded employees
            </p>
          </div>
          <Link
            to="/employees"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-32" />
                  <div className="h-2.5 bg-muted rounded w-20" />
                </div>
                <div className="h-5 bg-muted rounded-full w-20" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        ) : recentEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No employees yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start by adding your first employee.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentEmployees.map((emp, i) => (
              <div
                key={emp._id}
                onClick={() => navigate(`/employees/${emp._id}`)}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors duration-100 group"
              >
                {/* Avatar */}
                {emp.profileImage ? (
                  <img
                    src={emp.profileImage}
                    alt={emp.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                    style={{
                      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    }}
                  >
                    {avatarInitials(emp.name)}
                  </div>
                )}

                {/* Name + title */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {emp.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{emp.designation}</p>
                </div>

                {/* Department badge */}
                <span
                  className="hidden sm:inline-flex shrink-0 items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
                  style={{
                    background: 'var(--muted)',
                    color: 'var(--muted-foreground)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {emp.department}
                </span>

                {/* Joining Date */}
                <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 w-24">
                  <Calendar size={12} strokeWidth={1.8} />
                  {new Date(emp.joiningDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={14}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
