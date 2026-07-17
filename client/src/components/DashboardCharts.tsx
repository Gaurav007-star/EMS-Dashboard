import React from 'react';
import { Pie, PieChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from './ui/chart';
import { Card } from './ui/card';

interface StatsData {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
}

interface DashboardChartsProps {
  stats: StatsData;
  loading: boolean;
}

const statusChartConfig = {
  active: {
    label: 'Active',
    color: 'oklch(0.62 0.19 146)',
  },
  inactive: {
    label: 'Inactive',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

const overviewChartConfig = {
  total: {
    label: 'Total',
    color: 'var(--chart-1)',
  },
  active: {
    label: 'Active',
    color: 'oklch(0.62 0.19 146)',
  },
  inactive: {
    label: 'Inactive',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig;

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats, loading }) => {
  const pieData = [
    { name: 'Active', value: stats.activeEmployees, fill: 'var(--color-active)' },
    { name: 'Inactive', value: stats.inactiveEmployees, fill: 'var(--color-inactive)' },
  ];

  const barData = [
    { label: 'Total', total: stats.totalEmployees },
    { label: 'Active', active: stats.activeEmployees },
    { label: 'Inactive', inactive: stats.inactiveEmployees },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded mb-4" />
          <div className="h-[200px] bg-muted/50 rounded" />
        </Card>
        <Card className="p-5 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded mb-4" />
          <div className="h-[200px] bg-muted/50 rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
      {/* Donut Chart — Status Split */}
      <Card className="p-5 border border-border/60 flex flex-col">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Workforce Status</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Active vs inactive breakdown</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ChartContainer config={statusChartConfig} className="h-[220px] w-full max-w-[300px]">
            <PieChart accessibilityLayer>
              <ChartTooltip
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                strokeWidth={2}
                stroke="var(--background)"
              />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </div>
      </Card>

      {/* Bar Chart — Overview */}
      <Card className="p-5 border border-border/60 flex flex-col">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Headcount Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Employee counts at a glance</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ChartContainer config={overviewChartConfig} className="h-[220px] w-full">
            <BarChart accessibilityLayer data={barData}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="active" fill="var(--color-active)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inactive" fill="var(--color-inactive)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};
