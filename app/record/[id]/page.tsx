'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  CircleStop,
  Clock,
  MapPin,
  Navigation,
  SearchX,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { getRecord, stopTimer, deleteRecord } from '@/lib/storage';
import type { ParkingRecord } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
    setDeleting(true);
    deleteRecord(id);
    router.push('/');
  }

  if (!record) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <SearchX className="size-7" />
        </div>
        <p className="text-sm text-muted-foreground">記錄不存在</p>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft />
          回到首頁
        </Button>
      </div>
    );
  }

  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${record.lat},${record.lng}`;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="flex items-center gap-1.5 border-b bg-background px-3 py-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/" />}
        >
          <ArrowLeft />
          <span className="sr-only">返回</span>
        </Button>
        <h1 className="font-heading text-base font-semibold">停車記錄</h1>
      </header>

      <div className="h-64 w-full overflow-hidden bg-muted">
        <DetailMap
          center={[record.lat, record.lng]}
          zoom={17}
          className="h-full w-full"
        />
      </div>

      <div className="flex-1 space-y-4 px-4 py-4">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">地址</p>
                <p className="text-sm font-medium">
                  {record.address || '未知地址'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">停車時間</p>
                  <p className="text-sm font-medium">
                    {formatTime(record.createdAt)}
                  </p>
                </div>
                <StatusBadge
                  className="shrink-0"
                  createdAt={record.createdAt}
                  stoppedAt={record.stoppedAt}
                />
              </div>
            </div>

            {(record.floor || record.spot) && (
              <>
                <Separator />
                <div className="flex items-start gap-2.5">
                  <Navigation className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">位置</p>
                    <p className="text-sm font-medium">
                      {[record.floor, record.spot].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              </>
            )}

            {record.note && (
              <>
                <Separator />
                <div className="flex items-start gap-2.5">
                  <StickyNote className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">備註</p>
                    <p className="text-sm font-medium">{record.note}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2.5 pt-1">
          <Button
            className="h-12 w-full text-base shadow-lg shadow-primary/25"
            nativeButton={false}
            render={
              <a href={navUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            <Navigation />
            開啟導航
          </Button>

          {!record.stoppedAt && (
            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={handleStop}
            >
              <CircleStop />
              停止計時 (找到車了)
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  className="h-11 w-full"
                  disabled={deleting}
                />
              }
            >
              <Trash2 />
              {deleting ? '刪除中…' : '刪除此記錄'}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                  <Trash2 />
                </AlertDialogMedia>
                <AlertDialogTitle>確定要刪除此筆記錄？</AlertDialogTitle>
                <AlertDialogDescription>
                  刪除後將無法復原這筆停車記錄。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  刪除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
