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

export interface WeatherApiWeatherInfo {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: number;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    windchill_c: number;
    windchill_f: number;
    heatindex_c: number;
    heatindex_f: number;
    dewpoint_c: number;
    dewpoint_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  }
}

export interface UnifiedWeatherInfo {
  name: string; // Location name
  country: string; // Location country
  lon: number; // Longitude of the location
  lat: number; // Latitude of the location
  localtime: string; // Local time in DD/MM/YYYY HH:mm format
  weatherIcon: string; // Url of weather condition icon
  temperature: number; // Temperature in centigrade
  pressure: number; // Atmospheric pressure on the sea level; hPa
  feelsLikeTemperature: number; // Feels like temperature as centigrade
  description: string; // location name + country name
  wind: {
    deg: number; // Wind direction in degrees
    speed: number; // Wind speed in meter per second
  };
  humidity: number; // Humidity as percentage
  visibility: number; // Visibility in meter
}