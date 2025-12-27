'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';

export default function SignupPage() {
  const router = useRouter();
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
  const [showSuccess, setShowSuccess] = useState(false);

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

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          if (response.ok) {
            const data = await response.json();
            // Handle successful registration
            console.log('Registration successful:', data);
            // Show success message
            setShowSuccess(true);
            // Reset form
            setEmail('');
            setPassword('');
            setFullName('');
            setPhone('');
            // Redirect to login page after 2 seconds
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          } else {
            const error = await response.json();
            setErrors({ email: error.message || 'Registration failed' });
          }
        } else {
          setErrors({ email: 'Registration failed. Please try again later.' });
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ email: 'An error occurred. Please try again.' });
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
            <div className="col-lg-6 col-md-8">
              <div className="card shadow">
                <div className="card-body p-5">
                  <h2 className="text-center mb-4">Sign Up</h2>
                  {showSuccess && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                      <i className="fa fa-check-circle me-2"></i>
                      <strong>Registration Successful!</strong> You have been registered successfully. Redirecting to login page...
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowSuccess(false)}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}
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
                        placeholder="Enter your email"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="signupPassword" className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="signupPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="signupFullName" className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                        id="signupFullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="signupPhone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        id="signupPhone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number (optional)"
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>

                    <div className="d-grid gap-2 mb-3">
                      <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Signing up...' : 'Sign Up'}
                      </button>
                    </div>
                  </form>
                  <div className="text-center mt-3">
                    <p className="mb-0">
                      Already have an account?{' '}
                      <Link href="/login" className="text-primary text-decoration-none">
                        Login now
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
