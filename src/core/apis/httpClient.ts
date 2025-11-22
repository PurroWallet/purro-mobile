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
        'Content-Type': 'application/json, text/plain, */*',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Generate curl command for debugging (only in development)
        if (__DEV__) {
          const curlCommand = this.generateCurlCommand(config);
          console.log('🔵 API Request (curl):\n', curlCommand);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }
        return response;
      },
      (error) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          console.error(`❌ API Error [${status}]:`, data);
        } else if (error.request) {
          // Request made but no response
          console.error('❌ Network Error:', error.message);
        } else {
          // Something else happened
          console.error('❌ Request Error:', error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Generate curl command from axios config for debugging
   */
  private generateCurlCommand(config: AxiosRequestConfig): string {
    const method = (config.method || 'GET').toUpperCase();
    const url = this.buildFullUrl(config);
    const headers = config.headers || {};

    let curl = `curl -X ${method}`;

    // Add headers
    for (const [key, value] of Object.entries(headers)) {
      if (value && typeof value === 'string') {
        curl += ` \\\n  -H "${key}: ${value}"`;
      }
    }

    // Add data for POST/PUT/PATCH
    if (config.data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      const dataStr = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      curl += ` \\\n  -d '${dataStr}'`;
    }

    // Add URL
    curl += ` \\\n  "${url}"`;

    return curl;
  }

  /**
   * Build full URL from config
   */
  private buildFullUrl(config: AxiosRequestConfig): string {
    const baseURL = config.baseURL || this.instance.defaults.baseURL || '';
    const url = config.url || '';

    // Combine base URL and path
    let fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

    // Add query parameters
    if (config.params) {
      const params = new URLSearchParams(config.params);
      const queryString = params.toString();
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    return fullUrl;
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
