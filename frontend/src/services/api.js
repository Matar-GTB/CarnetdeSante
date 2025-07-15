// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // pour cookie httpOnly de refresh
});

let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const { config, response } = err;
    if (response?.status === 401 && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(tok => {
          config.headers.Authorization = `Bearer ${tok}`;
          return api(config);
        });
      }

      config._retry = true;
      isRefreshing = true;

      return api.post('/auth/refresh-token').then(({ data }) => {
        localStorage.setItem('token', data.token);
        processQueue(null, data.token);
        config.headers.Authorization = `Bearer ${data.token}`;
        return api(config);
      }).catch(err2 => {
        processQueue(err2, null);
        // si refresh échoue, purge token
        localStorage.removeItem('token');
        return Promise.reject(err2);
      }).finally(() => {
        isRefreshing = false;
      });
    }
    return Promise.reject(err);
  }
);

export default api;
