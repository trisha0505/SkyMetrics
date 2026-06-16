'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const pathname = usePathname();
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    const saved = localStorage.getItem('skymetrics-unit');
    if (saved === 'metric' || saved === 'imperial') setUnit(saved);
  }, []);

  const toggleUnit = (newUnit: 'metric' | 'imperial') => {
    setUnit(newUnit);
    localStorage.setItem('skymetrics-unit', newUnit);
    window.dispatchEvent(new CustomEvent('unit-change', { detail: newUnit }));
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">⛅</div>
          SkyMetrics
        </Link>

        <nav className="nav-links">
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            href="/travel"
            className={`nav-link ${pathname === '/travel' ? 'active' : ''}`}
          >
            Travel Planner
          </Link>
          <Link
            href="/compare"
            className={`nav-link ${pathname === '/compare' ? 'active' : ''}`}
          >
            Compare
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle />
          <div className="unit-toggle">
            <button
              className={`unit-btn ${unit === 'metric' ? 'active' : ''}`}
              onClick={() => toggleUnit('metric')}
            >
              °C
            </button>
            <button
              className={`unit-btn ${unit === 'imperial' ? 'active' : ''}`}
              onClick={() => toggleUnit('imperial')}
            >
              °F
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
