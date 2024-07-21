import { useEffect, useCallback, useState } from 'react';
import { OpenWeatherMapWeatherInfo, UnifiedWeatherInfo, WeatherApiWeatherInfo } from '../types';
import { openWeatherMapApi, weatherApi } from '../utils/request.ts';
import { OPEN_WEATHER_MAP_API_KEY, WEATHER_API_API_KEY } from '../utils/consts.ts';
import dayjs from 'dayjs';
import { kelvin2centigrade } from '../utils';

export type FetchWeatherInfoCallback = (lat: number, lon: number) => Promise<{ weatherInfo: UnifiedWeatherInfo, error: string }>;

export interface WeatherInfoTabItem {
  tabKey: string;
  tabLabel: string;
  isFetching: boolean;
  weatherInfo: UnifiedWeatherInfo;
}

export const TAB_KEY_OPEN_WEATHER_MAP = 'open-weather-map';
export const TAB_KEY_WEATHER_API ='weather-api';

export const useTabItem = ({ tabKey, tabLabel, lat, lon, fetchWeatherInfoCallback, currentActiveTabKey } : {
  tabKey: string;
  tabLabel: string;
  lat?: number;
  lon?: number;
  fetchWeatherInfoCallback: FetchWeatherInfoCallback;
  currentActiveTabKey: string;
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

    if (lat && lon && currentActiveTabKey === tabKey) {
      doFetch();
    }
  }, [ tabKey, lat, lon, fetchWeatherInfoCallback, currentActiveTabKey ]);

  return {
    tabKey,
    tabLabel,
    isFetching: isFetchingWeatherInfo,
    weatherInfo,
  };
};

export const useWeatherInfoTabItems = (currentActiveTabKey: string, lat?: number, lon?: number): WeatherInfoTabItem[] => [
  useOpenWeatherMapApiTabItem(currentActiveTabKey, lat, lon),
  useWeatherApiTabItem(currentActiveTabKey, lat, lon),
];

export const useOpenWeatherMapApiTabItem = (currentActiveTabKey: string, lat?: number, lon?: number) => {
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
    tabKey: TAB_KEY_OPEN_WEATHER_MAP,
    tabLabel: 'Open Weather Map Api',
    lat,
    lon,
    fetchWeatherInfoCallback: fetchCityWeatherInfo,
    currentActiveTabKey,
  });
};

export const useWeatherApiTabItem = (currentActiveTabKey: string, lat?: number, lon?: number) => {
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
        localtime: dayjs(data.location.localtime).format('DD/MM/YYYY HH:mm'),
        weatherIcon: data.current.condition.icon,
        temperature: data.current.temp_c,
        pressure: data.current.pressure_mb,
        feelsLikeTemperature: data.current.feelslike_c,
        description: data.current.condition.text,
        wind: {
          deg: data.current.wind_degree,
          speed: Number(((data.current.wind_kph) / 60 / 60 * 1000).toFixed(1)),
        },
        humidity: data.current.humidity,
        visibility: data.current.vis_km * 1000,
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
    tabKey: TAB_KEY_WEATHER_API,
    tabLabel: 'Weather Api',
    lat,
    lon,
    fetchWeatherInfoCallback: fetchCityWeatherInfo,
    currentActiveTabKey,
  });
};