'use client';

import { useEffect, useState } from 'react';

interface AirQualityData {
  list: Array<{
    main: { aqi: number };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }>;
}

interface AirQualityProps {
  lat: number;
  lon: number;
}

const AQI_LEVELS = [
  { level: 1, label: 'Good', color: '#10b981', emoji: '😊', desc: 'Air quality is satisfactory.' },
  { level: 2, label: 'Fair', color: '#22d3ee', emoji: '🙂', desc: 'Acceptable quality.' },
  { level: 3, label: 'Moderate', color: '#f59e0b', emoji: '😐', desc: 'Sensitive groups may be affected.' },
  { level: 4, label: 'Poor', color: '#f97316', emoji: '😷', desc: 'Health effects for everyone.' },
  { level: 5, label: 'Very Poor', color: '#f43f5e', emoji: '🤢', desc: 'Serious health risk.' },
];

export default function AirQuality({ lat, lon }: AirQualityProps) {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAQI() {
      setLoading(true);
      try {
        const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
        const json = await res.json();
        if (!json.error) {
          setData(json);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchAQI();
  }, [lat, lon]);

  if (loading) {
    return (
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 className="section-title">🌬️ Air Quality Index</h2>
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!data || !data.list || data.list.length === 0) return null;

  const aqiValue = data.list[0].main.aqi;
  const components = data.list[0].components;
  const level = AQI_LEVELS[aqiValue - 1] || AQI_LEVELS[0];

  const pollutants = [
    { label: 'PM2.5', value: components.pm2_5, unit: 'μg/m³' },
    { label: 'PM10', value: components.pm10, unit: 'μg/m³' },
    { label: 'O₃', value: components.o3, unit: 'μg/m³' },
    { label: 'NO₂', value: components.no2, unit: 'μg/m³' },
    { label: 'SO₂', value: components.so2, unit: 'μg/m³' },
    { label: 'CO', value: components.co, unit: 'μg/m³' },
  ];

  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2 className="section-title">🌬️ Air Quality Index</h2>
      <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
        <div className="aqi-header">
          <div className="aqi-gauge" style={{ borderColor: level.color }}>
            <span className="aqi-emoji">{level.emoji}</span>
            <span className="aqi-value" style={{ color: level.color }}>{aqiValue}</span>
          </div>
          <div className="aqi-info">
            <div className="aqi-label" style={{ color: level.color }}>{level.label}</div>
            <div className="aqi-desc">{level.desc}</div>
          </div>
        </div>

        <div className="aqi-bar-container">
          {AQI_LEVELS.map((l) => (
            <div
              key={l.level}
              className={`aqi-bar-segment ${aqiValue === l.level ? 'active' : ''}`}
              style={{ background: l.color, opacity: aqiValue >= l.level ? 1 : 0.2 }}
            />
          ))}
        </div>

        <div className="pollutants-grid">
          {pollutants.map((p) => (
            <div key={p.label} className="pollutant-item">
              <span className="pollutant-label">{p.label}</span>
              <span className="pollutant-value">{p.value.toFixed(1)}</span>
              <span className="pollutant-unit">{p.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
