interface StatCardProps {
  title: string;
  value: number | string;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
      <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
    </div>
  );
}
