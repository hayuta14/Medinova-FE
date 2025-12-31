'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { setToken, setUser } from '@/utils/auth';
import { getAuthentication } from '@/generated/api/endpoints/authentication/authentication';

export default function LoginPage() {
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
          
          console.log('Login successful, token saved to localStorage');
          
          // Trigger custom event to update Navbar
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth-change'));
          }
          
          // Redirect to home or dashboard
          router.push('/');
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

  return (
    <>
      <Topbar />
      <Navbar />
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="card shadow">
                <div className="card-body p-5">
                  <h2 className="text-center mb-4">Login</h2>
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
                      placeholder="Enter your email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="loginPassword" className="form-label mb-0">
                        Password <span className="text-danger">*</span>
                      </label>
                      <Link href="/forgot-password" className="text-primary text-decoration-none small">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="loginPassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  <div className="d-grid gap-2 mb-3">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                  </div>
                  </form>
                  <div className="text-center">
                    <p className="mb-0">
                      Don't have an account?{' '}
                      <Link href="/signup" className="text-primary text-decoration-none">
                        Sign up now
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  );
}

