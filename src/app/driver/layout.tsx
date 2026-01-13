"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, removeToken, getUser } from "@/utils/auth";
import { getAuthentication } from "@/generated/api/endpoints/authentication/authentication";
import EmergencyIncomingAlert from "@/components/EmergencyIncomingAlert";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Validate token và check role
    const validateTokenAndRole = async () => {
      if (typeof window === "undefined") {
        setIsChecking(false);
        return;
      }

      // Kiểm tra token có tồn tại không
      if (!isAuthenticated()) {
        removeToken();
        setIsAuthorized(false);
        setIsChecking(false);
        router.push("/login");
        return;
      }

      try {
        // Gọi API validate token
        const authApi = getAuthentication();
        const response = await authApi.validateToken();

        // Kiểm tra response từ API
        // API function already extracts response.data, so response is the data itself
        const validationData = (response as any)?.data || response;
        const isValid = validationData.valid !== false;
        const isExpired = validationData.expired === true;

        if (!isValid || isExpired) {
          // Token không hợp lệ hoặc đã hết hạn
          removeToken();
          setIsAuthorized(false);
          setIsChecking(false);
          router.push("/login");
          return;
        }

        // Token hợp lệ, kiểm tra role
        const userData = getUser();
        setUser(userData);
        // Chỉ cho phép truy cập nếu role là DRIVER
        if (
          userData &&
          (userData.role === "DRIVER" || userData.role === "driver")
        ) {
          setIsAuthorized(true);
          setIsChecking(false);
        } else {
          // Nếu không phải driver, redirect về home
          removeToken();
          setIsAuthorized(false);
          setIsChecking(false);
          router.push("/");
        }
      } catch (error: any) {
        // Nếu API trả về lỗi, token không hợp lệ
        console.error("Token validation error:", error);
        removeToken();
        setIsAuthorized(false);
        setIsChecking(false);
        router.push("/login");
      }
    };

    validateTokenAndRole();
  }, [router]);

  // Hiển thị loading khi đang kiểm tra
  if (isChecking) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Không render gì nếu không được authorized
  if (!isAuthorized) {
    return null;
  }

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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
      }
      router.push("/");
    }
  };

  const isActive = (path: string) => {
    if (path === "/driver") {
      return pathname === "/driver" || pathname === "/driver/dashboard";
    }
    return pathname?.startsWith(path);
  };

  const menuItems = [
    {
      path: "/driver/dashboard",
      label: "Tổng quan",
      icon: "fa-tachometer-alt",
    },
    {
      path: "/driver/emergencies",
      label: "Ca cấp cứu",
      icon: "fa-ambulance",
      badge: "hot",
    },
    {
      path: "/driver/ambulance-bookings",
      label: "Đặt xe cấp cứu",
      icon: "fa-truck-medical",
    },
    { path: "/driver/notifications", label: "Thông báo", icon: "fa-bell" },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className={`bg-dark text-white ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          width: sidebarOpen ? "250px" : "60px",
          transition: "width 0.3s",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            {sidebarOpen && (
              <h5 className="mb-0 text-white">
                <i className="fa fa-truck-medical me-2"></i>
                Driver Panel
              </h5>
            )}
            <button
              className="btn btn-link text-white p-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ fontSize: "1.2rem" }}
            >
              <i
                className={`fa ${
                  sidebarOpen ? "fa-chevron-left" : "fa-chevron-right"
                }`}
              ></i>
            </button>
          </div>

          {user && sidebarOpen && (
            <div className="mb-3 p-2 bg-secondary rounded">
              <small className="text-muted d-block">Đăng nhập với</small>
              <div className="fw-bold text-white">
                {user.fullName || user.email || "Driver"}
              </div>
              <small className="text-muted">
                <i className="fa fa-user-tag me-1"></i>
                {user.role || "DRIVER"}
              </small>
            </div>
          )}

          <nav className="nav flex-column">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link text-white ${
                  isActive(item.path) ? "bg-primary" : ""
                }`}
                style={{
                  borderRadius: "4px",
                  marginBottom: "4px",
                  padding: "10px 15px",
                }}
              >
                <i className={`fa ${item.icon} me-2`}></i>
                {sidebarOpen && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="badge bg-danger ms-2">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="position-absolute bottom-0 w-100 p-3 border-top border-secondary">
          <button
            className="btn btn-outline-light w-100"
            onClick={handleLogout}
          >
            {sidebarOpen ? (
              <>
                <i className="fa fa-sign-out-alt me-2"></i>
                Đăng xuất
              </>
            ) : (
              <i className="fa fa-sign-out-alt"></i>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? "250px" : "60px",
          width: sidebarOpen ? "calc(100% - 250px)" : "calc(100% - 60px)",
          transition: "all 0.3s",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>

      {/* Emergency Incoming Alert */}
      {isAuthorized && user && <EmergencyIncomingAlert userId={user.userId} />}
    </div>
  );
}
