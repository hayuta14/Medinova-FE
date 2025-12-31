'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken, setUser } from '@/utils/auth';
import { getAuthentication } from '@/generated/api/endpoints/authentication/authentication';

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({ show, onHide, onSwitchToSignup }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email should be valid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const authApi = getAuthentication();
        const response = await authApi.login({ email, password });

        // API trả về: { success: true, message: "...", data: { token: "...", ... } }
        const token = response.data?.token || response.token;
        const userData = response.data || response;

        // Save JWT token to localStorage
        if (token) {
          setToken(token);
          
          // Save đầy đủ thông tin user từ API để phục vụ hiển thị
          if (userData) {
            setUser({
              token: token,
              tokenType: userData.tokenType || 'Bearer',
              userId: userData.userId,
              email: userData.email,
              fullName: userData.fullName,
              role: userData.role,
              // Lưu tất cả các thông tin khác từ API nếu có
              ...userData,
            });
          }
          
          console.log('Login successful:', response);
          
          // Trigger custom event to update Navbar
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth-change'));
          }
          
          onHide();
          // Reset form
          setEmail('');
          setPassword('');
          // Refresh page to update UI
          router.refresh();
        } else {
          setErrors({ password: 'Login failed: No token received' });
        }
      } catch (error: any) {
        // Lấy message từ API response
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'An error occurred. Please try again.';
        setErrors({ password: errorMessage });
        // Chỉ log error trong development mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Login error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: 'block' }}
        tabIndex={-1}
        role="dialog"
        onClick={onHide}
      >
        <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Đăng Nhập</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginEmail" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="loginEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="loginPassword" className="form-label mb-0">
                      Mật khẩu <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-primary text-decoration-none small"
                      onClick={(e) => {
                        e.preventDefault();
                        onHide();
                        router.push('/forgot-password');
                      }}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="loginPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-footer justify-content-center">
              <p className="mb-0">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={onSwitchToSignup}
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onHide}></div>
    </>
  );
}

