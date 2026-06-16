'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatTemp } from '@/lib/utils';
import { getWeatherEmoji } from '@/lib/weather-icons';
import LoadingSpinner from '../components/LoadingSpinner';

interface CityWeather {
  name: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  visibility: number;
  weather_id: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
}

export default function ComparePage() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [cities, setCities] = useState<string[]>(['', '', '', '']);
  const [results, setResults] = useState<(CityWeather | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('skymetrics-unit');
    if (saved === 'metric' || saved === 'imperial') setUnit(saved);

    const handleUnitChange = (e: Event) => {
      setUnit((e as CustomEvent).detail);
    };
    window.addEventListener('unit-change', handleUnitChange);
    return () => window.removeEventListener('unit-change', handleUnitChange);
  }, []);

  const handleCityChange = (index: number, value: string) => {
    const updated = [...cities];
    updated[index] = value;
    setCities(updated);
  };

  const handleCompare = useCallback(async () => {
    const filledCities = cities.filter(c => c.trim());
    if (filledCities.length < 2) {
      setError('Please enter at least 2 cities to compare');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const promises = cities.map(async (city, i) => {
        if (!city.trim()) return null;
        const res = await fetch(`/api/weather?q=${encodeURIComponent(city.trim())}&units=${unit}`);
        const data = await res.json();
        if (data.error) return null;
        return {
          name: data.name,
          country: data.sys.country,
          lat: data.coord.lat,
          lon: data.coord.lon,
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind_speed: data.wind.speed,
          visibility: data.visibility,
          weather_id: data.weather[0].id,
          weather_main: data.weather[0].main,
          weather_description: data.weather[0].description,
          weather_icon: data.weather[0].icon,
        } as CityWeather;
      });

      const data = await Promise.all(promises);
      setResults(data);
    } catch {
      setError('Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  }, [cities, unit]);

  const windUnit = unit === 'metric' ? 'm/s' : 'mph';
  const validResults = results.filter(Boolean) as CityWeather[];

  return (
    <main className="page-content">
      <div className="app-container">
        <div className="travel-header">
          <h1>🏠 Multi-City Compare</h1>
          <p>Compare weather conditions across up to 4 cities side-by-side.</p>
        </div>

        {/* City Inputs */}
        <div className="compare-form glass-card-static" style={{ padding: 'var(--space-xl)', maxWidth: 800, margin: '0 auto var(--space-2xl)' }}>
          <div className="compare-inputs">
            {cities.map((city, i) => (
              <div key={i} className="form-group">
                <label className="form-label" htmlFor={`city-${i}`}>City {i + 1} {i < 2 ? '*' : '(optional)'}</label>
                <input
                  id={`city-${i}`}
                  className="form-input"
                  type="text"
                  placeholder={`e.g., ${['London', 'Tokyo', 'New York', 'Paris'][i]}`}
                  value={city}
                  onChange={(e) => handleCityChange(i, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                />
              </div>
            ))}
          </div>
          <button onClick={handleCompare} className="travel-submit" disabled={loading} style={{ marginTop: 'var(--space-lg)' }}>
            {loading ? 'Comparing...' : '⚡ Compare Weather'}
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <LoadingSpinner message="Comparing cities..." />}

        {/* Results Grid */}
        {validResults.length >= 2 && !loading && (
          <>
            <div className="compare-grid">
              {validResults.map((city, index) => {
                const emoji = getWeatherEmoji(city.weather_id, city.weather_icon);
                return (
                  <div
                    key={`${city.name}-${city.country}`}
                    className="compare-card glass-card-static"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeSlideIn 400ms ease-out backwards',
                    }}
                  >
                    <div className="compare-card-header">
                      <span className="compare-card-icon">{emoji}</span>
                      <div>
                        <div className="compare-card-name">{city.name}</div>
                        <div className="compare-card-country">{city.country}</div>
                      </div>
                    </div>

                    <div className="compare-card-temp">{formatTemp(city.temp, unit)}</div>
                    <div className="compare-card-desc">{city.weather_description}</div>

                    <div className="compare-card-stats">
                      <div className="compare-stat">
                        <span className="compare-stat-label">Feels Like</span>
                        <span className="compare-stat-value">{formatTemp(city.feels_like, unit)}</span>
                      </div>
                      <div className="compare-stat">
                        <span className="compare-stat-label">Humidity</span>
                        <span className="compare-stat-value">{city.humidity}%</span>
                      </div>
                      <div className="compare-stat">
                        <span className="compare-stat-label">Wind</span>
                        <span className="compare-stat-value">{city.wind_speed} {windUnit}</span>
                      </div>
                      <div className="compare-stat">
                        <span className="compare-stat-label">Pressure</span>
                        <span className="compare-stat-value">{city.pressure} hPa</span>
                      </div>
                      <div className="compare-stat">
                        <span className="compare-stat-label">Visibility</span>
                        <span className="compare-stat-value">{(city.visibility / 1000).toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {validResults.length === 0 && !loading && !error && (
          <div className="empty-state">
            <span className="empty-state-icon">🌍</span>
            <h2 className="empty-state-title">Compare Cities</h2>
            <p className="empty-state-desc">
              Enter at least 2 cities above and click Compare to see weather side by side.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
