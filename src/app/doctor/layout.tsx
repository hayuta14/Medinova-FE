'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, removeToken, getUser } from '@/utils/auth';
import { getAuthentication } from '@/generated/api/endpoints/authentication/authentication';

export default function DoctorLayout({
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
      if (typeof window === 'undefined') {
        setIsChecking(false);
        return;
      }

      // Kiểm tra token có tồn tại không
      if (!isAuthenticated()) {
        removeToken();
        setIsAuthorized(false);
        setIsChecking(false);
        router.push('/login');
        return;
      }

      try {
        // Gọi API validate token
        const authApi = getAuthentication();
        const response = await authApi.validateToken();

        // Kiểm tra response từ API
        const validationData = response.data || response;
        const isValid = validationData.valid !== false;
        const isExpired = validationData.expired === true;

        if (!isValid || isExpired) {
          // Token không hợp lệ hoặc đã hết hạn
          removeToken();
          setIsAuthorized(false);
          setIsChecking(false);
          router.push('/login');
          return;
        }

        // Token hợp lệ, kiểm tra role
        const userData = getUser();
        setUser(userData);
        // Chỉ cho phép truy cập nếu role là DOCTOR
        if (userData && (userData.role === 'DOCTOR' || userData.role === 'doctor')) {
          setIsAuthorized(true);
          setIsChecking(false);
        } else {
          // Nếu không phải doctor, redirect về home
          removeToken();
          setIsAuthorized(false);
          setIsChecking(false);
          router.push('/');
        }
      } catch (error: any) {
        // Nếu API trả về lỗi, token không hợp lệ
        console.error('Token validation error:', error);
        removeToken();
        setIsAuthorized(false);
        setIsChecking(false);
        router.push('/login');
      }
    };

    validateTokenAndRole();
  }, [router]);

  // Hiển thị loading khi đang kiểm tra
  if (isChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
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
      console.error('Logout API error:', error);
    } finally {
      // Xóa tất cả auth storage trong localStorage
      removeToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }
      router.push('/');
    }
  };

  const isActive = (path: string) => {
    if (path === '/doctor') {
      return pathname === '/doctor' || pathname === '/doctor/dashboard';
    }
    return pathname?.startsWith(path);
  };

  const menuItems = [
    { path: '/doctor/dashboard', label: 'Tổng quan', icon: 'fa-tachometer-alt' },
    { path: '/doctor/patients', label: 'Quản lý bệnh nhân', icon: 'fa-users' },
    { path: '/doctor/outdoor-checkup', label: 'Khám ngoại trú', icon: 'fa-stethoscope' },
    { path: '/doctor/emergency', label: 'Cấp cứu', icon: 'fa-ambulance', badge: 'hot' },
    { path: '/doctor/surgery', label: 'Phẫu thuật', icon: 'fa-procedures' },
    { path: '/doctor/blood-testing', label: 'Xét nghiệm', icon: 'fa-vial' },
    { path: '/doctor/pharmacy', label: 'Kê đơn thuốc', icon: 'fa-pills' },
    { path: '/doctor/ambulance', label: 'Xe cứu thương', icon: 'fa-truck-medical' },
    { path: '/doctor/schedule', label: 'Lịch làm việc', icon: 'fa-calendar-alt' },
    { path: '/doctor/notifications', label: 'Thông báo', icon: 'fa-bell' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div
        className={`bg-dark text-white ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{
          width: sidebarOpen ? '250px' : '60px',
          transition: 'width 0.3s',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1000,
        }}
      >
        <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
          {sidebarOpen && <h5 className="mb-0">Doctor Panel</h5>}
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fa fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
        </div>
        <nav className="p-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`d-flex align-items-center p-2 text-white text-decoration-none rounded mb-1 position-relative ${
                isActive(item.path) ? 'bg-primary' : 'hover-bg-secondary'
              }`}
              style={{
                backgroundColor: isActive(item.path) ? 'var(--primary)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.path === '/doctor/ambulance' ? (
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="me-3"
                  style={{ flexShrink: 0, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
                >
                  {/* Thân xe */}
                  <rect x="18" y="48" width="64" height="32" rx="6" fill="currentColor"/>
                  {/* Cửa sổ trước */}
                  <rect x="24" y="54" width="16" height="22" fill="#ffffff" opacity="0.95" rx="2"/>
                  {/* Cửa sổ giữa */}
                  <rect x="44" y="54" width="16" height="22" fill="#ffffff" opacity="0.95" rx="2"/>
                  {/* Cửa sau */}
                  <rect x="64" y="54" width="12" height="22" fill="#ffffff" opacity="0.95" rx="2"/>
                  {/* Bánh xe trái */}
                  <circle cx="32" cy="88" r="9" fill="#1a1a1a"/>
                  <circle cx="32" cy="88" r="6" fill="#ffffff"/>
                  <circle cx="32" cy="88" r="3" fill="#1a1a1a"/>
                  {/* Bánh xe phải */}
                  <circle cx="68" cy="88" r="9" fill="#1a1a1a"/>
                  <circle cx="68" cy="88" r="6" fill="#ffffff"/>
                  <circle cx="68" cy="88" r="3" fill="#1a1a1a"/>
                  {/* Nóc xe */}
                  <rect x="28" y="32" width="44" height="22" rx="4" fill="currentColor" opacity="0.9"/>
                  {/* Dấu thập đỏ trên nóc */}
                  <rect x="45" y="36" width="10" height="2" fill="#ffffff"/>
                  <rect x="49" y="32" width="2" height="10" fill="#ffffff"/>
                  {/* Đèn cảnh báo */}
                  <circle cx="50" cy="28" r="4" fill="#ffffff"/>
                  <circle cx="50" cy="28" r="2" fill="currentColor"/>
                  {/* Cửa sổ nóc */}
                  <rect x="38" y="38" width="24" height="10" fill="#ffffff" opacity="0.7" rx="2"/>
                </svg>
              ) : (
                <i className={`fa ${item.icon} me-3`} style={{ width: '20px', textAlign: 'center' }}></i>
              )}
              {sidebarOpen && <span>{item.label}</span>}
              {item.badge === 'hot' && sidebarOpen && (
                <span className="badge bg-danger ms-auto">Hot</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-top mt-auto">
          <button
            className="btn btn-outline-light w-100"
            onClick={handleLogout}
          >
            <i className="fa fa-sign-out-alt me-2"></i>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? '250px' : '60px',
          transition: 'margin-left 0.3s',
          width: sidebarOpen ? 'calc(100% - 250px)' : 'calc(100% - 60px)',
          minHeight: '100vh',
        }}
      >
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">Doctor Dashboard</h4>
            {user && (
              <small className="text-muted">
                {user.fullName || user.email} - {user.role}
              </small>
            )}
          </div>
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

