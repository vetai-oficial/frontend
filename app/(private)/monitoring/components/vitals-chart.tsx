'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import {
  type VitalDefinition,
  evaluateVital,
  getVitalRange,
} from '@/constants';
import type { VitalRecord } from '@/types/monitoring';
import type { Specie } from '@/types/patient';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

interface VitalsChartProps {
  specie: Specie;
  definition: VitalDefinition;
  records: VitalRecord[];
}

function formatLabel(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function VitalsChart({ specie, definition, records }: VitalsChartProps) {
  const points = records.filter(
    (r) => r[definition.key] !== undefined && r[definition.key] !== null,
  );

  if (points.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {definition.label}
          </h4>
          <span className="text-xs text-slate-400">{definition.unit}</span>
        </div>
        <div className="flex items-center justify-center h-40 text-xs text-slate-400 dark:text-slate-500">
          Sem registros para este parâmetro
        </div>
      </div>
    );
  }

  const range = getVitalRange(specie, definition.key);
  const labels = points.map((r) => formatLabel(r.measured_at));
  const values = points.map((r) => r[definition.key] as number);

  const pointColors = points.map((r) => {
    const evaluation = evaluateVital(specie, definition.key, r[definition.key]);
    return evaluation === 'high' || evaluation === 'low'
      ? '#ef4444'
      : definition.color;
  });

  const datasets: ChartData<'line'>['datasets'] = [
    {
      label: definition.label,
      data: values,
      borderColor: definition.color,
      backgroundColor: `${definition.color}22`,
      pointBackgroundColor: pointColors,
      pointBorderColor: pointColors,
      pointRadius: 4,
      tension: 0.3,
      fill: true,
    },
  ];

  if (range) {
    datasets.push(
      {
        label: 'Mínimo',
        data: labels.map(() => range.min),
        borderColor: '#94a3b8',
        borderDash: [6, 6],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Máximo',
        data: labels.map(() => range.max),
        borderColor: '#94a3b8',
        borderDash: [6, 6],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
    );
  }

  const data: ChartData<'line'> = { labels, datasets };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true, font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {definition.label}
        </h4>
        <span className="text-xs text-slate-400">
          {range ? `${range.min}–${range.max} ${definition.unit}` : definition.unit}
        </span>
      </div>
      <div className="h-40">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
