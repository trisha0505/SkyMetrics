import { NextRequest, NextResponse } from 'next/server';
import { interpolateCoordinates, haversineDistance, estimateTravelTime } from '@/lib/utils';

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

function generateRecommendations(waypoints: WaypointWeather[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const hasRain = waypoints.some(w => w.weather_id >= 500 && w.weather_id < 600);
  const hasThunderstorm = waypoints.some(w => w.weather_id >= 200 && w.weather_id < 300);
  const hasSnow = waypoints.some(w => w.weather_id >= 600 && w.weather_id < 700);
  const hasFog = waypoints.some(w => w.weather_id >= 700 && w.weather_id < 800);
  const hasExtremeHeat = waypoints.some(w => w.temp > 35);
  const hasExtremeCold = waypoints.some(w => w.temp < 0);
  const hasHighWind = waypoints.some(w => w.wind_speed > 10);
  const allClear = waypoints.every(w => w.weather_id === 800 || (w.weather_id > 800 && w.weather_id <= 802));

  if (hasThunderstorm) {
    recommendations.push({
      type: 'warning',
      icon: '⛈️',
      title: 'Severe Weather Alert',
      description: 'Thunderstorms detected along your route. Consider delaying your trip or planning alternate stops.',
    });
  }

  if (hasSnow) {
    recommendations.push({
      type: 'warning',
      icon: '❄️',
      title: 'Snow & Ice Warning',
      description: 'Snowy conditions expected. Ensure your vehicle has winter tires and carry chains if needed.',
    });
  }

  if (hasRain && !hasThunderstorm) {
    recommendations.push({
      type: 'caution',
      icon: '🌧️',
      title: 'Rain Expected',
      description: 'Pack an umbrella and rain gear. Roads may be slippery — maintain safe following distance.',
    });
  }

  if (hasFog) {
    recommendations.push({
      type: 'caution',
      icon: '🌫️',
      title: 'Low Visibility',
      description: 'Foggy conditions detected. Use low-beam headlights and reduce speed.',
    });
  }

  if (hasExtremeHeat) {
    recommendations.push({
      type: 'caution',
      icon: '🔥',
      title: 'Extreme Heat',
      description: 'Temperatures exceed 35°C. Stay hydrated, ensure AC is working, and avoid leaving items in the car.',
    });
  }

  if (hasExtremeCold) {
    recommendations.push({
      type: 'caution',
      icon: '🥶',
      title: 'Freezing Temperatures',
      description: 'Sub-zero temperatures detected. Watch for black ice and keep emergency supplies in your vehicle.',
    });
  }

  if (hasHighWind) {
    recommendations.push({
      type: 'tip',
      icon: '💨',
      title: 'High Winds',
      description: 'Strong winds along the route. Keep a firm grip on the steering wheel, especially on bridges.',
    });
  }

  if (allClear) {
    recommendations.push({
      type: 'success',
      icon: '☀️',
      title: 'Perfect Travel Weather',
      description: 'Clear skies along your entire route. Enjoy the drive!',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      icon: '✅',
      title: 'Good Conditions',
      description: 'Weather conditions are generally favorable for travel.',
    });
  }

  return recommendations;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'OpenWeather API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { source, destination, units = 'metric' } = body;

    if (!source || !destination) {
      return NextResponse.json(
        { error: 'Please provide both source and destination' },
        { status: 400 }
      );
    }

    // Geocode source
    const srcGeoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(source)}&limit=1&appid=${apiKey}`
    );
    const srcGeo = await srcGeoRes.json();
    if (!srcGeo.length) {
      return NextResponse.json({ error: `Could not find location: ${source}` }, { status: 404 });
    }

    // Geocode destination
    const destGeoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${apiKey}`
    );
    const destGeo = await destGeoRes.json();
    if (!destGeo.length) {
      return NextResponse.json({ error: `Could not find location: ${destination}` }, { status: 404 });
    }

    const srcLat = srcGeo[0].lat;
    const srcLon = srcGeo[0].lon;
    const destLat = destGeo[0].lat;
    const destLon = destGeo[0].lon;

    // Calculate intermediate waypoints
    const intermediatePoints = interpolateCoordinates(srcLat, srcLon, destLat, destLon, 3);

    // All points to fetch weather for
    const allPoints = [
      { lat: srcLat, lon: srcLon, name: srcGeo[0].name },
      ...intermediatePoints.map((p, i) => ({ ...p, name: `Waypoint ${i + 1}` })),
      { lat: destLat, lon: destLon, name: destGeo[0].name },
    ];

    // Fetch weather for all points in parallel
    const weatherPromises = allPoints.map(async (point) => {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${point.lat}&lon=${point.lon}&units=${units}&appid=${apiKey}`
      );
      const data = await res.json();

      // Try to get a real place name for intermediate points
      let name = point.name;
      if (name.startsWith('Waypoint') && data.name) {
        name = data.name;
      }

      return {
        name,
        lat: point.lat,
        lon: point.lon,
        temp: data.main?.temp,
        feels_like: data.main?.feels_like,
        humidity: data.main?.humidity,
        wind_speed: data.wind?.speed,
        weather_id: data.weather?.[0]?.id,
        weather_main: data.weather?.[0]?.main,
        weather_description: data.weather?.[0]?.description,
        weather_icon: data.weather?.[0]?.icon,
        visibility: data.visibility,
      } as WaypointWeather;
    });

    const waypoints = await Promise.all(weatherPromises);

    // Calculate distance and travel time
    const totalDistance = haversineDistance(srcLat, srcLon, destLat, destLon);
    const travelTime = estimateTravelTime(totalDistance);

    // Generate recommendations
    const recommendations = generateRecommendations(waypoints);

    return NextResponse.json({
      waypoints,
      totalDistance: Math.round(totalDistance),
      travelTime,
      recommendations,
      source: {
        name: srcGeo[0].name,
        state: srcGeo[0].state,
        country: srcGeo[0].country,
        lat: srcLat,
        lon: srcLon,
      },
      destination: {
        name: destGeo[0].name,
        state: destGeo[0].state,
        country: destGeo[0].country,
        lat: destLat,
        lon: destLon,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process route weather request' }, { status: 500 });
  }
}
