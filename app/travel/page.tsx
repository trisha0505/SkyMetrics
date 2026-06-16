'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatTemp } from '@/lib/utils';
import { getWeatherEmoji } from '@/lib/weather-icons';

const InteractiveMap = lazy(() => import('../components/InteractiveMap'));

interface WaypointWeather {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather_id: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  visibility: number;
}

interface Recommendation {
  type: 'warning' | 'caution' | 'tip' | 'success';
  icon: string;
  title: string;
  description: string;
}

interface RouteData {
  waypoints: WaypointWeather[];
  totalDistance: number;
  travelTime: string;
  recommendations: Recommendation[];
  source: { name: string; state?: string; country: string };
  destination: { name: string; state?: string; country: string };
}

export default function TravelPage() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('skymetrics-unit');
    if (saved === 'metric' || saved === 'imperial') setUnit(saved);

    const handleUnitChange = (e: Event) => {
      setUnit((e as CustomEvent).detail);
    };
    window.addEventListener('unit-change', handleUnitChange);
    return () => window.removeEventListener('unit-change', handleUnitChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!source.trim() || !destination.trim()) {
      setError('Please enter both source and destination');
      return;
    }

    setLoading(true);
    setError('');
    setRouteData(null);

    try {
      const res = await fetch('/api/route-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: source.trim(),
          destination: destination.trim(),
          units: unit,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setRouteData(data);
    } catch {
      setError('Failed to fetch route weather. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const windUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <main className="page-content">
      <div className="app-container">
        {/* Header */}
        <div className="travel-header">
          <h1>🗺️ Travel Weather Planner</h1>
          <p>Enter your source and destination to get weather along your route with smart recommendations.</p>
        </div>

        {/* Form */}
        <form className="travel-form glass-card-static" onSubmit={handleSubmit}>
          <div className="travel-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="travel-source">Origin</label>
              <input
                id="travel-source"
                className="form-input"
                type="text"
                placeholder="e.g., Mumbai"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="form-arrow">→</div>

            <div className="form-group">
              <label className="form-label" htmlFor="travel-dest">Destination</label>
              <input
                id="travel-dest"
                className="form-input"
                type="text"
                placeholder="e.g., Delhi"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="travel-submit" disabled={loading}>
            {loading ? 'Checking Route Weather...' : '🔍 Check Route Weather'}
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}

        {loading && <LoadingSpinner message="Analyzing weather along your route..." />}

        {/* Results */}
        {routeData && !loading && (
          <>
            {/* Route Summary */}
            <div className="route-summary" style={{ animation: 'fadeSlideIn 400ms ease-out' }}>
              <div className="route-summary-item">
                <div className="route-summary-label">From</div>
                <div className="route-summary-value">
                  {routeData.source.name}
                </div>
              </div>
              <div className="route-summary-item">
                <div className="route-summary-label">To</div>
                <div className="route-summary-value">
                  {routeData.destination.name}
                </div>
              </div>
              <div className="route-summary-item">
                <div className="route-summary-label">Distance</div>
                <div className="route-summary-value">
                  {routeData.totalDistance} km
                </div>
              </div>
              <div className="route-summary-item">
                <div className="route-summary-label">Est. Time</div>
                <div className="route-summary-value">
                  {routeData.travelTime}
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <Suspense fallback={<LoadingSpinner message="Loading map..." />}>
              <InteractiveMap waypoints={routeData.waypoints} unit={unit} />
            </Suspense>

            {/* Route Timeline */}
            <h2 className="section-title" style={{ maxWidth: 720, margin: '0 auto var(--space-lg)' }}>
              🛤️ Weather Along Your Route
            </h2>
            <div className="route-timeline">
              <div className="timeline-line" />
              {routeData.waypoints.map((wp, index) => {
                const isFirst = index === 0;
                const isLast = index === routeData.waypoints.length - 1;
                const dotClass = isFirst ? 'start' : isLast ? 'end' : '';
                const tagClass = isFirst ? 'origin' : isLast ? 'destination' : 'waypoint';
                const tagLabel = isFirst ? 'Origin' : isLast ? 'Destination' : `Stop ${index}`;
                const emoji = getWeatherEmoji(wp.weather_id, wp.weather_icon);

                return (
                  <div
                    key={`${wp.lat}-${wp.lon}-${index}`}
                    className="timeline-item"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className={`timeline-dot ${dotClass}`} />
                    <div className="timeline-card glass-card-static">
                      <div className="timeline-card-header">
                        <span className="timeline-card-name">{wp.name}</span>
                        <span className={`timeline-card-tag ${tagClass}`}>{tagLabel}</span>
                      </div>
                      <div className="timeline-card-weather">
                        <span style={{ fontSize: '2rem' }}>{emoji}</span>
                        <div>
                          <div className="timeline-card-temp">{formatTemp(wp.temp, unit)}</div>
                          <div className="timeline-card-condition">{wp.weather_description}</div>
                        </div>
                      </div>
                      <div className="timeline-card-stats">
                        <div className="timeline-stat">💧 <span>{wp.humidity}%</span></div>
                        <div className="timeline-stat">💨 <span>{wp.wind_speed} {windUnit}</span></div>
                        <div className="timeline-stat">🌡️ Feels <span>{formatTemp(wp.feels_like, unit)}</span></div>
                        <div className="timeline-stat">👁️ <span>{(wp.visibility / 1000).toFixed(1)} km</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            <h2 className="section-title" style={{ maxWidth: 720, margin: '0 auto var(--space-lg)' }}>
              💡 Travel Recommendations
            </h2>
            <div className="recommendations-section">
              {routeData.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`recommendation-card glass-card-static ${rec.type}`}
                  style={{ animationDelay: `${index * 100}ms`, animation: 'fadeSlideIn 400ms ease-out backwards' }}
                >
                  <div className="recommendation-icon">{rec.icon}</div>
                  <div className="recommendation-content">
                    <div className="recommendation-title">{rec.title}</div>
                    <div className="recommendation-desc">{rec.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!routeData && !loading && !error && (
          <div className="empty-state">
            <span className="empty-state-icon">✈️</span>
            <h2 className="empty-state-title">Plan Your Journey</h2>
            <p className="empty-state-desc">
              Enter your origin and destination above to see real-time weather conditions along your route with an interactive map and smart travel recommendations.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
