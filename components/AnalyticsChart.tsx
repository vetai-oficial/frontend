'use client';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Loader2 } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import { SectionCard } from '@/app/components/data/section-card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  ArcElement,
);

interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  subtitle?: string;
  data: ChartData<any>;
  height?: number | string;
  loading?: boolean;
  className?: string;
}

export function AnalyticsChart({
  type,
  title,
  subtitle,
  data,
  height = 300,
  loading = false,
  className,
}: AnalyticsChartProps) {
  const commonOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#64748b', // slate-500
          font: { size: 12 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales:
      type === 'doughnut'
        ? undefined
        : {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' },
          },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { color: '#64748b' },
            beginAtZero: true,
          },
        },
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div
          className='flex items-center justify-center w-full'
          style={{ height }}
        >
          <Loader2 className='h-8 w-8 animate-spin text-teal-600' />
        </div>
      );
    }

    switch (type) {
    case 'line':
      return <Line data={data} options={commonOptions} height={height} />;
    case 'bar':
      return <Bar data={data} options={commonOptions} height={height} />;
    case 'doughnut':
      return <Doughnut data={data} options={commonOptions} height={height} />;
    default:
      return null;
    }
  };

  return (
    <SectionCard title={title} {...(subtitle ? { subtitle } : {})} {...(className ? { className } : {})}>
      <div className='w-full mt-4' style={{ height }}>
        {renderChart()}
      </div>
    </SectionCard>
  );
}
