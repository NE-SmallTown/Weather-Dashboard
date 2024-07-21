import React, { useCallback, useEffect, useState } from 'react';
import { Menu, Input, Spin, Tabs, TabsProps, message } from 'antd';
import { MenuInfo } from 'rc-menu/es/interface';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';
import WeatherInfoPanel from './components/WeatherInfoPanel';
import WeatherAlertsSettings from './components/WeatherAlertsSettings';
import { openWeatherMapApi } from './utils/request';
import {
  OPEN_WEATHER_MAP_API_KEY,
} from './utils/consts';
import { TAB_KEY_OPEN_WEATHER_MAP, useWeatherInfoTabItems } from './hooks/weatherInfo';
import { clearPolling } from './service_worker/mainThread';
import { SearchCity, OpenWeatherMapWeatherInfo } from './types';

import './App.scss';

dayjs.extend(dayjsUtcPlugin);

function App() {
  const [ currentSearchCity, setCurrentSearchCity ] = useState('');
  const [ isFetchingSearchedCities, setIsFetchingSearchedCities ] = useState(false);
  const [ searchedCities, setSearchedCities ] = useState<SearchCity[]>([]);
  const [ selectedCity, setSelectedCity ] = useState<SearchCity>(null!);
  const [ currentActiveTabKey, setCurrentActiveTabKey ] = useState<string>(TAB_KEY_OPEN_WEATHER_MAP);

  const fetchSearchedCities = useCallback(debounce(async (city: string) => {
    setIsFetchingSearchedCities(true);

    const res = await openWeatherMapApi({
      url: '/data/2.5/find',
      data: {
        q: city,
        appid: OPEN_WEATHER_MAP_API_KEY,
      },
    });

    if (res.status === 200) {
      const cities = res.data.list.map(({ coord, id, name }: OpenWeatherMapWeatherInfo) => ({
        id,
        name,
        lat: coord.lat,
        lon: coord.lon,
      }));

      setSearchedCities(cities);
    } else {
      message.error('Cannot find places according to the name you entered. Please try to enter a different name.');
    }

    setIsFetchingSearchedCities(false);
  }, 1000) as Function, []);

  useEffect(() => {
    if (currentSearchCity) {
      fetchSearchedCities(currentSearchCity);
    }
  }, [ currentSearchCity, fetchSearchedCities ]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSearchCity((e.target as HTMLInputElement).value);
  }, []);

  const handleSelectCity = useCallback(async (clickedMenuItem: MenuInfo) => {
    const selectedCityId = Number(clickedMenuItem.key);
    const selectedCity = searchedCities.find(({ id }) => id === selectedCityId);

    if (selectedCity) {
      await clearPolling();

      setCurrentSearchCity('');
      setSearchedCities([]);
      setSelectedCity(selectedCity);
    }
  }, [ searchedCities ]);

  const weatherInfoTabItems = useWeatherInfoTabItems(currentActiveTabKey, selectedCity?.lat, selectedCity?.lon);

  const weatherApiTabsItems: TabsProps['items'] = weatherInfoTabItems.map(({ tabKey, tabLabel, isFetching, weatherInfo }) => ({
    key: tabKey,
    label: tabLabel,
    children: (
      isFetching
        ? <Spin size='large' spinning={ true } className='icon-is-fetching-weather' />
        : (weatherInfo && (
          <>
            <WeatherAlertsSettings selectedCity={ selectedCity } tabKey={ tabKey } />
            <WeatherInfoPanel weatherInfo={ weatherInfo } />
          </>
        ))
    ),
  }));

  const handleWeatherApiTabsChange = useCallback(async (activeKey: string) => {
    await clearPolling();

    setCurrentActiveTabKey(activeKey);
  }, []);

  return (
    <div className='app-page-root'>
      <div className='search-section'>
        <Input.Search
          placeholder='search city'
          enterButton='Search'
          value={ currentSearchCity }
          onChange={ handleSearchInputChange }
          loading={ isFetchingSearchedCities }
        />

        {
          currentSearchCity && !!searchedCities.length && (
            <Menu
              className='cities-dropdown-menu'
              theme='light'
              onClick={ handleSelectCity }
              items={searchedCities.map(({ id, name }) => ({
                key: id,
                label: name,
              }))}
            />
          )
        }
      </div>

      {
        selectedCity && (
          <Tabs
            className='weather-tabs'
            activeKey={ currentActiveTabKey }
            items={ weatherApiTabsItems }
            onChange={ handleWeatherApiTabsChange }
            destroyInactiveTabPane={ true }
          />
        )
      }
    </div>
  )
}

export default App
