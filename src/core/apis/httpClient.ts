import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

// Base configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';

class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string = BASE_URL) {
    this.instance = axios.create({
      baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          console.error(`API Error [${status}]:`, data);
        } else if (error.request) {
          // Request made but no response
          console.error('Network Error:', error.message);
        } else {
          // Something else happened
          console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  setAuthToken(token: string): void {
    this.instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.instance.defaults.headers.common.Authorization;
  }

  setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
  }
}

export const httpClient = new HttpClient();
export default httpClient;
