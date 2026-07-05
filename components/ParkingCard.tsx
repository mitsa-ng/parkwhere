'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ParkingRecord } from '@/lib/types';
import Timer from './Timer';

const MiniMap = dynamic(() => import('./MapView'), { ssr: false });

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = d.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
  });
  return isToday ? `今天 ${time}` : `${date} ${time}`;
}

export default function ParkingCard({ record }: { record: ParkingRecord }) {
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${record.lat},${record.lng}`;

  return (
    <Link
      href={`/record/${record.id}`}
      className="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="h-36 w-full overflow-hidden bg-gray-100">
        <MiniMap
          center={[record.lat, record.lng]}
          zoom={16}
          className="h-full w-full"
        />
      </div>
      <div className="space-y-1.5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatTime(record.createdAt)}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            record.stoppedAt
              ? 'bg-green-50 text-green-700'
              : 'bg-amber-50 text-amber-700'
          }`}>
            {record.stoppedAt ? (
              <><Timer createdAt={record.createdAt} stoppedAt={record.stoppedAt} /> · 已結束</>
            ) : (
              <Timer createdAt={record.createdAt} />
            )}
          </span>
        </div>
        <p className="line-clamp-1 text-sm text-gray-700">
          {record.address || '未知地址'}
        </p>
        {(record.floor || record.spot) && (
          <p className="line-clamp-1 text-xs text-gray-500">
            {[record.floor, record.spot].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
            詳細資訊 →
          </span>
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            onClick={(e) => e.stopPropagation()}
          >
            🧭 導航
          </a>
        </div>
      </div>
    </Link>
  );
}
