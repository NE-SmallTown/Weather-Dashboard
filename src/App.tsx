import React, { useCallback, useEffect, useState } from 'react';
import { Menu, Input, Spin } from 'antd';
import { MenuInfo } from 'rc-menu/es/interface';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';
import WeatherInfoPanel from './components/WeatherInfoPanel.tsx';
import request from './utils/request';
import { OPEN_WEATHER_MAP_API_KEY } from './utils/consts.ts';
import { SearchCity, CityWeatherInfo } from './types';

import './App.scss';

dayjs.extend(dayjsUtcPlugin);

function App() {
  const [ currentSearchCity, setCurrentSearchCity ] = useState('');
  const [ isFetchingCities, setIsFetchingCities ] = useState(false);
  const [ searchedCities, setSearchedCities ] = useState<SearchCity[]>([]);
  const [ isFetchingWeatherInfo, setIsFetchingWeatherInfo ] = useState(false);
  const [ selectedCityWeatherInfo, setSelectedCityWeatherInfo ] = useState<CityWeatherInfo>(null);

  const fetchSearchedCities = useCallback(debounce(async (city: string) => {
    setIsFetchingCities(true);

    const res = await request({
      url: '/data/2.5/find',
      data: {
        q: city,
        appid: OPEN_WEATHER_MAP_API_KEY,
      },
    });

    if (res.status === 200) {
      const cities = res.data.list.map(({ coord, id, name }) => ({
        id,
        name,
        lat: coord.lat,
        lon: coord.lon,
      }));

      setSearchedCities(cities);
    } else {
      // TODO 下拉菜单展示输入字符有误请重新输入
    }

    setIsFetchingCities(false);
  }, 1000), []);

  useEffect(() => {
    if (currentSearchCity) {
      fetchSearchedCities(currentSearchCity);
    }
  }, [ currentSearchCity, fetchSearchedCities ]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSearchCity((e.target as HTMLInputElement).value);
  }, []);

  const fetchCityWeatherInfo = useCallback(async (city: SearchCity) => {
    setIsFetchingWeatherInfo(true);

    const res = await request({
      url: '/data/2.5/weather',
      data: {
        lat: city.lat,
        lon: city.lon,
        appid: OPEN_WEATHER_MAP_API_KEY,
      },
    });

    if (res.status === 200) {
      console.log(666666, res);

      setSelectedCityWeatherInfo(res.data);
    } else {
      // TODO 提示错误
    }

    setIsFetchingWeatherInfo(false);
  }, []);

  const handleSelectCity = useCallback(async (clickedMenuItem: MenuInfo) => {
    const selectedCityId = Number(clickedMenuItem.key);
    const selectedCity = searchedCities.find(({ id }) => id === selectedCityId);

    setCurrentSearchCity('');
    await fetchCityWeatherInfo(selectedCity);
  }, [ searchedCities ]);

  return (
    <div className='app-page-root'>
      <div className='search-section'>
        <Input.Search
          placeholder='search city'
          enterButton='Search'
          value={ currentSearchCity }
          onChange={ handleSearchInputChange }
          loading={ isFetchingCities }
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
        isFetchingWeatherInfo
          ? <Spin size='large' spinning={ true } className='icon-is-fetching-weather' />
          : (selectedCityWeatherInfo && <WeatherInfoPanel weatherInfo={ selectedCityWeatherInfo } />)
      }
    </div>
  )
}

export default App
