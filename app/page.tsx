'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRecords } from '@/lib/storage';
import type { ParkingRecord } from '@/lib/types';
import Header from '@/components/Header';
import ParkingCard from '@/components/ParkingCard';
import EmptyState from '@/components/EmptyState';

export default function HomePage() {
  const [records, setRecords] = useState<ParkingRecord[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setRecords(getRecords()));
    const handler = () => setRecords(getRecords());
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);

  return (
    <>
      <Header count={records.length} />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
        {records.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {records.map((r) => (
              <ParkingCard key={r.id} record={r} />
            ))}
          </div>
        )}
      </main>
      {records.length > 0 && (
        <div className="sticky bottom-6 flex justify-center px-4">
          <Link
            href="/park"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
          >
            📍 記錄新的停車位置
          </Link>
        </div>
      )}
    </>
  );
}
