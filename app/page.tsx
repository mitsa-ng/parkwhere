'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleDot, MapPin } from 'lucide-react';
import { getRecords } from '@/lib/storage';
import type { ParkingRecord } from '@/lib/types';
import Header from '@/components/Header';
import ParkingCard from '@/components/ParkingCard';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Filter = 'all' | 'active' | 'stopped';

export default function HomePage() {
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const timer = setTimeout(() => setRecords(getRecords()));
    const handler = () => setRecords(getRecords());
    window.addEventListener('storage', handler);
    window.addEventListener('focus', handler);
    window.addEventListener('parkwhere:changed', handler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handler);
      window.removeEventListener('focus', handler);
      window.removeEventListener('parkwhere:changed', handler);
    };
  }, []);

  const activeCount = records.filter((r) => !r.stoppedAt).length;

  const visible = useMemo(() => {
    const filtered = records.filter((r) =>
      filter === 'all' ? true : filter === 'active' ? !r.stoppedAt : !!r.stoppedAt,
    );
    // 停車中優先，其餘依時間新到舊
    return [...filtered].sort(
      (a, b) =>
        (a.stoppedAt ? 1 : 0) - (b.stoppedAt ? 1 : 0) ||
        b.createdAt.localeCompare(a.createdAt),
    );
  }, [records, filter]);

  return (
    <>
      <Header count={records.length} />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-4 pb-28">
        {records.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList className="w-full">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="active">
                  <CircleDot />
                  停車中
                  {activeCount > 0 && (
                    <Badge className="px-1.5">{activeCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="stopped">
                  <CircleCheck />
                  已結束
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {visible.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                {filter === 'active'
                  ? '目前沒有停車中的記錄'
                  : '還沒有已結束的記錄'}
              </p>
            ) : (
              visible.map((r) => <ParkingCard key={r.id} record={r} />)
            )}
          </div>
        )}
      </main>
      {records.length > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
          <Button
            className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/25"
            nativeButton={false}
            render={<Link href="/park" />}
          >
            <MapPin />
            記錄新的停車位置
          </Button>
        </div>
      )}
    </>
  );
}
