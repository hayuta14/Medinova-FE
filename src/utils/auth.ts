// Utility functions for authentication

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Kiểm tra token trong key 'token' trước
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }

    // Nếu không có, kiểm tra trong 'auth-storage' (có thể từ state management library)
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        // Có thể có cấu trúc: { state: { accessToken: "...", ... } }
        if (parsed?.state?.accessToken) {
          return parsed.state.accessToken;
        }
        // Hoặc cấu trúc khác: { accessToken: "..." }
        if (parsed?.accessToken) {
          return parsed.accessToken;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }

    // Kiểm tra các key khác có thể chứa token
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      return accessToken;
    }
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    // Xóa các key auth-related cơ bản
    const authKeys = ['token', 'user', 'accessToken', 'refreshToken', 'authToken', 'jwt', 'auth-storage', 'userProfile'];
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Xóa tất cả keys bắt đầu với 'auth_', 'user_', hoặc 'token_' nếu có
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('auth_') || key.startsWith('user_') || key.startsWith('token_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

export const getUser = (): any | null => {
  if (typeof window !== 'undefined') {
    // Kiểm tra user trong key 'user' trước
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Nếu không có, kiểm tra trong 'userProfile'
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const parsed = JSON.parse(userProfile);
        return parsed;
      }
    } catch (e) {
      // Ignore parse errors
    }

    // Kiểm tra trong 'auth-storage' nếu có user info
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        // Có thể có user info trong state
        if (parsed?.state?.user) {
          return parsed.state.user;
      }
        if (parsed?.user) {
          return parsed.user;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  return null;
};

export const setUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Migrate data từ auth-storage sang token và user keys để đồng bộ
 * Chỉ migrate một lần khi phát hiện có auth-storage nhưng chưa có token/user
 */
export const migrateAuthStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // Chỉ migrate nếu chưa có token/user nhưng có auth-storage
  const existingToken = localStorage.getItem('token');
  const existingUser = localStorage.getItem('user');
  
  if (existingToken && existingUser) {
    // Đã có data mới, không cần migrate
    return;
  }

  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      
      // Migrate token
      if (!existingToken) {
        const token = parsed?.state?.accessToken || parsed?.accessToken;
        if (token) {
          localStorage.setItem('token', token);
        }
      }

      // Migrate user
      if (!existingUser) {
        const user = parsed?.state?.user || parsed?.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // Thử lấy từ userProfile
          const userProfile = localStorage.getItem('userProfile');
          if (userProfile) {
            localStorage.setItem('user', userProfile);
          }
        }
      }
    }
  } catch (e) {
    // Ignore migration errors
  }
};

