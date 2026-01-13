"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getUser, getToken } from "@/utils/auth";
import { getEmergencyManagement } from "@/generated/api/endpoints/emergency-management/emergency-management";
import axios from "axios";
import StatusStepper from "@/components/StatusStepper";

export default function EmergencyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const emergencyId = params?.id ? Number(params.id) : null;

  const [user, setUser] = useState<any>(null);
  const [emergency, setEmergency] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showArrivedModal, setShowArrivedModal] = useState(false);
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState<string>("");
  const [estimatedCompletionTime, setEstimatedCompletionTime] = useState<string>("");

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    if (emergencyId) {
      loadEmergencyDetail();
    }
  }, [emergencyId]);

  // Auto-refresh emergency data every 10 seconds to get latest status
  useEffect(() => {
    if (!emergencyId || !emergency || isLoading) return;

    const interval = setInterval(() => {
      loadEmergencyDetail();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [emergencyId, emergency, isLoading]);

  const loadEmergencyDetail = async () => {
    if (!emergencyId) return;

    try {
      setIsLoading(true);
      setError(null);
      const emergencyApi = getEmergencyManagement();
      const response = await emergencyApi.getEmergencyById(emergencyId);
      // API function already extracts response.data, so response is the data itself
      const emergencyData = (response as any)?.data || response;

      // Backend already checks permission - if we get here, driver has permission
      // No need to check again on frontend
      setEmergency(emergencyData);
    } catch (error: any) {
      console.error("Error loading emergency:", error);
      // Backend will return 403 if driver doesn't have permission
      // Show the error message from backend
      const errorMessage = error?.response?.data?.message || error?.message;
      if (error?.response?.status === 403 || errorMessage?.includes("permission") || errorMessage?.includes("quyền")) {
        setError("Bạn không có quyền xem ca cấp cứu này");
      } else {
        setError(
          errorMessage || "Không thể tải thông tin ca cấp cứu"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptEmergency = async () => {
    if (!emergencyId) return;

    try {
      setIsUpdating(true);
      const token = getToken();

      await axios.patch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/emergencies/${emergencyId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Reload emergency detail
      await loadEmergencyDetail();
      alert("Đã xác nhận nhận ca cấp cứu thành công!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!emergencyId) return;

    // If updating to ARRIVED, show modal to input estimated times
    if (newStatus === "ARRIVED") {
      setShowArrivedModal(true);
      return;
    }

    // For other statuses, update directly
    await updateStatusWithData(newStatus, null, null);
  };

  const updateStatusWithData = async (
    newStatus: string,
    estimatedArrival: string | null,
    estimatedCompletion: string | null
  ) => {
    if (!emergencyId) return;

    try {
      setIsUpdating(true);
      const token = getToken();

      const requestBody: any = { status: newStatus };
      if (estimatedArrival) {
        // Convert datetime-local format (YYYY-MM-DDTHH:mm) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
        // Backend uses LocalDateTime which doesn't support timezone offset
        // Backend timezone is already set to GMT+7 (Asia/Ho_Chi_Minh)
        let arrivalDateTime = estimatedArrival;
        // Remove timezone offset if present
        arrivalDateTime = arrivalDateTime.replace(/[+-]\d{2}:\d{2}(:\d{2})?$/, '');
        // Add seconds if missing (format should be YYYY-MM-DDTHH:mm:ss)
        if (arrivalDateTime.match(/T\d{2}:\d{2}$/)) {
          arrivalDateTime = arrivalDateTime + ':00';
        }
        requestBody.estimatedArrivalTime = arrivalDateTime;
      }
      if (estimatedCompletion) {
        // Convert datetime-local format (YYYY-MM-DDTHH:mm) to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
        // Backend uses LocalDateTime which doesn't support timezone offset
        let completionDateTime = estimatedCompletion;
        // Remove timezone offset if present
        completionDateTime = completionDateTime.replace(/[+-]\d{2}:\d{2}(:\d{2})?$/, '');
        // Add seconds if missing (format should be YYYY-MM-DDTHH:mm:ss)
        if (completionDateTime.match(/T\d{2}:\d{2}$/)) {
          completionDateTime = completionDateTime + ':00';
        }
        requestBody.estimatedCompletionTime = completionDateTime;
      }

      await axios.patch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/emergencies/${emergencyId}/status`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Reload emergency detail
      await loadEmergencyDetail();
      setShowArrivedModal(false);
      setEstimatedArrivalTime("");
      setEstimatedCompletionTime("");
      alert("Cập nhật trạng thái thành công!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmArrived = () => {
    updateStatusWithData("ARRIVED", estimatedArrivalTime || null, estimatedCompletionTime || null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
      case "NEEDS_ATTENTION":
        return "bg-warning";
      case "ASSIGNED":
        return "bg-info";
      case "EN_ROUTE":
        return "bg-primary";
      case "ARRIVED":
        return "bg-success";
      case "COMPLETED":
        return "bg-secondary";
      case "CANCELLED":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: "Chờ xử lý",
      NEEDS_ATTENTION: "Cần xử lý",
      ASSIGNED: "Đã phân công",
      EN_ROUTE: "Đang di chuyển",
      ARRIVED: "Đã đến nơi",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const canAccept = (status: string) => {
    return (
      status === "PENDING" ||
      status === "ASSIGNED" ||
      status === "NEEDS_ATTENTION"
    );
  };

  const canUpdateToArrived = (status: string) => {
    return status === "EN_ROUTE";
  };

  const canUpdateToCompleted = (status: string) => {
    return status === "ARRIVED";
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const getMapUrl = () => {
    if (!emergency?.patientLat || !emergency?.patientLng) {
      return null;
    }
    const lat = emergency.patientLat;
    const lng = emergency.patientLng;
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  };

  const getGoogleMapsUrl = () => {
    if (!emergency?.patientLat || !emergency?.patientLng) {
      return null;
    }
    return `https://www.google.com/maps/search/?api=1&query=${emergency.patientLat},${emergency.patientLng}`;
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !emergency) {
    return (
      <div className="container-fluid py-4">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">
              <i className="fa fa-exclamation-triangle me-2"></i>
              Lỗi
            </h4>
            <p>{error || "Không tìm thấy ca cấp cứu"}</p>
            <hr />
            <Link href="/driver/emergencies" className="btn btn-primary">
              <i className="fa fa-arrow-left me-2"></i>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <Link
              href="/driver/emergencies"
              className="btn btn-outline-secondary mb-3"
            >
              <i className="fa fa-arrow-left me-2"></i>
              Quay lại danh sách
            </Link>
            <h2 className="mb-0">
              <i className="fa fa-ambulance me-2"></i>
              Chi tiết ca cấp cứu #{emergency.id}
            </h2>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fa fa-tasks me-2"></i>
                  Tiến trình ca cấp cứu
                </h5>
              </div>
              <div className="card-body">
                <StatusStepper currentStatus={emergency.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            {/* Patient Information */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fa fa-info-circle me-2"></i>
                  Thông tin bệnh nhân
                </h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-user me-2"></i>Bệnh nhân:
                    </strong>
                    <div className="mt-1">
                      <h6 className="mb-0">{emergency.patientName || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-phone me-2"></i>Số điện thoại:
                    </strong>
                    <div className="mt-1 d-flex align-items-center gap-2">
                      <span>{emergency.patientPhone || "N/A"}</span>
                      {emergency.patientPhone && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleCall(emergency.patientPhone)}
                          title="Gọi nhanh"
                        >
                          <i className="fa fa-phone me-1"></i>
                          Gọi ngay
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <strong>
                      <i className="fa fa-map-marker-alt me-2"></i>Địa chỉ:
                    </strong>
                    <div className="mt-1">
                      {emergency.patientAddress || "N/A"}
                    </div>
                    {getGoogleMapsUrl() && (
                      <div className="mt-2">
                        <a
                          href={getGoogleMapsUrl() || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fa fa-map me-2"></i>
                          Mở Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map */}
                {emergency.patientLat && emergency.patientLng && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>
                        <i className="fa fa-map me-2"></i>Vị trí trên bản đồ:
                      </strong>
                      <div
                        className="mt-2"
                        style={{
                          height: "400px",
                          width: "100%",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "2px solid #dc3545",
                          position: "relative",
                        }}
                      >
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={getMapUrl() || ""}
                          allowFullScreen
                          title="Emergency Location Map"
                        ></iframe>
                        <div
                          className="position-absolute"
                          style={{
                            top: "10px",
                            right: "10px",
                            zIndex: 10,
                          }}
                        >
                          <div className="bg-white p-2 rounded shadow-sm">
                            <small className="text-muted">
                              <i className="fa fa-map-marker-alt text-danger me-1"></i>
                              Vị trí bệnh nhân
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {emergency.description && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>
                        <i className="fa fa-file-alt me-2"></i>Mô tả:
                      </strong>
                      <div className="mt-1">{emergency.description}</div>
                    </div>
                  </div>
                )}

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-tag me-2"></i>Trạng thái:
                    </strong>
                    <div className="mt-1">
                      <span
                        className={`badge ${getStatusBadgeClass(
                          emergency.status
                        )}`}
                      >
                        {getStatusLabel(emergency.status)}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-exclamation-triangle me-2"></i>
                      Mức độ ưu tiên:
                    </strong>
                    <div className="mt-1">
                      <span
                        className={`badge ${
                          emergency.priority === "CRITICAL"
                            ? "bg-danger"
                            : emergency.priority === "HIGH"
                            ? "bg-warning"
                            : emergency.priority === "MEDIUM"
                            ? "bg-info"
                            : "bg-secondary"
                        }`}
                      >
                        {emergency.priority || "MEDIUM"}
                      </span>
                    </div>
                  </div>
                </div>

                {emergency.clinicName && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>
                        <i className="fa fa-hospital me-2"></i>Bệnh viện:
                      </strong>
                      <div className="mt-1">{emergency.clinicName}</div>
                    </div>
                  </div>
                )}

                {emergency.doctorName && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>
                        <i className="fa fa-user-md me-2"></i>Bác sĩ phụ trách:
                      </strong>
                      <div className="mt-1">{emergency.doctorName}</div>
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-calendar me-2"></i>Thời gian tạo:
                    </strong>
                    <div className="mt-1 text-muted small">
                      {emergency.createdAt
                        ? new Date(emergency.createdAt).toLocaleString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>
                  {emergency.dispatchedAt && (
                    <div className="col-md-6">
                      <strong>
                        <i className="fa fa-paper-plane me-2"></i>
                        Thời gian điều động:
                      </strong>
                      <div className="mt-1 text-muted small">
                        {new Date(emergency.dispatchedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            {/* Action Buttons */}
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fa fa-cogs me-2"></i>
                  Thao tác
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  {/* Accept button - only show if status is PENDING/ASSIGNED/NEEDS_ATTENTION */}
                  {canAccept(emergency.status) && (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleAcceptEmergency}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
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
                  )}

                  {/* Arrived button - only show if status is EN_ROUTE */}
                  {canUpdateToArrived(emergency.status) && (
                    <button
                      className="btn btn-success btn-lg"
                      onClick={() => handleUpdateStatus("ARRIVED")}
                      disabled={isUpdating}
                      title="Xác nhận đã đến hiện trường"
                    >
                      {isUpdating ? (
                        <>
                          <i className="fa fa-spinner fa-spin me-2"></i>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-map-marker-alt me-2"></i>
                          Đã đến hiện trường
                        </>
                      )}
                    </button>
                  )}

                  {/* Completed button - only show if status is ARRIVED */}
                  {canUpdateToCompleted(emergency.status) && (
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={() => handleUpdateStatus("COMPLETED")}
                      disabled={isUpdating}
                      title="Hoàn thành ca cấp cứu"
                    >
                      {isUpdating ? (
                        <>
                          <i className="fa fa-spinner fa-spin me-2"></i>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-check-circle me-2"></i>
                          Hoàn thành ca
                        </>
                      )}
                    </button>
                  )}

                  {/* Status messages */}
                  {emergency.status === "COMPLETED" && (
                    <div className="alert alert-success mt-3 mb-0">
                      <i className="fa fa-check-circle me-2"></i>
                      Ca cấp cứu đã hoàn thành
                    </div>
                  )}

                  {emergency.status === "EN_ROUTE" && (
                    <div className="alert alert-info mt-3 mb-0">
                      <i className="fa fa-info-circle me-2"></i>
                      Bạn đang di chuyển đến hiện trường
                    </div>
                  )}

                  {emergency.status === "ARRIVED" && (
                    <div className="alert alert-warning mt-3 mb-0">
                      <i className="fa fa-exclamation-triangle me-2"></i>
                      Bạn đã đến hiện trường. Vui lòng hoàn thành ca sau khi xử
                      lý xong.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="fa fa-bolt me-2"></i>
                  Thao tác nhanh
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  {emergency.patientPhone && (
                    <button
                      className="btn btn-outline-success"
                      onClick={() => handleCall(emergency.patientPhone)}
                    >
                      <i className="fa fa-phone me-2"></i>
                      Gọi bệnh nhân
                    </button>
                  )}
                  {getGoogleMapsUrl() && (
                    <a
                      href={getGoogleMapsUrl() || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="fa fa-map me-2"></i>
                      Mở Google Maps
                    </a>
                  )}
                  {emergency.patientAddress && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(emergency.patientAddress);
                        alert("Đã sao chép địa chỉ!");
                      }}
                    >
                      <i className="fa fa-copy me-2"></i>
                      Sao chép địa chỉ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrived Modal - Input estimated times */}
      {showArrivedModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fa fa-map-marker-alt me-2"></i>
                  Xác nhận đã đến hiện trường
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowArrivedModal(false);
                    setEstimatedArrivalTime("");
                    setEstimatedCompletionTime("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  Vui lòng nhập thời gian dự kiến (tùy chọn):
                </p>
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fa fa-clock me-2"></i>
                    Thời gian dự kiến đến nơi:
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={estimatedArrivalTime}
                    onChange={(e) => setEstimatedArrivalTime(e.target.value)}
                  />
                  <small className="text-muted">
                    Để trống nếu không cần nhập
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fa fa-check-circle me-2"></i>
                    Thời gian dự kiến hoàn thành:
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={estimatedCompletionTime}
                    onChange={(e) => setEstimatedCompletionTime(e.target.value)}
                  />
                  <small className="text-muted">
                    Để trống nếu không cần nhập
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowArrivedModal(false);
                    setEstimatedArrivalTime("");
                    setEstimatedCompletionTime("");
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleConfirmArrived}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <i className="fa fa-spinner fa-spin me-2"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-check me-2"></i>
                      Xác nhận
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
