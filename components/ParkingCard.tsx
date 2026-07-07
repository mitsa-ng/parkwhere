'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronRight, Navigation } from 'lucide-react';
import type { ParkingRecord } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';

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
    <Card className="gap-0 py-0 transition-shadow hover:shadow-md">
      <Link href={`/record/${record.id}`} className="block">
        <div className="h-36 w-full overflow-hidden bg-muted">
          <MiniMap
            center={[record.lat, record.lng]}
            zoom={16}
            interactive={false}
            className="h-full w-full"
          />
        </div>
        <div className="space-y-1.5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatTime(record.createdAt)}
            </span>
            <StatusBadge
              createdAt={record.createdAt}
              stoppedAt={record.stoppedAt}
            />
          </div>
          <p className="line-clamp-1 text-sm font-medium">
            {record.address || '未知地址'}
          </p>
          {(record.floor || record.spot) && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {[record.floor, record.spot].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </Link>
      <CardFooter className="justify-between px-2.5 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          nativeButton={false}
          render={<Link href={`/record/${record.id}`} />}
        >
          詳細資訊
          <ChevronRight />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          nativeButton={false}
          render={
            <a href={navUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          <Navigation />
          導航
        </Button>
      </CardFooter>
    </Card>
  );
}
