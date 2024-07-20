import originalAxios from 'axios';
import qs from 'qs';

const API_HOST = 'https://api.openweathermap.org';

const axios = originalAxios.create({
    baseURL: API_HOST,
    adapter: 'fetch',
});

axios.interceptors.response.use(
    response => {
        return {
            status: 200,
            data: response.data,
        } as any;
    },
    (error) => {
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

export default function request({
    method = 'GET',
    url,
    ...options
}) {
    if (!url) {
        throw Error('No url provided');
    }

    const newOptions = {
        paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'comma' });
        },
        validateStatus: status => {
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