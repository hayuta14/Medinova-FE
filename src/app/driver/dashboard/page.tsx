"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUser } from "@/utils/auth";
import { getEmergencyManagement } from "@/generated/api/endpoints/emergency-management/emergency-management";

export default function DriverDashboard() {
  const [user, setUser] = useState<any>(null);
  const [myEmergencies, setMyEmergencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    enRoute: 0,
    arrived: 0,
    completed: 0,
  });

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
      const { getToken } = await import("@/utils/auth");
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const axios = (await import("axios")).default;
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

      setMyEmergencies(myEmergenciesList);

      // Calculate stats
      setStats({
        total: myEmergenciesList.length,
        pending: myEmergenciesList.filter(
          (e: any) =>
            e.status === "PENDING" ||
            e.status === "ASSIGNED" ||
            e.status === "NEEDS_ATTENTION"
        ).length,
        enRoute: myEmergenciesList.filter((e: any) => e.status === "EN_ROUTE")
          .length,
        arrived: myEmergenciesList.filter((e: any) => e.status === "ARRIVED")
          .length,
        completed: myEmergenciesList.filter(
          (e: any) => e.status === "COMPLETED"
        ).length,
      });
    } catch (error) {
      console.error("Error loading emergencies:", error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="mb-0">
              <i className="fa fa-tachometer-alt me-2"></i>
              Driver Dashboard
            </h2>
            <p className="text-muted">Quản lý ca cấp cứu được phân công</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-white-50">
                      Tổng số ca
                    </h6>
                    <h3 className="mb-0">{stats.total}</h3>
                  </div>
                  <i className="fa fa-ambulance fa-2x opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-white-50">
                      Chờ xử lý
                    </h6>
                    <h3 className="mb-0">{stats.pending}</h3>
                  </div>
                  <i className="fa fa-clock fa-2x opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-white-50">
                      Đang di chuyển
                    </h6>
                    <h3 className="mb-0">{stats.enRoute}</h3>
                  </div>
                  <i className="fa fa-route fa-2x opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-white-50">
                      Hoàn thành
                    </h6>
                    <h3 className="mb-0">{stats.completed}</h3>
                  </div>
                  <i className="fa fa-check-circle fa-2x opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergencies List */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fa fa-ambulance me-2"></i>
                  Ca cấp cứu của tôi
                </h5>
              </div>
              <div className="card-body">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : myEmergencies.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                    <p className="text-muted">
                      Chưa có ca cấp cứu nào được phân công
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Bệnh nhân</th>
                          <th>Địa chỉ</th>
                          <th>Trạng thái</th>
                          <th>Ưu tiên</th>
                          <th>Thời gian tạo</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myEmergencies.map((emergency: any) => (
                          <tr key={emergency.id}>
                            <td>#{emergency.id}</td>
                            <td>
                              <div>
                                <strong>
                                  {emergency.patientName || "N/A"}
                                </strong>
                                {emergency.patientPhone && (
                                  <div className="text-muted small">
                                    <i className="fa fa-phone me-1"></i>
                                    {emergency.patientPhone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="text-muted small">
                                {emergency.patientAddress || "N/A"}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${getStatusBadgeClass(
                                  emergency.status
                                )}`}
                              >
                                {getStatusLabel(emergency.status)}
                              </span>
                            </td>
                            <td>
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
                            </td>
                            <td>
                              {emergency.createdAt
                                ? new Date(emergency.createdAt).toLocaleString(
                                    "vi-VN"
                                  )
                                : "N/A"}
                            </td>
                            <td>
                              <Link
                                href={`/driver/emergencies`}
                                className="btn btn-sm btn-primary"
                              >
                                <i className="fa fa-eye me-1"></i>
                                Xem chi tiết
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
