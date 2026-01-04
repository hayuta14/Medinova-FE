'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeavesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/approve-requests');
  }, [router]);

  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Redirecting...</span>
      </div>
      <p className="mt-3">Redirecting to Approve Requests...</p>
    </div>
  );
}

