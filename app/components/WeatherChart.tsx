'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface ForecastItem {
  dt: number;
  main: { temp: number; humidity: number; feels_like: number };
  weather: Array<{ id: number; description: string }>;
}

interface WeatherChartProps {
  forecastData: { list: ForecastItem[] };
  unit: 'metric' | 'imperial';
}

export default function WeatherChart({ forecastData, unit }: WeatherChartProps) {
  const items = forecastData.list.slice(0, 16); // ~48 hours

  const labels = items.map((item) => {
    const date = new Date(item.dt * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  });

  const tempData = items.map((item) => Math.round(item.main.temp));
  const feelsLikeData = items.map((item) => Math.round(item.main.feels_like));
  const humidityData = items.map((item) => item.main.humidity);

  const tempUnit = unit === 'metric' ? '°C' : '°F';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { family: 'Inter', weight: 600 as const },
        bodyFont: { family: 'Inter' },
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 10 },
          maxRotation: 45,
          maxTicksLimit: 8,
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y1: {
        position: 'right' as const,
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          callback: (value: string | number) => `${value}%`,
        },
        grid: { display: false },
        min: 0,
        max: 100,
      },
    },
  };

  const tempChartData = {
    labels,
    datasets: [
      {
        label: `Temperature (${tempUnit})`,
        data: tempData,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#38bdf8',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: `Feels Like (${tempUnit})`,
        data: feelsLikeData,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: '#8b5cf6',
        borderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y',
      },
      {
        label: 'Humidity (%)',
        data: humidityData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        tension: 0.4,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: '#10b981',
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2 className="section-title">📊 Temperature & Humidity Trends</h2>
      <div className="glass-card-static" style={{ padding: 'var(--space-lg)', height: '340px' }}>
        <Line data={tempChartData} options={chartOptions} />
      </div>
    </div>
  );
}
