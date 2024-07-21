// In practice, we need to store this api key in the server side. Given that we don't have server-related code in
// this challenge, we store it here instead.
export const OPEN_WEATHER_MAP_API_KEY = '90950f81b72fcbd2ec8b1627591942c1';
export const WEATHER_API_API_KEY = '213a8c87f1614efb8fe155652242007';

export const TEMPERATURE_KELVIN = 273.15;

export const SERVICE_WORKER_ACTION_SET_TEMP_THRESHOLD = 'setTemperatureThreshold';
export const SERVICE_WORKER_ACTION_EXCEED_TEMP_THRESHOLD = 'exceedTemperatureThreshold';
export const SERVICE_WORKER_ACTION_CLEAR_POLLING = 'clearPolling';