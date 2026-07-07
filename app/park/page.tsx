'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Check, MapPin } from 'lucide-react';
import { addRecord } from '@/lib/storage';
import type { ParkingRecord } from '@/lib/types';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=zh`,
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

function getLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('瀏覽器不支援定位'));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export default function ParkPage() {
  const router = useRouter();
  const [step, setStep] = useState<'locating' | 'ready' | 'saving'>('locating');
  const [lat, setLat] = useState(25.034);
  const [lng, setLng] = useState(121.564);
  const [address, setAddress] = useState('');
  const [floor, setFloor] = useState('');
  const [spot, setSpot] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function locate(onCancelled?: () => boolean) {
    setStep('locating');
    setError('');
    getLocation()
      .then(async (pos) => {
        if (onCancelled?.()) return;
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        const addr = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        if (onCancelled?.()) return;
        setAddress(addr);
        setStep('ready');
      })
      .catch(() => {
        if (onCancelled?.()) return;
        setError('無法取得位置，請確認已開啟定位權限');
        setStep('ready');
      });
  }

  useEffect(() => {
    let cancelled = false;
    locate(() => cancelled);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePositionChange(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
    const addr = await reverseGeocode(newLat, newLng);
    setAddress(addr);
  }

  function handleSave() {
    if (step === 'saving') return;
    setStep('saving');

    const record: ParkingRecord = {
      id: crypto.randomUUID(),
      lat,
      lng,
      address,
      floor: floor || undefined,
      spot: spot || undefined,
      note: note || undefined,
      createdAt: new Date().toISOString(),
    };

    addRecord(record);
    router.push('/');
  }

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
        <h1 className="font-heading text-base font-semibold">記錄停車位置</h1>
      </header>

      <div className="relative flex-1">
        <div className="absolute inset-0">
          <MapView
            center={[lat, lng]}
            marker={[lat, lng]}
            zoom={17}
            draggable
            onMove={handlePositionChange}
            className="h-full w-full"
          />
        </div>

        {step === 'locating' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-xs">
            <div className="flex items-center gap-2.5 rounded-xl bg-card px-5 py-3.5 text-sm text-muted-foreground shadow-lg ring-1 ring-foreground/10">
              <Spinner className="text-primary" />
              正在定位中…
            </div>
          </div>
        )}

        {error && (
          <Alert
            variant="destructive"
            className="absolute inset-x-3 top-3 z-10 shadow-lg"
          >
            <AlertCircle />
            <AlertTitle>定位失敗</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <AlertAction>
              <Button variant="outline" size="xs" onClick={() => locate()}>
                重新定位
              </Button>
            </AlertAction>
          </Alert>
        )}
      </div>

      <div className="space-y-3 border-t bg-background px-4 py-4">
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span className="line-clamp-2">
            {address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
          </span>
        </p>

        <div className="flex gap-2">
          <Input
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="樓層 (選填)"
            className="h-10 w-1/2"
          />
          <Input
            value={spot}
            onChange={(e) => setSpot(e.target.value)}
            placeholder="車位號碼 (選填)"
            className="h-10 w-1/2"
          />
        </div>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="備註 (選填，例如：靠近電梯)"
          className="h-10"
        />

        <Button
          onClick={handleSave}
          disabled={step === 'saving'}
          className="h-12 w-full text-base shadow-lg shadow-primary/25"
        >
          {step === 'saving' ? (
            <>
              <Spinner />
              儲存中…
            </>
          ) : (
            <>
              <Check />
              儲存停車位置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
