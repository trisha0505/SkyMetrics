'use client';

interface WeatherAlertsProps {
  weatherData: {
    weather: Array<{ id: number; main: string; description: string }>;
    main: { temp: number; humidity: number; pressure: number };
    wind: { speed: number; gust?: number };
    visibility: number;
  };
  unit: 'metric' | 'imperial';
}

interface Alert {
  severity: 'critical' | 'warning' | 'info';
  icon: string;
  title: string;
  description: string;
}

function generateAlerts(data: WeatherAlertsProps['weatherData'], unit: string): Alert[] {
  const alerts: Alert[] = [];
  const weatherId = data.weather[0]?.id;
  const temp = data.main.temp;
  const windSpeed = data.wind.speed;
  const windGust = data.wind.gust || 0;
  const visibility = data.visibility;
  const humidity = data.main.humidity;

  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) {
    alerts.push({
      severity: 'critical',
      icon: '⛈️',
      title: 'Thunderstorm Warning',
      description: 'Active thunderstorm detected. Seek shelter indoors and stay away from windows.',
    });
  }

  // Heavy rain
  if (weatherId >= 502 && weatherId < 600) {
    alerts.push({
      severity: 'warning',
      icon: '🌊',
      title: 'Heavy Rain Alert',
      description: 'Heavy rainfall in progress. Watch for flash flooding in low-lying areas.',
    });
  }

  // Snow
  if (weatherId >= 600 && weatherId < 700) {
    alerts.push({
      severity: 'warning',
      icon: '❄️',
      title: 'Snow Advisory',
      description: 'Snowfall detected. Roads may be slippery. Reduce speed and increase following distance.',
    });
  }

  // Extreme heat
  const heatThreshold = unit === 'metric' ? 40 : 104;
  if (temp > heatThreshold) {
    alerts.push({
      severity: 'critical',
      icon: '🔥',
      title: 'Extreme Heat Warning',
      description: 'Dangerously high temperatures. Stay indoors, stay hydrated, and check on vulnerable neighbors.',
    });
  } else if (temp > (unit === 'metric' ? 35 : 95)) {
    alerts.push({
      severity: 'warning',
      icon: '☀️',
      title: 'Heat Advisory',
      description: 'High temperatures expected. Limit outdoor activities and drink plenty of water.',
    });
  }

  // Extreme cold
  const coldThreshold = unit === 'metric' ? -15 : 5;
  if (temp < coldThreshold) {
    alerts.push({
      severity: 'critical',
      icon: '🥶',
      title: 'Extreme Cold Warning',
      description: 'Dangerously low temperatures. Risk of frostbite and hypothermia. Stay indoors.',
    });
  }

  // High wind
  if (windSpeed > 20 || windGust > 25) {
    alerts.push({
      severity: 'warning',
      icon: '💨',
      title: 'High Wind Warning',
      description: 'Strong winds detected. Secure loose objects and avoid unnecessary travel.',
    });
  }

  // Low visibility
  if (visibility < 1000) {
    alerts.push({
      severity: 'warning',
      icon: '🌫️',
      title: 'Fog / Low Visibility',
      description: 'Visibility below 1 km. Use fog lights and drive slowly.',
    });
  }

  // Extreme humidity
  if (humidity > 90 && temp > (unit === 'metric' ? 30 : 86)) {
    alerts.push({
      severity: 'info',
      icon: '💧',
      title: 'High Humidity Notice',
      description: 'Very high humidity combined with heat. Heat index may feel significantly higher.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      severity: 'info',
      icon: '✅',
      title: 'No Active Alerts',
      description: 'Weather conditions are normal. No severe weather warnings at this time.',
    });
  }

  return alerts;
}

export default function WeatherAlerts({ weatherData, unit }: WeatherAlertsProps) {
  const alerts = generateAlerts(weatherData, unit);

  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2 className="section-title">🔔 Weather Alerts</h2>
      <div className="alerts-container">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`alert-card alert-${alert.severity}`}
            style={{
              animationDelay: `${index * 80}ms`,
              animation: 'fadeSlideIn 400ms ease-out backwards',
            }}
          >
            <div className="alert-icon">{alert.icon}</div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-desc">{alert.description}</div>
            </div>
            <div className={`alert-badge badge-${alert.severity}`}>
              {alert.severity.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
