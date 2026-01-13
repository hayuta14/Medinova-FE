"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getToken, removeToken } from "@/utils/auth";
import { getAuthentication } from "@/generated/api/endpoints/authentication/authentication";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component wrapper để bảo vệ các trang cần authentication
 * Sẽ validate token với server và redirect về login nếu token không hợp lệ hoặc hết hạn
 */
export default function RequireAuth({
  children,
  redirectTo = "/login",
}: RequireAuthProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Validate token với server
    const validateToken = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const token = getToken();
      const authenticated = isAuthenticated();

      // Kiểm tra token có tồn tại không
      if (!token || !authenticated) {
        setIsAuthorized(false);
        setIsChecking(false);
        router.push(redirectTo);
        return;
      }

      try {
        // Gọi API validate token
        const authApi = getAuthentication();
        const response = await authApi.validateToken();

        // API function already extracts response.data, so response is the data itself
        const validationData = (response as any)?.data || response;
        const isValid = validationData.valid !== false; // Mặc định là true nếu không có field valid
        const isExpired = validationData.expired === true;

        if (!isValid || isExpired) {
          // Token không hợp lệ hoặc đã hết hạn
          removeToken();
          setIsAuthorized(false);
          setIsChecking(false);
          router.push(redirectTo);
          return;
        }

        // Token hợp lệ, cho phép truy cập
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error: any) {
        // Nếu API trả về lỗi (401, 403, etc.), token không hợp lệ
        console.error("Token validation error:", error);
        removeToken();
        setIsAuthorized(false);
        setIsChecking(false);
        router.push(redirectTo);
      }
    };

    validateToken();
  }, [router, redirectTo]);

  // Hiển thị loading hoặc không hiển thị gì khi đang check
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

  // Chỉ render children nếu đã authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
