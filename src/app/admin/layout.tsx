"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, removeToken, getUser } from "@/utils/auth";
import { getAuthentication } from "@/generated/api/endpoints/authentication/authentication";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

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
        const user = getUser();
        // Chỉ cho phép truy cập nếu role là ADMIN
        if (user && (user.role === "ADMIN" || user.role === "admin")) {
          setIsAuthorized(true);
          setIsChecking(false);
        } else {
          // Nếu không phải admin, redirect về home
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
    if (path === "/admin") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname?.startsWith(path);
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "fa-tachometer-alt" },
    {
      path: "/admin/hospitals",
      label: "Hospitals",
      icon: "fa-hospital",
      submenu: [{ path: "/admin/hospitals", label: "Danh sách cơ sở" }],
    },
    {
      path: "/admin/ambulances",
      label: "Ambulances",
      icon: "fa-ambulance",
      submenu: [{ path: "/admin/ambulances", label: "Danh sách xe cấp cứu" }],
    },
    {
      path: "/admin/doctors",
      label: "Doctors",
      icon: "fa-user-md",
      submenu: [
        { path: "/admin/doctors", label: "Danh sách bác sĩ" },
        { path: "/admin/doctors/pending", label: "Bác sĩ chờ duyệt" },
      ],
    },
    {
      path: "/admin/approve-requests",
      label: "Approve Requests",
      icon: "fa-check-circle",
      submenu: [{ path: "/admin/approve-requests", label: "Approve Requests" }],
    },
    {
      path: "/admin/blogs",
      label: "Blogs",
      icon: "fa-blog",
      submenu: [
        { path: "/admin/blogs", label: "Danh sách blog" },
        { path: "/admin/blogs/create", label: "Tạo blog" },
      ],
    },
    {
      path: "/admin/ranking",
      label: "Ranking",
      icon: "fa-trophy",
      submenu: [
        { path: "/admin/ranking/doctors", label: "Xếp hạng bác sĩ" },
        { path: "/admin/ranking/hospitals", label: "Xếp hạng cơ sở" },
      ],
    },
    { path: "/admin/users", label: "Users", icon: "fa-users" },
    {
      path: "/admin/appointments",
      label: "Appointments",
      icon: "fa-calendar-check",
    },
    {
      path: "/admin/emergencies",
      label: "Emergencies",
      icon: "fa-ambulance",
    },
    {
      path: "/admin/blood-tests",
      label: "Blood Tests",
      icon: "fa-vial",
    },
    {
      path: "/admin/pharmacy-orders",
      label: "Pharmacy Orders",
      icon: "fa-pills",
    },
    {
      path: "/admin/ambulance-bookings",
      label: "Ambulance Bookings",
      icon: "fa-ambulance",
    },
    { path: "/admin/settings", label: "Settings", icon: "fa-cog" },
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
        <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
          {sidebarOpen && <h5 className="mb-0">Admin Panel</h5>}
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fa fa-${sidebarOpen ? "times" : "bars"}`}></i>
          </button>
        </div>
        <nav className="p-2">
          {menuItems.map((item) => (
            <div key={item.path}>
              <Link
                href={item.path}
                className={`d-flex align-items-center p-2 text-white text-decoration-none rounded mb-1 ${
                  isActive(item.path) ? "bg-primary" : "hover-bg-secondary"
                }`}
                style={{
                  backgroundColor: isActive(item.path)
                    ? "var(--primary)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <i
                  className={`fa ${item.icon} me-3`}
                  style={{ width: "20px", textAlign: "center" }}
                ></i>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
              {sidebarOpen && item.submenu && isActive(item.path) && (
                <div className="ms-4 mt-1">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.path}
                      href={sub.path}
                      className={`d-block p-2 text-white-50 text-decoration-none rounded mb-1 ${
                        pathname === sub.path ? "text-white fw-bold" : ""
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-3 border-top mt-auto">
          <button
            className="btn btn-outline-light w-100"
            onClick={handleLogout}
          >
            <i className="fa fa-sign-out-alt me-2"></i>
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? "250px" : "60px",
          transition: "margin-left 0.3s",
          width: sidebarOpen ? "calc(100% - 250px)" : "calc(100% - 60px)",
          minHeight: "100vh",
        }}
      >
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Admin Dashboard</h4>
          <div className="d-flex align-items-center gap-3">
            <Link href="/" className="text-decoration-none">
              <i className="fa fa-home me-2"></i>Home
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
