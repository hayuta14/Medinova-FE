'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, getUser, removeToken } from '@/utils/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUserState] = useState<any>(null);

  useEffect(() => {
    // Check authentication status on mount and when pathname changes
    const checkAuth = () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      if (auth) {
        setUserState(getUser());
      } else {
        setUserState(null);
      }
    };
    checkAuth();
    
    // Listen for storage changes (when token is set/removed in other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };
    
    // Listen for custom auth-change event (when login/logout happens in same tab)
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    setAuthenticated(false);
    setUserState(null);
    // Trigger custom event to update Navbar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="container-fluid sticky-top bg-white shadow-sm">
      <div className="container">
        <nav className="navbar navbar-expand-lg bg-white navbar-light py-3 py-lg-0">
          <Link href="/" className="navbar-brand">
            <h1 className="m-0 text-uppercase text-primary">
              <i className="fa fa-clinic-medical me-2"></i>Medinova
            </h1>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ms-auto py-0 align-items-center">
              <Link
                href="/"
                className={`nav-item nav-link ${isActive('/') && pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`nav-item nav-link ${isActive('/about') ? 'active' : ''}`}
              >
                About
              </Link>
              <Link
                href="/service"
                className={`nav-item nav-link ${isActive('/service') ? 'active' : ''}`}
              >
                Service
              </Link>
              <Link
                href="/price"
                className={`nav-item nav-link ${isActive('/price') ? 'active' : ''}`}
              >
                Pricing
              </Link>
              <div className="nav-item dropdown">
                <a
                  href="#"
                  className={`nav-link dropdown-toggle ${isActive('/blog') || isActive('/detail') || isActive('/team') || isActive('/testimonial') || isActive('/appointment') || isActive('/search') ? 'active' : ''}`}
                  data-bs-toggle="dropdown"
                >
                  Pages
                </a>
                <div className="dropdown-menu m-0">
                  <Link href="/blog" className="dropdown-item">
                    Blog Grid
                  </Link>
                  <Link href="/detail" className="dropdown-item">
                    Blog Detail
                  </Link>
                  <Link href="/team" className="dropdown-item">
                    The Team
                  </Link>
                  <Link href="/testimonial" className="dropdown-item">
                    Testimonial
                  </Link>
                  <Link href="/appointment" className="dropdown-item">
                    Appointment
                  </Link>
                  <Link href="/search" className="dropdown-item">
                    Search
                  </Link>
                </div>
              </div>
              <Link
                href="/contact"
                className={`nav-item nav-link ${isActive('/contact') ? 'active' : ''}`}
              >
                Contact
              </Link>
              <div className="nav-item dropdown ms-lg-3 mt-3 mt-lg-0">
                <a
                  href="#"
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fa fa-user-circle me-2" style={{ fontSize: '24px' }}></i>
                  {authenticated && user && (
                    <span className="d-none d-md-inline ms-1">{user.email || user.fullName || 'User'}</span>
                  )}
                </a>
                <div className="dropdown-menu dropdown-menu-end m-0">
                  {authenticated ? (
                    <>
                      {user && (
                        <div className="dropdown-item-text">
                          <small className="text-muted">Signed in as</small>
                          <div className="fw-bold">{user.email || user.fullName || 'User'}</div>
                        </div>
                      )}
                      <div className="dropdown-divider"></div>
                      <Link href="/profile" className="dropdown-item">
                        <i className="fa fa-user me-2"></i>Profile
                      </Link>
                      <Link href="/medical-history" className="dropdown-item">
                        <i className="fa fa-history me-2"></i>Medical History
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                        style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                      >
                        <i className="fa fa-sign-out-alt me-2"></i>Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="dropdown-item">
                        <i className="fa fa-sign-in-alt me-2"></i>Login
                      </Link>
                      <Link href="/signup" className="dropdown-item">
                        <i className="fa fa-user-plus me-2"></i>Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

