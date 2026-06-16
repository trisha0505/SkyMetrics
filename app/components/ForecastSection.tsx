'use client';

import { formatTemp, formatDay } from '@/lib/utils';
import { getWeatherEmoji } from '@/lib/weather-icons';

interface ForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
}

interface ForecastSectionProps {
  data: {
    list: ForecastItem[];
  };
  unit: 'metric' | 'imperial';
}

export default function ForecastSection({ data, unit }: ForecastSectionProps) {
  // Group by day, pick one entry per day (the one closest to noon)
  const dailyMap = new Map<string, ForecastItem>();

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split('T')[0];
    const hour = date.getUTCHours();

    if (!dailyMap.has(dayKey) || Math.abs(hour - 12) < Math.abs(new Date(dailyMap.get(dayKey)!.dt * 1000).getUTCHours() - 12)) {
      dailyMap.set(dayKey, item);
    }
  });

  const dailyForecasts = Array.from(dailyMap.values()).slice(0, 6);

  // Also compute daily min/max from all entries for that day
  const dailyMinMax = new Map<string, { min: number; max: number }>();
  data.list.forEach((item) => {
    const dayKey = new Date(item.dt * 1000).toISOString().split('T')[0];
    const existing = dailyMinMax.get(dayKey);
    if (!existing) {
      dailyMinMax.set(dayKey, { min: item.main.temp_min, max: item.main.temp_max });
    } else {
      existing.min = Math.min(existing.min, item.main.temp_min);
      existing.max = Math.max(existing.max, item.main.temp_max);
    }
  });

  return (
    <div className="forecast-section">
      <h2 className="section-title">📅 5-Day Forecast</h2>
      <div className="forecast-scroll">
        {dailyForecasts.map((item, index) => {
          const dayKey = new Date(item.dt * 1000).toISOString().split('T')[0];
          const minMax = dailyMinMax.get(dayKey);
          const emoji = getWeatherEmoji(item.weather[0].id, item.weather[0].icon);

          return (
            <div
              key={item.dt}
              className="forecast-card glass-card"
              style={{ animationDelay: `${index * 80}ms`, animation: 'fadeSlideIn 400ms ease-out backwards' }}
            >
              <div className="forecast-card-day">{formatDay(item.dt)}</div>
              <span className="forecast-card-icon">{emoji}</span>
              <div className="forecast-card-temp">
                {formatTemp(minMax?.max ?? item.main.temp_max, unit)}
              </div>
              <div className="forecast-card-temp-low">
                {formatTemp(minMax?.min ?? item.main.temp_min, unit)}
              </div>
              <div className="forecast-card-desc">{item.weather[0].description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
