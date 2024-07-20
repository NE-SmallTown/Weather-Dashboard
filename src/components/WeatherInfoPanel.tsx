import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';
import { ArrowDownOutlined } from '@ant-design/icons';
import { formatMeters, kelvin2centigrade } from '../utils';
import { CityWeatherInfo } from '../types';
import { ReactComponent as IconPressure } from '../assets/imgs/icon-pressure.svg';

import './WeatherInfoPanel.scss';

dayjs.extend(dayjsUtcPlugin);

function WeatherInfoPanel(props: { weatherInfo: CityWeatherInfo }) {
  const { weatherInfo } = props;
  const cityTimezoneOffset = weatherInfo.timezone / 60; // in minutes, like 240(UTC+4) means 240 minutes ahead of UTC time
  const cityTemperature = kelvin2centigrade(weatherInfo.main.temp);
  const cityFeelsLikeTemperature = kelvin2centigrade(weatherInfo.main.feels_like);
  const weatherDesc = weatherInfo.weather[0].description[0].toUpperCase() + weatherInfo.weather[0].description.slice(1);

  return (
    <div className='weather-info-section'>
      <div className='city-time'>
        {
          dayjs().utc().utcOffset(cityTimezoneOffset).format('DD/MM/YYYY HH:mm')
        }
      </div>

      <div className='city-name'>
        { `${weatherInfo.name}, ${weatherInfo.sys.country}` }
      </div>

      <div className='city-temperature'>
        {/*
          https://openweathermap.org/weather-conditions:
          > NOTE: It is possible to meet more than one weather condition for a requested location.
          The first weather condition in API respond is primary.

          So we use weather[0].icon here.
        */}
        <img src={`https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`} />

        <span>{ `${cityTemperature}°C` }</span>
      </div>

      <div className='brief-intro'>{ `Feels like ${cityFeelsLikeTemperature}°C. ${weatherDesc}.` }</div>

      <div className="weather-condition">
        <div className='row'>
          <span className="wind-direction">
            <ArrowDownOutlined
              className="icon-wind"
              style={{
                transform: `rotate(${weatherInfo.wind.deg}deg)`,
              }}
            />

            <span>{`${weatherInfo.wind.speed}m/s`}</span>
          </span>

          <span className="weather-pressure">
            <IconPressure className="icon-pressure"/>

            <span>{`${weatherInfo.main.pressure}hPa`}</span>
          </span>
        </div>

        <div className='row'>
          <span className='weather-humidity'>{`Humidity: ${weatherInfo.main.humidity}%`}</span>

          <span className='weather-visibility'>{`Visibility: ${formatMeters(weatherInfo.visibility)}`}</span>
        </div>
      </div>
    </div>
  )
}

export default WeatherInfoPanel
