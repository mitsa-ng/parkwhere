export interface ParkingRecord {
  id: string;
  lat: number;
  lng: number;
  address: string;
  floor?: string;
  spot?: string;
  note?: string;
  createdAt: string;
  stoppedAt?: string;
}
