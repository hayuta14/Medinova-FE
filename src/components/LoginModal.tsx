'use client';

import { useState } from 'react';

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({ show, onHide, onSwitchToSignup }: LoginModalProps) {
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
        // TODO: Replace with your actual API endpoint
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          // Handle successful login (e.g., save token, redirect)
          console.log('Login successful:', data);
          onHide();
          // Reset form
          setEmail('');
          setPassword('');
        } else {
          const error = await response.json();
          setErrors({ password: error.message || 'Login failed' });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ password: 'An error occurred. Please try again.' });
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
                  <label htmlFor="loginPassword" className="form-label">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
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

