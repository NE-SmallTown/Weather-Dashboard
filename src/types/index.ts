export interface SearchCity {
  id: number;
  name: string;
  lat: 39.9075;
  lon: 116.3972;
}

export interface OpenWeatherMapWeatherInfo {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface UnifiedWeatherInfo {
  name: string; // Location name
  country: string; // Location country
  lon: number;
  lat: number;
  localtime: string; // Local time in DD/MM/YYYY HH:mm format
  weatherIcon: string; // Url of weather condition icon
  temperature: number; // Temperature in centigrade
  feelsLikeTemperature: number; // Feels like temperature as centigrade
  description: string; // location name + country name
  wind: {
    deg: number; // Wind direction in degrees
    speed: number; // Wind speed in meter per second
  };
  humidity: number; // Humidity as percentage
  visibility: number; // Visibility in meter
}