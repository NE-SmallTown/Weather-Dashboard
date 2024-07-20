import { TEMPERATURE_KELVIN } from './consts.ts';

// convert kelvin to centigrade degree
export const kelvin2centigrade = (kelvinNum: number) => (kelvinNum - TEMPERATURE_KELVIN).toFixed(0);

export const formatMeters = (meters: number): string => {
  if (meters < 1000) {
    return `${meters}m`;
  }

  return `${(meters/1000).toFixed(1)}km`;
};