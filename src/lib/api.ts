// lib/api.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, removeToken } from '@/utils/auth';

// Helper function để tạo silent error cho auth requests
function createSilentError(response: any, config: any, status: number): any {
  const error: any = new Error(`Request failed with status code ${status}`);
  error.response = response;
  error.config = config;
  error.status = status;
  error._isSilent = true; // Đánh dấu để suppress console logging
  error.name = 'AxiosError';
  return error;
}

// Suppress console.error cho silent errors trong development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Không log nếu là silent error (auth requests)
    if (args[0]?._isSilent === true) {
      return;
    }
    // Kiểm tra nếu error trong stack trace có _isSilent
    const errorArg = args.find(arg => arg?._isSilent === true);
    if (errorArg) {
      return;
    }
    originalError.apply(console, args);
  };
}

// Tạo axios instance với base URL
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  // Không throw error cho các status codes, để có thể xử lý trong interceptor
  validateStatus: (status) => {
    // Luôn return true để không throw error tự động
    // Error sẽ được xử lý trong response interceptor
    return true;
  },
});

// Request interceptor để thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý response và lỗi
axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu status code là error (4xx, 5xx), throw error để có thể catch trong component
    if (response.status >= 400) {
      const isAuthRequest = response.config?.url?.includes('/auth/login') || 
                           response.config?.url?.includes('/auth/register');
      
      // Xử lý lỗi 401 (Unauthorized)
      if (response.status === 401) {
        const isLoginPage = typeof window !== 'undefined' && 
          (window.location.pathname === '/login' || 
           window.location.pathname === '/signup');
        const isValidateToken = response.config?.url?.includes('/auth/validate-token');
        
        // Chỉ xóa token và redirect nếu không phải là lỗi từ request login/register/validate-token
        // (validate-token sẽ được xử lý bởi RequireAuth component)
        if (!isAuthRequest && !isLoginPage && !isValidateToken) {
          removeToken();
          // Trigger custom event để update Navbar
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth-change'));
            window.location.href = '/login';
          }
        }
      }
      
      // Sử dụng silent error cho auth requests để không log ra console
      if (isAuthRequest) {
        const error = createSilentError(response, response.config, response.status);
        return Promise.reject(error);
      } else {
        // Các request khác sử dụng error thông thường
        const error: any = new Error(`Request failed with status code ${response.status}`);
        error.response = response;
        error.config = response.config;
        error.status = response.status;
        return Promise.reject(error);
      }
    }
    // Nếu thành công, return response bình thường
    return response;
  },
  (error) => {
    // Xử lý network errors hoặc các lỗi khác
    return Promise.reject(error);
  }
);

// Mutator function cho Orval - trả về response.data thay vì toàn bộ response
export const api = async <T = any, D = any>(
  config: AxiosRequestConfig<D>
): Promise<T> => {
  try {
    const response = await axiosInstance.request<T, AxiosResponse<T>, D>(config);
    return response.data;
  } catch (error: any) {
    // SilentAxiosError đã được xử lý trong interceptor, chỉ cần throw lại
    // Component vẫn có thể lấy message từ error.response.data.message
    throw error;
  }
};