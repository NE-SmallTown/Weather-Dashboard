import dayjs from 'dayjs';
import dayjsUtcPlugin from 'dayjs/plugin/utc';
import { ArrowDownOutlined } from '@ant-design/icons';
import { formatMeters } from '../utils';
import { UnifiedWeatherInfo } from '../types';
import { ReactComponent as IconPressure } from '../assets/imgs/icon-pressure.svg';

import './WeatherInfoPanel.scss';

dayjs.extend(dayjsUtcPlugin);

function WeatherInfoPanel(props: { weatherInfo: UnifiedWeatherInfo }) {
  const {
    localtime,
    temperature,
    pressure,
    feelsLikeTemperature,
    description,
    name,
    country,
    weatherIcon,
    wind,
    humidity,
    visibility,
  } = props.weatherInfo;

  return (
    <div className='weather-info-section'>
      <div className='city-time'>
        { localtime }
      </div>

      <div className='city-name'>
        { `${name}, ${country}` }
      </div>

      <div className='city-temperature'>
        <img src={ weatherIcon } />

        <span>{ `${temperature}°C` }</span>
      </div>

      <div className='brief-intro'>{ `Feels like ${feelsLikeTemperature}°C. ${description}.` }</div>

      <div className="weather-condition">
        <div className='row'>
          <span className="wind-direction">
            <ArrowDownOutlined
              className="icon-wind"
              style={{
                transform: `rotate(${wind.deg}deg)`,
              }}
            />

            <span>{`${wind.speed}m/s`}</span>
          </span>

          <span className="weather-pressure">
            <IconPressure className="icon-pressure"/>

            <span>{`${pressure}hPa`}</span>
          </span>
        </div>

        <div className='row'>
          <span className='weather-humidity'>{`Humidity: ${humidity}%`}</span>

          <span className='weather-visibility'>{`Visibility: ${formatMeters(visibility)}`}</span>
        </div>
      </div>
    </div>
  )
}

export default WeatherInfoPanel
