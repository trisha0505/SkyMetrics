'use client';

import { formatTemp } from '@/lib/utils';
import { getWeatherEmoji } from '@/lib/weather-icons';

interface ForecastItem {
  dt: number;
  main: { temp: number; humidity: number; feels_like: number };
  weather: Array<{ id: number; description: string; icon: string }>;
  wind: { speed: number };
  pop: number;
}

interface HourlyForecastProps {
  forecastData: { list: ForecastItem[] };
  unit: 'metric' | 'imperial';
}

export default function HourlyForecast({ forecastData, unit }: HourlyForecastProps) {
  // Show first 8 entries (24 hours in 3-hour intervals)
  const hourlyItems = forecastData.list.slice(0, 8);
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2 className="section-title">⏰ Hourly Forecast</h2>
      <div className="forecast-scroll">
        {hourlyItems.map((item, index) => {
          const date = new Date(item.dt * 1000);
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          const emoji = getWeatherEmoji(item.weather[0].id, item.weather[0].icon);
          const rainChance = Math.round((item.pop || 0) * 100);

          return (
            <div
              key={item.dt}
              className="hourly-card glass-card"
              style={{
                animationDelay: `${index * 60}ms`,
                animation: 'fadeSlideIn 400ms ease-out backwards',
              }}
            >
              <div className="hourly-time">{index === 0 ? 'Now' : timeStr}</div>
              <span className="hourly-icon">{emoji}</span>
              <div className="hourly-temp">{formatTemp(item.main.temp, unit)}</div>
              {rainChance > 0 && (
                <div className="hourly-rain">💧 {rainChance}%</div>
              )}
              <div className="hourly-wind">💨 {item.wind.speed} {windUnit}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
