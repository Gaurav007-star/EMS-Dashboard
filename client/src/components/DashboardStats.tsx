import React from 'react';
import { Users, UserCheck, UserX, Landmark } from 'lucide-react';
import { Card } from './ui/card';

interface StatsData {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
}

interface DashboardStatsProps {
  stats: StatsData;
  loading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  const activePercent = stats.totalEmployees > 0
    ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
    : 0;

  const cards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      description: 'Complete headcount across every department',
      icon: Users,
      color: 'var(--chart-1)',
      bgTint: 'color-mix(in oklch, var(--chart-1) 6%, transparent)',
    },
    {
      title: 'Active',
      value: stats.activeEmployees,
      description: `Currently on payroll`,
      icon: UserCheck,
      color: 'oklch(0.62 0.19 146)',
      bgTint: 'color-mix(in oklch, oklch(0.62 0.19 146) 6%, transparent)',
      badge: `${activePercent}%`,
    },
    {
      title: 'Inactive',
      value: stats.inactiveEmployees,
      description: 'Off roster',
      icon: UserX,
      color: 'var(--chart-5)',
      bgTint: 'color-mix(in oklch, var(--chart-5) 6%, transparent)',
    },
    {
      title: 'Departments',
      value: stats.departmentCount,
      description: 'Distinct business units',
      icon: Landmark,
      color: 'var(--chart-4)',
      bgTint: 'color-mix(in oklch, var(--chart-4) 6%, transparent)',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
              <div className="h-10 w-10 bg-muted rounded-xl" />
            </div>
            <div className="h-2.5 w-full bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="p-5 hover:shadow-md transition-all duration-200 border border-border/60"
            style={{ background: card.bgTint }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `color-mix(in oklch, ${card.color} 14%, var(--card))`,
                  color: card.color,
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-foreground leading-none">
                {card.value.toLocaleString()}
              </p>
              {card.badge && (
                <span
                  className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${card.color} 14%, var(--card))`,
                    color: card.color,
                  }}
                >
                  {card.badge}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {card.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
};
