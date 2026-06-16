'use client';

import { formatTemp, formatTime } from '@/lib/utils';
import { getWeatherEmoji } from '@/lib/weather-icons';

interface WeatherData {
  sys: { sunrise: number; sunset: number };
  main: { humidity: number; pressure: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  timezone: number;
}

interface WeatherStatsProps {
  data: WeatherData;
  unit: 'metric' | 'imperial';
}

export default function WeatherStats({ data, unit }: WeatherStatsProps) {
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';
  const visibilityKm = (data.visibility / 1000).toFixed(1);

  const stats = [
    {
      icon: '🌅',
      label: 'Sunrise',
      value: formatTime(data.sys.sunrise, data.timezone),
      sub: 'Local time',
    },
    {
      icon: '🌇',
      label: 'Sunset',
      value: formatTime(data.sys.sunset, data.timezone),
      sub: 'Local time',
    },
    {
      icon: '💧',
      label: 'Humidity',
      value: `${data.main.humidity}%`,
      sub: data.main.humidity > 70 ? 'High moisture' : data.main.humidity < 30 ? 'Very dry' : 'Comfortable',
    },
    {
      icon: '📊',
      label: 'Pressure',
      value: `${data.main.pressure}`,
      sub: 'hPa',
    },
    {
      icon: '👁️',
      label: 'Visibility',
      value: `${visibilityKm} km`,
      sub: Number(visibilityKm) > 8 ? 'Clear view' : Number(visibilityKm) > 4 ? 'Moderate' : 'Poor visibility',
    },
    {
      icon: '💨',
      label: 'Wind Gust',
      value: data.wind.gust ? `${data.wind.gust} ${windUnit}` : 'N/A',
      sub: data.wind.gust && data.wind.gust > 15 ? 'Strong gusts' : 'Calm',
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="stat-card glass-card"
          style={{ animationDelay: `${index * 60}ms`, animation: 'fadeSlideIn 400ms ease-out backwards' }}
        >
          <div className="stat-card-icon">{stat.icon}</div>
          <div className="stat-card-label">{stat.label}</div>
          <div className="stat-card-value">{stat.value}</div>
          <div className="stat-card-sub">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
