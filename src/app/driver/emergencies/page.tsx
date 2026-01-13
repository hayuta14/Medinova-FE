"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/utils/auth";
import { getEmergencyManagement } from "@/generated/api/endpoints/emergency-management/emergency-management";
import axios from "axios";

export default function DriverEmergenciesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myEmergencies, setMyEmergencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    loadMyEmergencies();
  }, []);

  const loadMyEmergencies = async () => {
    try {
      setIsLoading(true);
      const emergencyApi = getEmergencyManagement();

      // Use my-driver-emergencies endpoint (for DRIVER role)
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const apiResponse = await axios.get(`${baseURL}/api/emergencies/my-driver-emergencies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const response = apiResponse.data;

      // API function already extracts response.data, so response is the data itself
      const myEmergenciesList = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

      // Sort by created date (newest first)
      myEmergenciesList.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setMyEmergencies(myEmergenciesList);
    } catch (error) {
      console.error("Error loading emergencies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptEmergency = async (emergencyId: number) => {
    try {
      setIsUpdating(true);
      const token = getToken();

      // Call accept endpoint using PATCH
      const response = await axios.patch(
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

      // Reload emergencies
      await loadMyEmergencies();
      alert("Đã xác nhận nhận ca cấp cứu thành công!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (emergencyId: number, newStatus: string) => {
    try {
      setIsUpdating(true);
      const token = getToken();

      // Call update status endpoint using PATCH
      const response = await axios.patch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/emergencies/${emergencyId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Reload emergencies
      await loadMyEmergencies();
      setShowDetailModal(false);
      alert("Cập nhật trạng thái thành công!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsUpdating(false);
    }
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

  const canUpdateToEnRoute = (status: string) => {
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

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="mb-0">
              <i className="fa fa-ambulance me-2"></i>
              Quản lý ca cấp cứu
            </h2>
            <p className="text-muted">
              Xem và cập nhật trạng thái các ca cấp cứu được phân công
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : myEmergencies.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
            <p className="text-muted">Chưa có ca cấp cứu nào được phân công</p>
          </div>
        ) : (
          <div className="row">
            {myEmergencies.map((emergency: any) => (
              <div key={emergency.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <i className="fa fa-ambulance me-2"></i>
                      Ca #{emergency.id}
                    </h6>
                    <span
                      className={`badge ${getStatusBadgeClass(
                        emergency.status
                      )}`}
                    >
                      {getStatusLabel(emergency.status)}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <strong>Bệnh nhân:</strong>
                      <div>{emergency.patientName || "N/A"}</div>
                      {emergency.patientPhone && (
                        <small className="text-muted">
                          <i className="fa fa-phone me-1"></i>
                          {emergency.patientPhone}
                        </small>
                      )}
                    </div>
                    <div className="mb-2">
                      <strong>Địa chỉ:</strong>
                      <div className="text-muted small">
                        {emergency.patientAddress || "N/A"}
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Ưu tiên:</strong>
                      <span
                        className={`badge ms-2 ${
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
                    {emergency.clinicName && (
                      <div className="mb-2">
                        <strong>Bệnh viện:</strong>
                        <div className="text-muted small">
                          {emergency.clinicName}
                        </div>
                      </div>
                    )}
                    <div className="mb-2">
                      <strong>Thời gian tạo:</strong>
                      <div className="text-muted small">
                        {emergency.createdAt
                          ? new Date(emergency.createdAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="d-grid gap-2">
                      {canAccept(emergency.status) && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAcceptEmergency(emergency.id)}
                          disabled={isUpdating}
                        >
                          <i className="fa fa-check me-2"></i>
                          Xác nhận nhận ca
                        </button>
                      )}
                      {canUpdateToArrived(emergency.status) && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            handleUpdateStatus(emergency.id, "ARRIVED")
                          }
                          disabled={isUpdating}
                        >
                          <i className="fa fa-map-marker-alt me-2"></i>
                          Đã đến nơi
                        </button>
                      )}
                      {canUpdateToCompleted(emergency.status) && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            handleUpdateStatus(emergency.id, "COMPLETED")
                          }
                          disabled={isUpdating}
                        >
                          <i className="fa fa-check-circle me-2"></i>
                          Hoàn thành
                        </button>
                      )}
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          setSelectedEmergency(emergency);
                          setShowDetailModal(true);
                        }}
                      >
                        <i className="fa fa-eye me-2"></i>
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedEmergency && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Chi tiết ca cấp cứu #{selectedEmergency.id}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedEmergency(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Bệnh nhân:</strong>
                      <div>{selectedEmergency.patientName || "N/A"}</div>
                    </div>
                    <div className="col-md-6">
                      <strong>Số điện thoại:</strong>
                      <div>{selectedEmergency.patientPhone || "N/A"}</div>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>Địa chỉ:</strong>
                      <div>{selectedEmergency.patientAddress || "N/A"}</div>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Trạng thái:</strong>
                      <div>
                        <span
                          className={`badge ${getStatusBadgeClass(
                            selectedEmergency.status
                          )}`}
                        >
                          {getStatusLabel(selectedEmergency.status)}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <strong>Ưu tiên:</strong>
                      <div>
                        <span
                          className={`badge ${
                            selectedEmergency.priority === "CRITICAL"
                              ? "bg-danger"
                              : selectedEmergency.priority === "HIGH"
                              ? "bg-warning"
                              : selectedEmergency.priority === "MEDIUM"
                              ? "bg-info"
                              : "bg-secondary"
                          }`}
                        >
                          {selectedEmergency.priority || "MEDIUM"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedEmergency.description && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <strong>Mô tả:</strong>
                        <div>{selectedEmergency.description}</div>
                      </div>
                    </div>
                  )}
                  {selectedEmergency.doctorName && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <strong>Bác sĩ phụ trách:</strong>
                        <div>{selectedEmergency.doctorName}</div>
                      </div>
                    </div>
                  )}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Thời gian tạo:</strong>
                      <div className="text-muted small">
                        {selectedEmergency.createdAt
                          ? new Date(
                              selectedEmergency.createdAt
                            ).toLocaleString("vi-VN")
                          : "N/A"}
                      </div>
                    </div>
                    {selectedEmergency.dispatchedAt && (
                      <div className="col-md-6">
                        <strong>Thời gian điều động:</strong>
                        <div className="text-muted small">
                          {new Date(
                            selectedEmergency.dispatchedAt
                          ).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  {canAccept(selectedEmergency.status) && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        handleAcceptEmergency(selectedEmergency.id);
                        setShowDetailModal(false);
                      }}
                      disabled={isUpdating}
                    >
                      <i className="fa fa-check me-2"></i>
                      Xác nhận nhận ca
                    </button>
                  )}
                  {canUpdateToArrived(selectedEmergency.status) && (
                    <button
                      className="btn btn-success"
                      onClick={() =>
                        handleUpdateStatus(selectedEmergency.id, "ARRIVED")
                      }
                      disabled={isUpdating}
                    >
                      <i className="fa fa-map-marker-alt me-2"></i>
                      Đã đến nơi
                    </button>
                  )}
                  {canUpdateToCompleted(selectedEmergency.status) && (
                    <button
                      className="btn btn-secondary"
                      onClick={() =>
                        handleUpdateStatus(selectedEmergency.id, "COMPLETED")
                      }
                      disabled={isUpdating}
                    >
                      <i className="fa fa-check-circle me-2"></i>
                      Hoàn thành
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedEmergency(null);
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
