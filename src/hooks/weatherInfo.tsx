import { useEffect, useCallback, useState } from 'react';
import { OpenWeatherMapWeatherInfo, UnifiedWeatherInfo, WeatherApiWeatherInfo } from '../types';
import { openWeatherMapApi, weatherApi } from '../utils/request.ts';
import { OPEN_WEATHER_MAP_API_KEY, WEATHER_API_API_KEY } from '../utils/consts.ts';
import dayjs from 'dayjs';
import { kelvin2centigrade } from '../utils';

export type FetchWeatherInfoCallback = (lat: number, lon: number) => Promise<{ weatherInfo: UnifiedWeatherInfo, error: string }>;

export interface WeatherInfoTabItem {
  id: string;
  label: string;
  isFetching: boolean;
  weatherInfo: UnifiedWeatherInfo;
}

export const useTabItem = ({ id, label, lat, lon, fetchWeatherInfoCallback } : {
  id: string;
  label: string;
  lat?: number;
  lon?: number;
  fetchWeatherInfoCallback: FetchWeatherInfoCallback;
}): WeatherInfoTabItem => {
  const [ isFetchingWeatherInfo, setIsFetchingWeatherInfo ] = useState(false);
  const [ weatherInfo, setWeatherInfo ] = useState<UnifiedWeatherInfo>(null!);

  useEffect(() => {
    const doFetch = async () => {
      setIsFetchingWeatherInfo(true);

      const { weatherInfo, error } = await fetchWeatherInfoCallback(lat, lon);

      setWeatherInfo(weatherInfo);
      setIsFetchingWeatherInfo(false);
    }

    if (lat && lon) {
      doFetch();
    }
  }, [ fetchWeatherInfoCallback, lat, lon ]);

  return {
    id,
    label,
    isFetching: isFetchingWeatherInfo,
    weatherInfo,
  };
};

export const useWeatherInfoTabItems = (lat?: number, lon?: number): WeatherInfoTabItem[] => [
  useOpenWeatherMapApiTabItem(lat, lon),
  useWeatherApiTabItem(lat, lon),
];

export const useOpenWeatherMapApiTabItem = (lat?: number, lon?: number) => {
  const fetchCityWeatherInfo = useCallback(async (lat: number, lon: number) => {
    let weatherInfo: UnifiedWeatherInfo = null!;
    let error = null;

    const res = await openWeatherMapApi({
      url: '/data/2.5/weather',
      data: {
        lat,
        lon,
        appid: OPEN_WEATHER_MAP_API_KEY,
      },
    });

    if (res.status === 200) {
      console.log(666666, res);
      const data: OpenWeatherMapWeatherInfo = res.data;

      weatherInfo = {
        name: data.name,
        country: data.sys.country,
        lon: data.coord.lon,
        lat: data.coord.lat,
        localtime: dayjs().utc().utcOffset(data.timezone / 60).format('DD/MM/YYYY HH:mm'),
        /*
          https://openweathermap.org/weather-conditions:
          > NOTE: It is possible to meet more than one weather condition for a requested location.
          The first weather condition in API respond is primary.

          So we use weather[0].icon here.
        */
        weatherIcon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        temperature: kelvin2centigrade(data.main.temp),
        pressure: data.main.pressure,
        feelsLikeTemperature: kelvin2centigrade(data.main.feels_like),
        description: data.weather[0].description[0].toUpperCase() + data.weather[0].description.slice(1),
        wind: {
          deg: data.wind.deg,
          speed: data.wind.speed,
        },
        humidity: data.main.humidity,
        visibility: data.visibility,
      };
    } else {
      // TODO 提示错误
      error = res.data.message;
    }

    return {
      weatherInfo,
      error,
    };
  }, []);

  return useTabItem({
    id: 'open-weather-map',
    label: 'Open Weather Map Api',
    lat,
    lon,
    fetchWeatherInfoCallback: fetchCityWeatherInfo,
  });
};

export const useWeatherApiTabItem = (lat?: number, lon?: number) => {
  const fetchCityWeatherInfo = useCallback(async (lat: number, lon: number) => {
    let weatherInfo: UnifiedWeatherInfo = null!;
    let error = null;

    const res = await weatherApi({
      url: 'v1/current.json',
      data: {
        q: `${lat},${lon}`,
        aqi: 'no',
        key: WEATHER_API_API_KEY,
      },
    });

    if (res.status === 200) {
      console.log(666666, res);
      const data: WeatherApiWeatherInfo = res.data;

      weatherInfo = {
        name: data.location.name,
        country: data.location.country,
        lon: data.location.lon,
        lat: data.location.lat,
        localtime: data.location.localtime,
        weatherIcon: data.current.condition.icon,
        temperature: data.current.temp_c,
        pressure: data.current.pressure_mb,
        feelsLikeTemperature: data.current.feelslike_c,
        description: data.current.condition.text,
        wind: {
          deg: data.current.wind_degree,
          speed: (data.current.wind_kph) / 60 / 60 * 1000,
        },
        humidity: data.current.humidity,
        visibility: data.current.vis_km,
      };
    } else {
      // TODO 提示错误
      error = res.data.message;
    }

    return {
      weatherInfo,
      error,
    };
  }, []);

  return useTabItem({
    id: 'weather-api',
    label: 'Weather Api',
    lat,
    lon,
    fetchWeatherInfoCallback: fetchCityWeatherInfo,
  });
};