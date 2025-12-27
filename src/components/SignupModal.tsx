'use client';

import { useState } from 'react';

interface SignupModalProps {
  show: boolean;
  onHide: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ show, onHide, onSwitchToLogin }: SignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {
      email?: string;
      password?: string;
      fullName?: string;
      phone?: string;
    } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email should be valid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // TODO: Replace with your actual API endpoint
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            fullName,
            phone: phone || undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Handle successful registration
          console.log('Registration successful:', data);
          onHide();
          // Reset form
          setEmail('');
          setPassword('');
          setFullName('');
          setPhone('');
          // Optionally switch to login modal
          onSwitchToLogin();
        } else {
          const error = await response.json();
          setErrors({ email: error.message || 'Registration failed' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ email: 'An error occurred. Please try again.' });
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
              <h5 className="modal-title">Đăng Ký</h5>
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
                  <label htmlFor="signupEmail" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="signupEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="signupPassword" className="form-label">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="signupPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="signupFullName" className="form-label">
                    Họ và tên <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    id="signupFullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="signupPhone" className="form-label">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    id="signupPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại (tùy chọn)"
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-footer justify-content-center">
              <p className="mb-0">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={onSwitchToLogin}
                >
                  Đăng nhập ngay
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

