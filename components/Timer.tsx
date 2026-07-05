'use client';

import { useState, useEffect } from 'react';

function formatElapsed(ms: number): string {
  if (ms < 0) return '--';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h} 小時 ${m} 分鐘`;
  if (m > 0) return `${m} 分鐘 ${s} 秒`;
  return `${s} 秒`;
}

export default function Timer({
  createdAt,
  stoppedAt,
}: {
  createdAt: string;
  stoppedAt?: string;
}) {
  const [text, setText] = useState('');

  useEffect(() => {
    const end = stoppedAt ? new Date(stoppedAt).getTime() : Date.now();
    function tick() {
      setText(formatElapsed(end - new Date(createdAt).getTime()));
    }
    tick();
    if (stoppedAt) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [createdAt, stoppedAt]);

  return <span>{text || '計算中…'}</span>;
}
