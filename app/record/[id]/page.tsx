'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getRecord, stopTimer, deleteRecord } from '@/lib/storage';
import type { ParkingRecord } from '@/lib/types';
import Timer from '@/components/Timer';

const DetailMap = dynamic(() => import('@/components/MapView'), { ssr: false });

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [record, setRecord] = useState<ParkingRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecord(getRecord(id) ?? null);
    }, 0);
    return () => clearTimeout(timer);
  }, [id]);

  function handleStop() {
    stopTimer(id);
    setRecord(getRecord(id) ?? null);
  }

  function handleDelete() {
    if (!confirm('確定要刪除此筆記錄？')) return;
    setDeleting(true);
    deleteRecord(id);
    router.push('/');
  }

  if (!record) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-gray-500">記錄不存在</p>
      </div>
    );
  }

  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${record.lat},${record.lng}`;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <Link
          href="/"
          className="text-lg leading-none text-gray-500 hover:text-gray-700"
        >
          ←
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">停車記錄</h1>
      </header>

      <div className="h-64 w-full overflow-hidden bg-gray-100">
        <DetailMap
          center={[record.lat, record.lng]}
          zoom={17}
          className="h-full w-full"
        />
      </div>

      <div className="space-y-5 px-4 py-5">
        <div>
          <p className="text-sm text-gray-500">地址</p>
          <p className="text-base text-gray-800">
            {record.address || '未知地址'}
          </p>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-sm text-gray-500">停車時間</p>
            <p className="text-sm text-gray-800">
              {formatTime(record.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">已停</p>
            <p
              className={`text-sm font-semibold ${
                record.stoppedAt ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              <Timer
                createdAt={record.createdAt}
                stoppedAt={record.stoppedAt}
              />
            </p>
          </div>
        </div>

        {(record.floor || record.spot) && (
          <div>
            <p className="text-sm text-gray-500">位置</p>
            <p className="text-sm text-gray-800">
              {[record.floor, record.spot].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}

        {record.note && (
          <div>
            <p className="text-sm text-gray-500">備註</p>
            <p className="text-sm text-gray-800">{record.note}</p>
          </div>
        )}

        <div className="space-y-3 pt-4">
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            🧭 開啟導航
          </a>

          {!record.stoppedAt && (
            <button
              onClick={handleStop}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-3 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.98]"
            >
              ⏹️ 停止計時 (找到車了)
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] disabled:opacity-60"
          >
            {deleting ? '刪除中…' : '🗑️ 刪除此記錄'}
          </button>
        </div>
      </div>
    </div>
  );
}
