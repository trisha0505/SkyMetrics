export function getWeatherEmoji(weatherId: number, icon?: string): string {
  const isNight = icon?.includes('n');

  if (weatherId >= 200 && weatherId < 300) return '⛈️';
  if (weatherId >= 300 && weatherId < 400) return '🌦️';
  if (weatherId >= 500 && weatherId < 510) return '🌧️';
  if (weatherId >= 510 && weatherId < 520) return '🌧️';
  if (weatherId >= 520 && weatherId < 600) return '🌧️';
  if (weatherId >= 600 && weatherId < 700) return '❄️';
  if (weatherId === 701 || weatherId === 741) return '🌫️';
  if (weatherId === 711) return '🌫️';
  if (weatherId === 721) return '🌫️';
  if (weatherId === 731 || weatherId === 751 || weatherId === 761) return '🌪️';
  if (weatherId === 762) return '🌋';
  if (weatherId === 771) return '💨';
  if (weatherId === 781) return '🌪️';
  if (weatherId === 800) return isNight ? '🌙' : '☀️';
  if (weatherId === 801) return isNight ? '🌙' : '🌤️';
  if (weatherId === 802) return '⛅';
  if (weatherId === 803) return '🌥️';
  if (weatherId === 804) return '☁️';

  return '🌡️';
}
