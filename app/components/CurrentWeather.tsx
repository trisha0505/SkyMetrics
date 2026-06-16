'use client';

import { formatTemp, getWindDirection } from '@/lib/utils';
import { getWeatherEmoji } from '@/lib/weather-icons';

interface WeatherData {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  wind: { speed: number; deg: number };
  visibility: number;
  dt: number;
  timezone: number;
}

interface CurrentWeatherProps {
  data: WeatherData;
  unit: 'metric' | 'imperial';
}

export default function CurrentWeather({ data, unit }: CurrentWeatherProps) {
  const weather = data.weather[0];
  const emoji = getWeatherEmoji(weather.id, weather.icon);
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <div className="weather-hero glass-card-static" style={{ animation: 'fadeSlideIn 500ms ease-out' }}>
      <div className="weather-hero-location">
        {data.name}, {data.sys.country}
        <span> · {new Date(data.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="weather-hero-main">
        <span className="weather-hero-icon">{emoji}</span>
        <span className="weather-hero-temp">{formatTemp(data.main.temp, unit)}</span>
      </div>

      <div className="weather-hero-desc">{weather.description}</div>

      <div className="weather-hero-details">
        <div className="weather-detail-pill">
          🌡️ Feels like <span className="value">{formatTemp(data.main.feels_like, unit)}</span>
        </div>
        <div className="weather-detail-pill">
          💧 Humidity <span className="value">{data.main.humidity}%</span>
        </div>
        <div className="weather-detail-pill">
          💨 Wind <span className="value">{data.wind.speed} {windUnit} {getWindDirection(data.wind.deg)}</span>
        </div>
        <div className="weather-detail-pill">
          📊 Pressure <span className="value">{data.main.pressure} hPa</span>
        </div>
      </div>
    </div>
  );
}
