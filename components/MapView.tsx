'use client';

import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function LocationMarker({
  marker,
  draggable,
  onMove,
}: {
  marker: [number, number];
  draggable?: boolean;
  onMove?: (lat: number, lng: number) => void;
}) {
  useMapEvents(
    draggable
      ? {
          click(e) {
            onMove?.(e.latlng.lat, e.latlng.lng);
          },
        }
      : {},
  );

  const map = useMap();
  useEffect(() => {
    map.flyTo(marker, map.getZoom());
  }, [map, marker]);

  return draggable ? (
    <Marker
      position={marker}
      draggable
      eventHandlers={{
        dragend(e) {
          const pos = e.target.getLatLng();
          onMove?.(pos.lat, pos.lng);
        },
      }}
    />
  ) : (
    <Marker position={marker} />
  );
}

interface MapViewProps {
  center: [number, number];
  marker?: [number, number];
  zoom?: number;
  className?: string;
  draggable?: boolean;
  onMove?: (lat: number, lng: number) => void;
}

export default function MapView({
  center,
  marker,
  zoom = 16,
  className = '',
  draggable = false,
  onMove,
}: MapViewProps) {
  const pos = marker ?? center;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`z-0 ${className}`}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker marker={pos} draggable={draggable} onMove={onMove} />
    </MapContainer>
  );
}
