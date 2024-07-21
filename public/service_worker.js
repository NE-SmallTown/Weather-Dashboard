console.log('service_worker.js begins');

const WEATHER_POLLING_INTERVAL = 30 * 1000; // detect every 30s

function main() {
  self.addEventListener('install', () => {
    console.log('Service worker installed');
    // Skip over the "waiting" lifecycle state, to ensure that our
    // new service worker is activated immediately
    // https://stackoverflow.com/questions/70305868/serviceworker-activate-and-message-events-not-firing
    self.skipWaiting();
  });

  self.addEventListener('activate', () => {
    console.log('Service worker now active');
  });

  let intervalTimerIds = [];
  self.addEventListener('message', async event => {
    console.log('service worker side', event.data);

    const res = event.data;

    switch (res.action) {
      case 'setTemperatureThreshold': {
        const { tabKey, lat, lon, temperatureThreshold } = res;

        // monitor if the temperature exceeds the threshold by polling
        const timerId = setInterval(async () => {
          let resTemperature = null;

          console.log('fetching starts in the service worker')
          if (tabKey === 'open-weather-map') {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=90950f81b72fcbd2ec8b1627591942c1`)
              .then(res => res.json());

            resTemperature = Number((res.main.temp - 273.15).toFixed(0));
          } else if (tabKey === 'weather-api') {
            const res = await fetch(`https://api.weatherapi.com/v1/current.json?q=${lat},${lon}&aqi=no&key=213a8c87f1614efb8fe155652242007`)
              .then(res => res.json());

            resTemperature = res.current.temp_c;
          }

          console.log('fetching finished in the service worker', resTemperature, temperatureThreshold)
          if (resTemperature && resTemperature > temperatureThreshold) {
            event.source.postMessage({
              action: 'exceedTemperatureThreshold',
              currentTemperature: resTemperature,
              tabKey,
            });
          }
        }, WEATHER_POLLING_INTERVAL);

        intervalTimerIds.push(timerId);
        console.log('intervalTimerIds: ', intervalTimerIds);

        break;
      }

      case 'clearPolling': {
        console.log('clearPolling', intervalTimerIds);
        intervalTimerIds.forEach(timerId => {
          clearInterval(timerId);
        });
        intervalTimerIds = [];
        console.log('clearPolling', intervalTimerIds);

        break;
      }

      default: {
        break;
      }
    }
  });
}

main();

console.log('service_worker.js ends');