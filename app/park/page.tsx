'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { addRecord } from '@/lib/storage';
import type { ParkingRecord } from '@/lib/types';

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

  useEffect(() => {
    let cancelled = false;
    getLocation()
      .then(async (pos) => {
        if (cancelled) return;
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        const addr = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        if (cancelled) return;
        setAddress(addr);
        setStep('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setError('無法取得位置，請確認已開啟定位權限');
        setStep('ready');
      });
    return () => {
      cancelled = true;
    };
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
      <header className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <Link
          href="/"
          className="text-lg leading-none text-gray-500 hover:text-gray-700"
        >
          ←
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">記錄停車位置</h1>
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
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <div className="rounded-xl bg-white px-6 py-4 shadow-lg">
              <p className="text-sm text-gray-600">正在定位中…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute left-3 right-3 top-3 z-10 rounded-xl bg-red-50 px-4 py-3 shadow">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => {
                setStep('locating');
                setError('');
                getLocation()
                  .then(async (pos) => {
                    setLat(pos.coords.latitude);
                    setLng(pos.coords.longitude);
                    const addr = await reverseGeocode(
                      pos.coords.latitude,
                      pos.coords.longitude,
                    );
                    setAddress(addr);
                    setStep('ready');
                  })
                  .catch(() => {
                    setError('無法取得位置，請確認已開啟定位權限');
                    setStep('ready');
                  });
              }}
              className="mt-1 text-xs font-medium text-red-600 underline"
            >
              重新定位
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-gray-200 bg-white px-4 py-4">
        <p className="line-clamp-2 text-xs text-gray-500">
          📍 {address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
        </p>

        <div className="flex gap-2">
          <input
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="樓層 (選填)"
            className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
          />
          <input
            value={spot}
            onChange={(e) => setSpot(e.target.value)}
            placeholder="車位號碼 (選填)"
            className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
          />
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="備註 (選填，例如：靠近電梯)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
        />

        <button
          onClick={handleSave}
          disabled={step === 'saving'}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
        >
          {step === 'saving' ? '儲存中…' : '✅ 儲存停車位置'}
        </button>
      </div>
    </div>
  );
}
