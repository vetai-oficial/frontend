import { Suspense } from 'react';

import { TutorDetailContent } from './components/tutor-detail-content';

export default function TutorDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" /></div>}>
      <TutorDetailContent />
    </Suspense>
  );
}
