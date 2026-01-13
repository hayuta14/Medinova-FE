"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/utils/auth";
import { getEmergencyManagement } from "@/generated/api/endpoints/emergency-management/emergency-management";
import axios from "axios";

interface EmergencyIncomingAlertProps {
  userId?: number;
}

export default function EmergencyIncomingAlert({
  userId,
}: EmergencyIncomingAlertProps) {
  const router = useRouter();
  const [incomingEmergency, setIncomingEmergency] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [lastCheckedEmergencyId, setLastCheckedEmergencyId] = useState<
    number | null
  >(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const user = getUser();

  // Function to play alert sound using Web Audio API
  const playAlertSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play a beep sound (800Hz for 0.3 seconds)
      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Play multiple beeps for alert effect
      setTimeout(() => {
        try {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();

          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);

          oscillator2.frequency.value = 1000;
          oscillator2.type = "sine";

          gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.3
          );

          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.3);
        } catch (err) {
          // Ignore errors for second beep
        }
      }, 400);
    } catch (error) {
      console.error("Error playing alert sound:", error);
      // Fallback: try to use HTML5 Audio if Web Audio API is not available
      try {
        const audio = new Audio();
        // Create a simple beep using data URL
        audio.src =
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQQY";
        audio.play().catch((err) => {
          console.error("Error playing fallback beep:", err);
        });
      } catch (fallbackError) {
        console.error("Fallback audio also failed:", fallbackError);
      }
    }
  };

  // Poll for new emergency assignments
  useEffect(() => {
    // Only check for drivers
    if (!user || (user.role !== "DRIVER" && user.role !== "driver")) {
      return;
    }

    const checkForNewEmergencies = async () => {
      try {
        const token = getToken();
        if (!token) {
          return; // No token, can't check
        }

        // Use axios directly since getMyDriverEmergencies is not in generated API client yet
        // TODO: Regenerate API client after backend is updated
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        
        const apiResponse = await axios.get(`${baseURL}/api/emergencies/my-driver-emergencies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000, // 5 second timeout
        });
        
        const responseData = apiResponse.data as any;
        const allEmergencies = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        // Find emergencies that are in ASSIGNED or PENDING status (new assignments)
        // The API already filters by driver, so all returned emergencies are for this driver
        const newEmergencies = allEmergencies.filter((emergency: any) => {
          return (
            (emergency.status === "ASSIGNED" ||
              emergency.status === "PENDING" ||
              emergency.status === "NEEDS_ATTENTION") &&
            emergency.id !== lastCheckedEmergencyId
          );
        });

        // Sort by created date (newest first)
        newEmergencies.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // If there's a new emergency, show alert
        if (newEmergencies.length > 0 && !isVisible) {
          const latestEmergency = newEmergencies[0];
          setIncomingEmergency(latestEmergency);
          setIsVisible(true);
          setLastCheckedEmergencyId(latestEmergency.id);

          // Play alert sound
          playAlertSound();
        }
      } catch (error: any) {
        // Only log error if it's not a network error
        // Network errors are expected if backend is down or starting up, so we'll silently retry
        if (error?.code !== "ERR_NETWORK" && 
            error?.message !== "Network Error" &&
            !error?.message?.includes("Network")) {
          console.error("Error checking for new emergencies:", error);
        }
        // Silently retry on network errors - backend might be starting up
      }
    };

    // Wait a bit before first check to ensure backend is ready
    const initialTimeout = setTimeout(() => {
      checkForNewEmergencies();
    }, 2000);

    // Then check every 5 seconds
    intervalRef.current = setInterval(checkForNewEmergencies, 5000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, userId, lastCheckedEmergencyId, isVisible]);

  const handleAccept = async () => {
    if (!incomingEmergency) return;

    try {
      setIsAccepting(true);
      const token = getToken();

      // Call accept endpoint
      await axios.patch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/emergencies/${incomingEmergency.id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Close alert and redirect to emergency detail
      setIsVisible(false);
      setIncomingEmergency(null);
      router.push(`/driver/emergencies/${incomingEmergency.id}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi xác nhận";
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIncomingEmergency(null);
  };

  if (!isVisible || !incomingEmergency) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @keyframes flash {
          0%,
          100% {
            background-color: rgba(220, 53, 69, 0.9);
          }
          50% {
            background-color: rgba(220, 53, 69, 0.7);
          }
        }

        .emergency-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(220, 53, 69, 0.9);
          animation: flash 1s infinite;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .emergency-alert-content {
          background: white;
          border-radius: 16px;
          padding: 30px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .emergency-alert-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .emergency-alert-icon {
          font-size: 64px;
          color: #dc3545;
          margin-bottom: 15px;
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .emergency-alert-title {
          font-size: 28px;
          font-weight: bold;
          color: #dc3545;
          margin-bottom: 10px;
        }

        .emergency-alert-subtitle {
          font-size: 18px;
          color: #6c757d;
        }

        .emergency-info {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .emergency-info-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .emergency-info-item:last-child {
          margin-bottom: 0;
        }

        .emergency-info-label {
          font-weight: bold;
          color: #495057;
          min-width: 120px;
          margin-right: 10px;
        }

        .emergency-info-value {
          color: #212529;
          flex: 1;
        }

        .emergency-alert-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .btn-accept {
          background: #28a745;
          border: none;
          color: white;
          padding: 12px 30px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-accept:hover {
          background: #218838;
          transform: scale(1.05);
        }

        .btn-accept:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .btn-dismiss {
          background: #6c757d;
          border: none;
          color: white;
          padding: 12px 30px;
          font-size: 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-dismiss:hover {
          background: #5a6268;
        }
      `}</style>

      <div className="emergency-alert-overlay" onClick={handleDismiss}>
        <div
          className="emergency-alert-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="emergency-alert-header">
            <div className="emergency-alert-icon">
              <i className="fa fa-ambulance"></i>
            </div>
            <div className="emergency-alert-title">🚨 CA CẤP CỨU MỚI 🚨</div>
            <div className="emergency-alert-subtitle">
              Bạn đã được phân công một ca cấp cứu mới
            </div>
          </div>

          <div className="emergency-info">
            <div className="emergency-info-item">
              <div className="emergency-info-label">
                <i className="fa fa-user me-2"></i>
                Bệnh nhân:
              </div>
              <div className="emergency-info-value">
                {incomingEmergency.patientName || "N/A"}
              </div>
            </div>

            <div className="emergency-info-item">
              <div className="emergency-info-label">
                <i className="fa fa-map-marker-alt me-2"></i>
                Địa chỉ:
              </div>
              <div className="emergency-info-value">
                {incomingEmergency.patientAddress || "N/A"}
              </div>
            </div>

            <div className="emergency-info-item">
              <div className="emergency-info-label">
                <i className="fa fa-phone me-2"></i>
                Số điện thoại:
              </div>
              <div className="emergency-info-value">
                {incomingEmergency.patientPhone || "N/A"}
              </div>
            </div>

            <div className="emergency-info-item">
              <div className="emergency-info-label">
                <i className="fa fa-exclamation-triangle me-2"></i>
                Mức độ ưu tiên:
              </div>
              <div className="emergency-info-value">
                <span
                  className={`badge ${
                    incomingEmergency.priority === "CRITICAL"
                      ? "bg-danger"
                      : incomingEmergency.priority === "HIGH"
                      ? "bg-warning"
                      : incomingEmergency.priority === "MEDIUM"
                      ? "bg-info"
                      : "bg-secondary"
                  }`}
                >
                  {incomingEmergency.priority || "MEDIUM"}
                </span>
              </div>
            </div>

            {incomingEmergency.description && (
              <div className="emergency-info-item">
                <div className="emergency-info-label">
                  <i className="fa fa-info-circle me-2"></i>
                  Mô tả:
                </div>
                <div className="emergency-info-value">
                  {incomingEmergency.description}
                </div>
              </div>
            )}
          </div>

          <div className="emergency-alert-actions">
            <button
              className="btn-accept"
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <i className="fa fa-spinner fa-spin me-2"></i>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fa fa-check-circle me-2"></i>
                  Xác nhận nhận ca
                </>
              )}
            </button>
            <button className="btn-dismiss" onClick={handleDismiss}>
              <i className="fa fa-times me-2"></i>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
