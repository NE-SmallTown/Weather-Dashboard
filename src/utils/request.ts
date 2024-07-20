import originalAxios, { AxiosRequestConfig } from 'axios';
import qs from 'qs';

const API_HOST_OPEN_WEATHER_MAP = 'https://api.openweathermap.org';

const API_HOST_WEATHER_API = 'https://api.weatherapi.com';

const createApi = (baseURL: string) => {
    const axios = originalAxios.create({
        baseURL: baseURL,
        adapter: 'fetch',
    });

    axios.interceptors.response.use(
      response => {
          return {
              status: 200,
              data: response.data,
          } as any;
      },
      (error: any) => {
          const { response } = error;

          if (response) {
              if (response.status === 401 || response.status === 400) {
                  return { status: response.status, message: 'params wrong, bad request' };
              }

              return { status: response.status, message: error.message };
          }

          if (error.code === 'ECONNABORTED') {
              return { status: response.status, message: 'request timeout' };
          }

          return { status: response.status, message: 'please check the network and try again' };
      }
    );

    return ({
        method = 'GET',
        url,
        ...options
    }: {
        method?: string;
        url: string;
        data?: Record<string, any>;
        params?: Record<string, any>;
    }) => {
        if (!url) {
            throw Error('No url provided');
        }

        const newOptions: AxiosRequestConfig = {
            paramsSerializer: (params: Record<string, any>) => {
                return qs.stringify(params, { arrayFormat: 'comma' });
            },
            validateStatus: (status: number) => {
                return status >= 200 && status < 300;
            },
            method,
            url,
            timeout: 40000,
            withCredentials: false,
            ...options,
        };

        const data = newOptions.data || {};

        if (newOptions.params && method.toLowerCase() === 'get') {
            newOptions.params = options.params;

            delete newOptions.data;
        } else if (Object.keys(data).length && method.toLowerCase() === 'get') {
            newOptions.params = data;

            delete newOptions.data;
        } else {
            newOptions.params = options.params;
            newOptions.data = data;
        }

        return axios(newOptions);
    }
};

export const openWeatherMapApi = createApi(API_HOST_OPEN_WEATHER_MAP);

export const weatherApi = createApi(API_HOST_OPEN_WEATHER_MAP);