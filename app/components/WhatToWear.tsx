'use client';

interface WhatToWearProps {
  temp: number;
  weatherId: number;
  windSpeed: number;
  humidity: number;
  unit: 'metric' | 'imperial';
}

interface ClothingItem {
  icon: string;
  name: string;
}

function getClothingRecommendations(
  temp: number,
  weatherId: number,
  windSpeed: number,
  humidity: number,
  unit: string
): { category: string; items: ClothingItem[]; tip: string } {
  const tempC = unit === 'imperial' ? (temp - 32) * (5 / 9) : temp;
  const items: ClothingItem[] = [];
  let category: string;
  let tip: string;

  // Temperature-based base layer
  if (tempC > 30) {
    category = 'Light & Breezy';
    items.push({ icon: '👕', name: 'Light T-shirt' });
    items.push({ icon: '🩳', name: 'Shorts' });
    items.push({ icon: '🩴', name: 'Sandals' });
    items.push({ icon: '🧢', name: 'Sun hat' });
    items.push({ icon: '🕶️', name: 'Sunglasses' });
    tip = 'Wear light, breathable fabrics. Apply sunscreen.';
  } else if (tempC > 20) {
    category = 'Comfortable Casual';
    items.push({ icon: '👔', name: 'Light shirt' });
    items.push({ icon: '👖', name: 'Pants/Jeans' });
    items.push({ icon: '👟', name: 'Sneakers' });
    tip = 'Perfect weather for a comfortable outfit.';
  } else if (tempC > 10) {
    category = 'Layer Up';
    items.push({ icon: '🧥', name: 'Light jacket' });
    items.push({ icon: '👕', name: 'Long sleeve shirt' });
    items.push({ icon: '👖', name: 'Pants' });
    items.push({ icon: '👟', name: 'Closed shoes' });
    tip = 'Layer up — you can always remove if it warms up.';
  } else if (tempC > 0) {
    category = 'Bundle Up';
    items.push({ icon: '🧥', name: 'Warm coat' });
    items.push({ icon: '🧣', name: 'Scarf' });
    items.push({ icon: '🧤', name: 'Gloves' });
    items.push({ icon: '👖', name: 'Warm pants' });
    items.push({ icon: '🥾', name: 'Boots' });
    tip = 'Dress warmly in layers. Protect extremities.';
  } else {
    category = 'Full Winter Gear';
    items.push({ icon: '🧥', name: 'Heavy winter coat' });
    items.push({ icon: '🧣', name: 'Warm scarf' });
    items.push({ icon: '🧤', name: 'Insulated gloves' });
    items.push({ icon: '🎿', name: 'Thermal layers' });
    items.push({ icon: '🥾', name: 'Insulated boots' });
    items.push({ icon: '🧶', name: 'Beanie/Hat' });
    tip = 'Extreme cold! Wear multiple thermal layers.';
  }

  // Weather-specific additions
  if (weatherId >= 200 && weatherId < 600) {
    // Rain/storm
    items.push({ icon: '☂️', name: 'Umbrella' });
    items.push({ icon: '🌧️', name: 'Rain jacket' });
    tip += ' Carry rain gear!';
  }

  if (weatherId >= 600 && weatherId < 700) {
    items.push({ icon: '🧊', name: 'Waterproof boots' });
    tip += ' Waterproof footwear recommended.';
  }

  if (windSpeed > 8) {
    items.push({ icon: '🧥', name: 'Windbreaker' });
    tip += ' It\'s windy — wear wind-resistant clothing.';
  }

  return { category, items, tip };
}

export default function WhatToWear({ temp, weatherId, windSpeed, humidity, unit }: WhatToWearProps) {
  const { category, items, tip } = getClothingRecommendations(temp, weatherId, windSpeed, humidity, unit);

  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <h2 className="section-title">🧥 What to Wear</h2>
      <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
        <div className="wear-category">{category}</div>
        <div className="wear-items-grid">
          {items.map((item, index) => (
            <div
              key={index}
              className="wear-item"
              style={{
                animationDelay: `${index * 60}ms`,
                animation: 'fadeSlideIn 300ms ease-out backwards',
              }}
            >
              <span className="wear-item-icon">{item.icon}</span>
              <span className="wear-item-name">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="wear-tip">💡 {tip}</div>
      </div>
    </div>
  );
}
