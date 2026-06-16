'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastSection from './components/ForecastSection';
import WeatherStats from './components/WeatherStats';
import HourlyForecast from './components/HourlyForecast';
import WeatherChart from './components/WeatherChart';
import WeatherAlerts from './components/WeatherAlerts';
import AirQuality from './components/AirQuality';
import WhatToWear from './components/WhatToWear';
import FavoriteCities from './components/FavoriteCities';
import LoadingSpinner from './components/LoadingSpinner';

export default function DashboardPage() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [weatherData, setWeatherData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('skymetrics-unit');
    if (saved === 'metric' || saved === 'imperial') setUnit(saved);

    const handleUnitChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setUnit(customEvent.detail);
    };
    window.addEventListener('unit-change', handleUnitChange);
    return () => window.removeEventListener('unit-change', handleUnitChange);
  }, []);

  // Re-fetch when unit changes and we have data
  useEffect(() => {
    if (weatherData) {
      fetchWeather(weatherData.coord.lat, weatherData.coord.lon, unit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const fetchWeather = useCallback(async (lat: number, lon: number, currentUnit: string) => {
    setLoading(true);
    setError('');

    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?lat=${lat}&lon=${lon}&units=${currentUnit}`),
        fetch(`/api/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}`),
      ]);

      const weather = await weatherRes.json();
      const forecast = await forecastRes.json();

      if (weather.error) {
        setError(weather.error);
        return;
      }

      setWeatherData(weather);
      setForecastData(forecast);
      setHasSearched(true);
    } catch {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCity = (lat: number, lon: number, _name: string) => {
    fetchWeather(lat, lon, unit);
  };

  // Try geolocation on first load
  useEffect(() => {
    if (!hasSearched && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude, unit);
        },
        () => {
          // Geolocation denied - show empty state
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCityInfo = weatherData ? {
    name: weatherData.name,
    lat: weatherData.coord.lat,
    lon: weatherData.coord.lon,
    country: weatherData.sys.country,
  } : undefined;

  return (
    <main className="page-content">
      <div className="app-container">
        <SearchBar onSelectCity={handleSelectCity} />

        {/* Favorite Cities */}
        <FavoriteCities
          currentCity={currentCityInfo}
          onSelectCity={handleSelectCity}
        />

        {error && <div className="error-banner">{error}</div>}

        {loading && <LoadingSpinner message="Fetching weather data..." />}

        {!loading && !hasSearched && !error && (
          <div className="empty-state">
            <span className="empty-state-icon">🌍</span>
            <h2 className="empty-state-title">Welcome to SkyMetrics</h2>
            <p className="empty-state-desc">
              Search for any city to see real-time weather conditions, forecasts, charts, air quality, and more.
            </p>
          </div>
        )}

        {!loading && weatherData && (
          <>
            <CurrentWeather data={weatherData} unit={unit} />

            {/* Weather Alerts */}
            <WeatherAlerts weatherData={weatherData} unit={unit} />

            {/* What to Wear */}
            <WhatToWear
              temp={weatherData.main.temp}
              weatherId={weatherData.weather[0].id}
              windSpeed={weatherData.wind.speed}
              humidity={weatherData.main.humidity}
              unit={unit}
            />

            {/* Hourly Forecast */}
            {forecastData && forecastData.list && (
              <HourlyForecast forecastData={forecastData} unit={unit} />
            )}

            {/* Weather Charts */}
            {forecastData && forecastData.list && (
              <WeatherChart forecastData={forecastData} unit={unit} />
            )}

            {/* Weather Stats */}
            <h2 className="section-title">📊 Weather Details</h2>
            <WeatherStats data={weatherData} unit={unit} />

            {/* Air Quality */}
            <AirQuality lat={weatherData.coord.lat} lon={weatherData.coord.lon} />

            {/* 5-Day Forecast */}
            {forecastData && forecastData.list && (
              <ForecastSection data={forecastData} unit={unit} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
