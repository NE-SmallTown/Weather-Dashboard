import React, { useCallback, useEffect, useState } from 'react';
import { Menu, Input, Spin, Tabs, TabsProps } from 'antd';
import { MenuInfo } from 'rc-menu/es/interface';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';
import WeatherInfoPanel from './components/WeatherInfoPanel.tsx';
import { openWeatherMapApi } from './utils/request';
import { OPEN_WEATHER_MAP_API_KEY } from './utils/consts.ts';
import { SearchCity, OpenWeatherMapWeatherInfo, UnifiedWeatherInfo } from './types';

import './App.scss';
import {useWeatherInfoTabItems} from './hooks/weatherInfo.tsx';

dayjs.extend(dayjsUtcPlugin);

function App() {
  const [ currentSearchCity, setCurrentSearchCity ] = useState('');
  const [ isFetchingSearchedCities, setIsFetchingSearchedCities ] = useState(false);
  const [ searchedCities, setSearchedCities ] = useState<SearchCity[]>([]);
  const [ selectedCity, setSelectedCity ] = useState<SearchCity>(null!);

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
      // TODO 下拉菜单展示输入字符有误请重新输入
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
      setCurrentSearchCity('');
      setSearchedCities([]);
      setSelectedCity(selectedCity);
    }
  }, [ searchedCities ]);

  const weatherInfoTabItems = useWeatherInfoTabItems(selectedCity?.lat, selectedCity?.lon);

  const weatherApiTabsItems: TabsProps['items'] = weatherInfoTabItems.map(({ id, label, isFetching, weatherInfo }) => ({
    key: id,
    label: label,
    children: (
      isFetching
        ? <Spin size='large' spinning={ true } className='icon-is-fetching-weather' />
        : <WeatherInfoPanel weatherInfo={ weatherInfo } />
    ),
  }));

  const handleWeatherApiTabsChange = useCallback(() => {
    // todo
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
        selectedCity && <Tabs items={ weatherApiTabsItems } onChange={ handleWeatherApiTabsChange } />
      }
    </div>
  )
}

export default App
