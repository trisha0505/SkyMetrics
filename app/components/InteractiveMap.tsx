'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Waypoint {
  name: string;
  lat: number;
  lon: number;
  temp?: number;
  weather_description?: string;
  weather_icon?: string;
  weather_id?: number;
}

interface InteractiveMapProps {
  waypoints: Waypoint[];
  unit: 'metric' | 'imperial';
}

export default function InteractiveMap({ waypoints, unit }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || waypoints.length === 0) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const latLngs: L.LatLngExpression[] = [];

    waypoints.forEach((wp, index) => {
      const isFirst = index === 0;
      const isLast = index === waypoints.length - 1;

      const markerColor = isFirst ? '#10b981' : isLast ? '#f43f5e' : '#38bdf8';
      const markerLabel = isFirst ? 'A' : isLast ? 'B' : `${index}`;

      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          background: ${markerColor};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          border: 3px solid rgba(255,255,255,0.3);
          box-shadow: 0 2px 12px ${markerColor}66;
        ">${markerLabel}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const tempStr = wp.temp !== undefined
        ? `${Math.round(wp.temp)}°${unit === 'metric' ? 'C' : 'F'}`
        : '';

      const marker = L.marker([wp.lat, wp.lon], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 140px;">
          <strong style="font-size: 14px;">${wp.name}</strong><br/>
          ${tempStr ? `<span style="font-size: 20px; font-weight: 700;">${tempStr}</span><br/>` : ''}
          ${wp.weather_description ? `<span style="text-transform: capitalize;">${wp.weather_description}</span>` : ''}
        </div>
      `);

      latLngs.push([wp.lat, wp.lon]);
    });

    // Draw route line
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#38bdf8',
        weight: 3,
        opacity: 0.7,
        dashArray: '8, 8',
      }).addTo(map);
    }

    // Fit bounds
    const group = L.latLngBounds(latLngs);
    map.fitBounds(group, { padding: [40, 40] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [waypoints, unit]);

  return (
    <div style={{ marginBottom: 'var(--space-2xl)' }}>
      <h2 className="section-title" style={{ maxWidth: 720, margin: '0 auto var(--space-lg)' }}>
        🗺️ Route Map
      </h2>
      <div
        ref={mapRef}
        className="glass-card-static"
        style={{
          height: '400px',
          maxWidth: '720px',
          margin: '0 auto',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}
