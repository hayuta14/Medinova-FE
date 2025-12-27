'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { setToken, setUser } from '@/utils/auth';

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
        // TODO: Replace with your actual API endpoint
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          if (response.ok) {
            const data = await response.json();
            // Save JWT token to localStorage
            if (data.token || data.accessToken) {
              const token = data.token || data.accessToken;
              setToken(token);
              // Save user info if available
              if (data.user) {
                setUser(data.user);
              }
              console.log('Login successful, token saved to localStorage');
              // Trigger custom event to update Navbar
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('auth-change'));
              }
            }
            // Redirect to home or dashboard
            router.push('/');
          } else {
            const error = await response.json();
            setErrors({ password: error.message || 'Login failed' });
          }
        } else {
          setErrors({ password: 'Login failed. Please try again later.' });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ password: 'An error occurred. Please try again.' });
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
                    <label htmlFor="loginPassword" className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
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

