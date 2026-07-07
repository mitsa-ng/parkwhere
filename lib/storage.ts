import type { ParkingRecord } from './types';

const STORAGE_KEY = 'parkwhere-records';

export function getRecords(): ParkingRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveRecords(records: ParkingRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  // storage 事件只會在其他分頁觸發，同分頁用自訂事件通知
  window.dispatchEvent(new Event('parkwhere:changed'));
}

export function clearRecords(): void {
  saveRecords([]);
}

export function addRecord(record: ParkingRecord): void {
  const records = getRecords();
  records.push(record);
  saveRecords(records);
}

export function stopTimer(id: string): void {
  const records = getRecords().map((r) =>
    r.id === id && !r.stoppedAt
      ? { ...r, stoppedAt: new Date().toISOString() }
      : r,
  );
  saveRecords(records);
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter((r) => r.id !== id);
  saveRecords(records);
}

export function getRecord(id: string): ParkingRecord | undefined {
  return getRecords().find((r) => r.id === id);
}
