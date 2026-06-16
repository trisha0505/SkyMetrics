'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface GeoResult {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

interface SearchBarProps {
  onSelectCity: (lat: number, lon: number, name: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSelectCity, placeholder = 'Search for a city...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCity = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
        setShowDropdown(data.length > 0);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCity(value), 350);
  };

  const handleSelect = (result: GeoResult) => {
    const label = result.state
      ? `${result.name}, ${result.state}, ${result.country}`
      : `${result.name}, ${result.country}`;
    setQuery(label);
    setShowDropdown(false);
    onSelectCity(result.lat, result.lon, result.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0]);
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-container" ref={dropdownRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          id="city-search"
        />
        {loading && <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />}
      </div>

      {showDropdown && (
        <div className="search-dropdown">
          {results.map((r, i) => (
            <div key={`${r.lat}-${r.lon}-${i}`} className="search-item" onClick={() => handleSelect(r)}>
              <span>📍</span>
              <div>
                <div className="search-item-name">{r.name}</div>
                <div className="search-item-detail">
                  {r.state ? `${r.state}, ` : ''}{r.country}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
