"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, getToken } from "@/utils/auth";
import axios from "axios";

export default function DriverAmbulanceBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    loadMyBookings();
  }, [statusFilter]);

  const loadMyBookings = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token");
      }
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const apiResponse = await axios.get(`${baseURL}/api/ambulance-bookings/my-driver-bookings`, {
        params: statusFilter ? { status: statusFilter } : {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const response = apiResponse.data;

      const bookingsList = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

      // Sort by created date (newest first)
      bookingsList.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setBookings(bookingsList);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: number) => {
    try {
      setIsUpdating(true);
      const token = getToken();

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/ambulance-bookings/${bookingId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await loadMyBookings();
      alert("Đã xác nhận nhận đặt xe thành công!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    try {
      setIsUpdating(true);
      const token = getToken();

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/ambulance-bookings/${bookingId}/status`,
        null,
        {
          params: { status: newStatus },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadMyBookings();
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
        return "bg-warning";
      case "ASSIGNED":
        return "bg-info";
      case "IN_TRANSIT":
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
      ASSIGNED: "Đã phân công",
      IN_TRANSIT: "Đang di chuyển",
      ARRIVED: "Đã đến nơi",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🚑 Đặt xe cấp cứu của tôi</h2>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={loadMyBookings}
        >
          <i className="fa fa-sync-alt me-1"></i>Làm mới
        </button>
      </div>

      {/* Filter */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Lọc theo trạng thái</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">PENDING - Chờ xử lý</option>
                <option value="ASSIGNED">ASSIGNED - Đã phân công</option>
                <option value="IN_TRANSIT">IN_TRANSIT - Đang di chuyển</option>
                <option value="ARRIVED">ARRIVED - Đã đến nơi</option>
                <option value="COMPLETED">COMPLETED - Hoàn thành</option>
                <option value="CANCELLED">CANCELLED - Đã hủy</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <div className="text-muted">
                Tổng: <strong>{bookings.length}</strong> đặt xe
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-ambulance fa-3x text-muted mb-3"></i>
              <p className="text-muted">Không có đặt xe nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Bệnh nhân</th>
                    <th>Phòng khám</th>
                    <th>Xe cấp cứu</th>
                    <th>Địa chỉ đón</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>{booking.patientName || "N/A"}</td>
                      <td>{booking.clinicName || "N/A"}</td>
                      <td>{booking.ambulanceLicensePlate || "Chưa phân công"}</td>
                      <td>
                        {booking.pickupAddress
                          ? booking.pickupAddress.substring(0, 30) + "..."
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusBadgeClass(
                            booking.status
                          )}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td>
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link
                            href={`/driver/ambulance-bookings/${booking.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="fa fa-eye me-1"></i>Chi tiết
                          </Link>
                          {booking.status === "PENDING" || booking.status === "ASSIGNED" ? (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleAcceptBooking(booking.id)}
                              disabled={isUpdating}
                            >
                              <i className="fa fa-check me-1"></i>Nhận
                            </button>
                          ) : null}
                        </div>
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
  );
}

