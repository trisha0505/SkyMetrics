'use client';

import { useState, useEffect } from 'react';

interface FavoriteCity {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

interface FavoriteCitiesProps {
  currentCity?: { name: string; lat: number; lon: number; country: string };
  onSelectCity: (lat: number, lon: number, name: string) => void;
}

export default function FavoriteCities({ currentCity, onSelectCity }: FavoriteCitiesProps) {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('skymetrics-favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (currentCity) {
      setIsFav(favorites.some(f => f.name === currentCity.name && f.country === currentCity.country));
    }
  }, [currentCity, favorites]);

  const toggleFavorite = () => {
    if (!currentCity) return;

    let updated: FavoriteCity[];
    if (isFav) {
      updated = favorites.filter(f => !(f.name === currentCity.name && f.country === currentCity.country));
    } else {
      if (favorites.length >= 8) {
        updated = [...favorites.slice(1), currentCity];
      } else {
        updated = [...favorites, currentCity];
      }
    }

    setFavorites(updated);
    localStorage.setItem('skymetrics-favorites', JSON.stringify(updated));
  };

  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <h2 className="section-title" style={{ margin: 0 }}>📍 Favorite Cities</h2>
        {currentCity && (
          <button
            onClick={toggleFavorite}
            className="fav-toggle-btn"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFav ? '❤️ Saved' : '🤍 Save City'}
          </button>
        )}
      </div>

      {favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map((city, index) => (
            <button
              key={`${city.name}-${city.country}-${index}`}
              className="favorite-chip glass-card"
              onClick={() => onSelectCity(city.lat, city.lon, city.name)}
            >
              <span className="favorite-chip-name">{city.name}</span>
              <span className="favorite-chip-country">{city.country}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="glass-card-static" style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Search for a city and click &quot;Save City&quot; to add favorites for quick access.
        </div>
      )}
    </div>
  );
}
