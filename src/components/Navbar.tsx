"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  isAuthenticated,
  getUser,
  removeToken,
  getToken,
  migrateAuthStorage,
} from "@/utils/auth";
import { getAuthentication } from "@/generated/api/endpoints/authentication/authentication";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // State để track khi component đã mount (chỉ trên client)
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUserState] = useState<any>(null);

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);

    // Check authentication status ngay khi component mount
    const checkAuth = () => {
      if (typeof window === "undefined") {
        return;
      }

      // Migrate data từ auth-storage nếu cần
      migrateAuthStorage();

      // Kiểm tra token trong localStorage
      const token = getToken();
      const auth = isAuthenticated();

      setAuthenticated(auth);

      // Nếu có token, load user info từ localStorage
      if (auth && token) {
        const userData = getUser();
        if (userData) {
          setUserState(userData);
        } else {
          // Nếu không có user data, set null
          setUserState(null);
        }
      } else {
        // Không có token, clear user state
        setUserState(null);
      }
    };

    // Check ngay khi mount
    checkAuth();

    // Listen for storage changes (when token is set/removed in other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        checkAuth();
      }
    };

    // Listen for custom auth-change event (when login/logout happens in same tab)
    const handleAuthChange = () => {
      checkAuth();
    };

    // Listen for avatar update event
    const handleAvatarUpdate = () => {
      checkAuth();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("auth-change", handleAuthChange);
      window.addEventListener("avatar-updated", handleAvatarUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("auth-change", handleAuthChange);
        window.removeEventListener("avatar-updated", handleAvatarUpdate);
      }
    };
  }, [pathname]); // Re-check khi pathname thay đổi

  const handleLogout = async () => {
    try {
      // Gọi API logout để invalidate token ở server
      const authApi = getAuthentication();
      await authApi.logout();
    } catch (error) {
      // Nếu API logout fail, vẫn tiếp tục xóa localStorage
      console.error("Logout API error:", error);
    } finally {
      // Xóa tất cả auth storage trong localStorage
      removeToken();
      setAuthenticated(false);
      setUserState(null);
      // Trigger custom event to update Navbar
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
      }
      router.push("/");
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="container-fluid sticky-top bg-white shadow-sm">
      <div className="container">
        <nav className="navbar navbar-expand-lg bg-white navbar-light py-3 py-lg-0">
          <Link
            href="/"
            className="navbar-brand d-flex align-items-center"
            style={{ gap: "10px" }}
          >
            <Image
              src="/img/656d7fce-58b5-4b8d-87bb-bf471d9f06f0-md.jpeg"
              alt="Medinova Logo"
              width={80}
              height={80}
              style={{ objectFit: "contain" }}
              priority
            />
            <h1
              className="m-0 text-uppercase text-primary"
              style={{ fontSize: "2.5rem", fontWeight: "bold" }}
            >
              Medinova
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
                className={`nav-item nav-link ${
                  isActive("/") && pathname === "/" ? "active" : ""
                }`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`nav-item nav-link ${
                  isActive("/about") ? "active" : ""
                }`}
              >
                About
              </Link>
              <Link
                href="/service"
                className={`nav-item nav-link ${
                  isActive("/service") ? "active" : ""
                }`}
              >
                Service
              </Link>
              <Link
                href="/price"
                className={`nav-item nav-link ${
                  isActive("/price") ? "active" : ""
                }`}
              >
                Pricing
              </Link>
              <div className="nav-item dropdown">
                <a
                  href="#"
                  className={`nav-link dropdown-toggle ${
                    isActive("/blog") ||
                    isActive("/detail") ||
                    isActive("/team") ||
                    isActive("/testimonial") ||
                    isActive("/appointment") ||
                    isActive("/search")
                      ? "active"
                      : ""
                  }`}
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
                className={`nav-item nav-link ${
                  isActive("/contact") ? "active" : ""
                }`}
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
                  {mounted && authenticated && user && user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || "User"}
                      className="rounded-circle me-2"
                      style={{
                        width: "32px",
                        height: "32px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <i
                      className="fa fa-user-circle me-2"
                      style={{ fontSize: "24px" }}
                    ></i>
                  )}
                  {mounted && authenticated && user && (
                    <span
                      className="d-none d-md-inline ms-1"
                      suppressHydrationWarning
                    >
                      {user.fullName || user.email || "User"}
                    </span>
                  )}
                </a>
                <div className="dropdown-menu dropdown-menu-end m-0">
                  {mounted && authenticated ? (
                    <>
                      {user && (
                        <div
                          className="dropdown-item-text"
                          suppressHydrationWarning
                        >
                          <small className="text-muted">Signed in as</small>
                          <div className="fw-bold">
                            {user.fullName || user.email || "User"}
                          </div>
                          {user.role && (
                            <small className="text-muted d-block mt-1">
                              <i className="fa fa-user-tag me-1"></i>
                              {user.role}
                            </small>
                          )}
                        </div>
                      )}
                      <div className="dropdown-divider"></div>
                      <Link href="/profile" className="dropdown-item">
                        <i className="fa fa-user me-2"></i>Profile
                      </Link>
                      <Link href="/medical-history" className="dropdown-item">
                        <i className="fa fa-history me-2"></i>Medical History
                      </Link>
                      <Link href="/dashboard" className="dropdown-item">
                        <i className="fa fa-tachometer-alt me-2"></i>Dashboard
                      </Link>
                      {/* Chỉ hiển thị Admin Panel khi role là ADMIN */}
                      {user &&
                        (user.role === "ADMIN" || user.role === "admin") && (
                          <Link href="/admin" className="dropdown-item">
                            <i className="fa fa-cog me-2"></i>Admin Panel
                          </Link>
                        )}
                      {/* Chỉ hiển thị Doctor Panel khi role là DOCTOR */}
                      {user &&
                        (user.role === "DOCTOR" || user.role === "doctor") && (
                          <Link href="/doctor" className="dropdown-item">
                            <i className="fa fa-user-md me-2"></i>Doctor Panel
                          </Link>
                        )}
                      {/* Chỉ hiển thị Driver Panel khi role là DRIVER */}
                      {user &&
                        (user.role === "DRIVER" || user.role === "driver") && (
                          <Link
                            href="/driver/dashboard"
                            className="dropdown-item"
                          >
                            <i className="fa fa-truck-medical me-2"></i>Driver
                            Panel
                          </Link>
                        )}
                      <div className="dropdown-divider"></div>
                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                        style={{
                          border: "none",
                          background: "none",
                          width: "100%",
                          textAlign: "left",
                        }}
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
