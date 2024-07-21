import React, { useCallback, useEffect, useState } from 'react';
import { Input, Button } from 'antd';
import {
  SERVICE_WORKER_ACTION_EXCEED_TEMP_THRESHOLD,
  SERVICE_WORKER_ACTION_SET_TEMP_THRESHOLD,
} from '../utils/consts.ts';
import { SearchCity } from '../types';

import './WeatherAlertsSettings.scss';

function WeatherAlertsSettings({ selectedCity, tabKey }: { selectedCity: SearchCity; tabKey: string; }) {
  const [ temperatureThreshold, setTemperatureThreshold ] = useState<number>();

  useEffect(() => {
    const handler = (e: MessageEvent) =>  {
      const res = e.data;

      switch (res.action) {
        case SERVICE_WORKER_ACTION_EXCEED_TEMP_THRESHOLD: {
          const { currentTemperature, tabKey: alertTabKey } = res;

          if (alertTabKey === tabKey) {
            console.log(`show notification for ${selectedCity.name}: `, currentTemperature, temperatureThreshold)
            new Notification(`Excessive Heat Warning(${selectedCity.name})`, {
              icon: '/Weather-Dashboard/icon-temperature-alert.png',
              body: `${currentTemperature}°C exceeds your temperature alert settings(${temperatureThreshold}°C)`,
            });
          }

          break;
        }
        default: {
          break;
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handler);
    };
  }, [ selectedCity, tabKey, temperatureThreshold ]);

  const handleClickSubmit = useCallback(async () => {
    if (selectedCity) {
      const registration = await navigator.serviceWorker.getRegistration();

      if (registration) {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            action: SERVICE_WORKER_ACTION_SET_TEMP_THRESHOLD,
            tabKey,
            lat: selectedCity.lat,
            lon: selectedCity.lon,
            temperatureThreshold,
          });
        } else {
          console.log('No service worker controller found. Try refreshing the page.');
        }
      }
    }
  }, [ tabKey, selectedCity, temperatureThreshold ]);

  const handleTemperatureThresholdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperatureThreshold(Number(e.target.value));
  }, []);

  return (
    <div className='weather-alerts-settings'>
      <span className='label'>Temperature Threshold:</span>

      <Input
        type='number'
        className='temperature-threshold-input'
        value={ temperatureThreshold }
        onChange={ handleTemperatureThresholdChange }
      />

      <Button onClick={ handleClickSubmit }>Submit</Button>
    </div>
  )
}

export default WeatherAlertsSettings
