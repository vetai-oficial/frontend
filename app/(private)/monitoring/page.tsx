import { Header } from '@/app/components/header';

export default function Monitoring() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <Header title="Monitoramento" showStorage={false} />
      </div>
    </div>
  );
}
