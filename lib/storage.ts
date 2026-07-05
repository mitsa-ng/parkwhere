import type { ParkingRecord } from './types';

const STORAGE_KEY = 'parkwhere-records';

export function getRecords(): ParkingRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveRecords(records: ParkingRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(record: ParkingRecord): void {
  const records = getRecords();
  records.push(record);
  saveRecords(records);
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter((r) => r.id !== id);
  saveRecords(records);
}

export function getRecord(id: string): ParkingRecord | undefined {
  return getRecords().find((r) => r.id === id);
}
