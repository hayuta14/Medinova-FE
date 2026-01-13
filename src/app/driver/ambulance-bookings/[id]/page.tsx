"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getUser, getToken } from "@/utils/auth";
import { getAmbulanceBookingManagement } from "@/generated/api/endpoints/ambulance-booking-management/ambulance-booking-management";
import axios from "axios";

export default function AmbulanceBookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id ? Number(params.id) : null;

  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    if (bookingId) {
      loadBookingDetail();
    }
  }, [bookingId]);

  // Auto-refresh booking data every 10 seconds
  useEffect(() => {
    if (!bookingId || !booking || isLoading) return;

    const interval = setInterval(() => {
      loadBookingDetail();
    }, 10000);

    return () => clearInterval(interval);
  }, [bookingId, booking, isLoading]);

  const loadBookingDetail = async () => {
    if (!bookingId) return;

    try {
      setIsLoading(true);
      setError(null);
      const ambulanceApi = getAmbulanceBookingManagement();
      const response = await ambulanceApi.getAmbulanceBookingById(bookingId);
      const bookingData = (response as any)?.data || response;

      // Backend already checks permission
      setBooking(bookingData);
    } catch (error: any) {
      console.error("Error loading booking:", error);
      const errorMessage = error?.response?.data?.message || error?.message;
      if (error?.response?.status === 403 || errorMessage?.includes("permission") || errorMessage?.includes("quyền")) {
        setError("Bạn không có quyền xem đặt xe này");
      } else {
        setError(errorMessage || "Không thể tải thông tin đặt xe");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBooking = async () => {
    if (!bookingId) return;

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

      await loadBookingDetail();
      alert("Đã xác nhận nhận đặt xe thành công!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!bookingId) return;

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

      await loadBookingDetail();
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

  const canAccept = (status: string) => {
    return status === "PENDING" || status === "ASSIGNED";
  };

  const canUpdateToInTransit = (status: string) => {
    return status === "ASSIGNED";
  };

  const canUpdateToArrived = (status: string) => {
    return status === "IN_TRANSIT";
  };

  const canUpdateToCompleted = (status: string) => {
    return status === "ARRIVED";
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const getMapUrl = (lat: number, lng: number) => {
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  };

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
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

  if (error || !booking) {
    return (
      <div className="container-fluid py-4">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">
              <i className="fa fa-exclamation-triangle me-2"></i>
              Lỗi
            </h4>
            <p>{error || "Không tìm thấy đặt xe"}</p>
            <hr />
            <Link href="/driver/ambulance-bookings" className="btn btn-primary">
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
              href="/driver/ambulance-bookings"
              className="btn btn-outline-secondary mb-3"
            >
              <i className="fa fa-arrow-left me-2"></i>
              Quay lại danh sách
            </Link>
            <h2 className="mb-0">
              <i className="fa fa-ambulance me-2"></i>
              Chi tiết đặt xe #{booking.id}
            </h2>
          </div>
        </div>

        {/* Status Progress */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fa fa-tasks me-2"></i>
                  Tiến trình đặt xe
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className={`text-center ${booking.status === "PENDING" || booking.status === "ASSIGNED" ? "text-primary" : "text-muted"}`}>
                    <i className="fa fa-clock fa-2x mb-2"></i>
                    <div className="small">Chờ xử lý</div>
                  </div>
                  <div className="flex-grow-1 mx-2">
                    <div className="progress" style={{ height: "4px" }}>
                      <div
                        className={`progress-bar ${
                          booking.status !== "PENDING" && booking.status !== "ASSIGNED"
                            ? "bg-success"
                            : ""
                        }`}
                        style={{
                          width:
                            booking.status === "PENDING" || booking.status === "ASSIGNED"
                              ? "0%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className={`text-center ${booking.status === "IN_TRANSIT" ? "text-primary" : booking.status === "ARRIVED" || booking.status === "COMPLETED" ? "text-success" : "text-muted"}`}>
                    <i className="fa fa-truck fa-2x mb-2"></i>
                    <div className="small">Đang di chuyển</div>
                  </div>
                  <div className="flex-grow-1 mx-2">
                    <div className="progress" style={{ height: "4px" }}>
                      <div
                        className={`progress-bar ${
                          booking.status === "ARRIVED" || booking.status === "COMPLETED"
                            ? "bg-success"
                            : ""
                        }`}
                        style={{
                          width:
                            booking.status === "ARRIVED" || booking.status === "COMPLETED"
                              ? "100%"
                              : booking.status === "IN_TRANSIT"
                              ? "50%"
                              : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className={`text-center ${booking.status === "ARRIVED" ? "text-success" : booking.status === "COMPLETED" ? "text-success" : "text-muted"}`}>
                    <i className="fa fa-map-marker-alt fa-2x mb-2"></i>
                    <div className="small">Đã đến nơi</div>
                  </div>
                  <div className="flex-grow-1 mx-2">
                    <div className="progress" style={{ height: "4px" }}>
                      <div
                        className={`progress-bar ${
                          booking.status === "COMPLETED" ? "bg-success" : ""
                        }`}
                        style={{
                          width: booking.status === "COMPLETED" ? "100%" : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className={`text-center ${booking.status === "COMPLETED" ? "text-success" : "text-muted"}`}>
                    <i className="fa fa-check-circle fa-2x mb-2"></i>
                    <div className="small">Hoàn thành</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            {/* Booking Information */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fa fa-info-circle me-2"></i>
                  Thông tin đặt xe
                </h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-user me-2"></i>Bệnh nhân:
                    </strong>
                    <div className="mt-1">
                      <h6 className="mb-0">{booking.patientName || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-phone me-2"></i>Số điện thoại:
                    </strong>
                    <div className="mt-1 d-flex align-items-center gap-2">
                      <span>{booking.patientPhone || "N/A"}</span>
                      {booking.patientPhone && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleCall(booking.patientPhone)}
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
                      <i className="fa fa-hospital me-2"></i>Phòng khám:
                    </strong>
                    <div className="mt-1">{booking.clinicName || "N/A"}</div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <strong>
                      <i className="fa fa-ambulance me-2"></i>Xe cấp cứu:
                    </strong>
                    <div className="mt-1">
                      {booking.ambulanceLicensePlate || "Chưa phân công"}
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <strong>
                      <i className="fa fa-map-marker-alt me-2"></i>Địa chỉ đón:
                    </strong>
                    <div className="mt-1">{booking.pickupAddress || "N/A"}</div>
                    {booking.pickupLat && booking.pickupLng && getGoogleMapsUrl(booking.pickupLat, booking.pickupLng) && (
                      <div className="mt-2">
                        <a
                          href={getGoogleMapsUrl(booking.pickupLat, booking.pickupLng)}
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

                {/* Pickup Map */}
                {booking.pickupLat && booking.pickupLng && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>
                        <i className="fa fa-map me-2"></i>Vị trí đón trên bản đồ:
                      </strong>
                      <div
                        className="mt-2"
                        style={{
                          height: "300px",
                          width: "100%",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "2px solid #007bff",
                        }}
                      >
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={getMapUrl(booking.pickupLat, booking.pickupLng)}
                          allowFullScreen
                          title="Pickup Location Map"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                )}

                {booking.destinationAddress && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>
                        <i className="fa fa-map-marker-alt me-2"></i>Địa chỉ đến:
                      </strong>
                      <div className="mt-1">{booking.destinationAddress}</div>
                      {booking.destinationLat && booking.destinationLng && getGoogleMapsUrl(booking.destinationLat, booking.destinationLng) && (
                        <div className="mt-2">
                          <a
                            href={getGoogleMapsUrl(booking.destinationLat, booking.destinationLng)}
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
                )}

                {booking.distanceKm && (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>
                        <i className="fa fa-route me-2"></i>Khoảng cách:
                      </strong>
                      <div className="mt-1">{booking.distanceKm.toFixed(2)} km</div>
                    </div>
                    {booking.estimatedTime && (
                      <div className="col-md-6">
                        <strong>
                          <i className="fa fa-clock me-2"></i>Thời gian ước tính:
                        </strong>
                        <div className="mt-1">{booking.estimatedTime} phút</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-tag me-2"></i>Trạng thái:
                    </strong>
                    <div className="mt-1">
                      <span
                        className={`badge ${getStatusBadgeClass(booking.status)}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong>
                      <i className="fa fa-calendar me-2"></i>Thời gian tạo:
                    </strong>
                    <div className="mt-1 text-muted small">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>
                </div>

                {booking.assignedAt && (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>
                        <i className="fa fa-paper-plane me-2"></i>
                        Thời gian phân công:
                      </strong>
                      <div className="mt-1 text-muted small">
                        {new Date(booking.assignedAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    {booking.arrivedAt && (
                      <div className="col-md-6">
                        <strong>
                          <i className="fa fa-map-marker-alt me-2"></i>
                          Thời gian đến nơi:
                        </strong>
                        <div className="mt-1 text-muted small">
                          {new Date(booking.arrivedAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {booking.completedAt && (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>
                        <i className="fa fa-check-circle me-2"></i>
                        Thời gian hoàn thành:
                      </strong>
                      <div className="mt-1 text-muted small">
                        {new Date(booking.completedAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div className="row">
                    <div className="col-12">
                      <strong>
                        <i className="fa fa-file-alt me-2"></i>Ghi chú:
                      </strong>
                      <div className="mt-1">{booking.notes}</div>
                    </div>
                  </div>
                )}
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
                  {canAccept(booking.status) && (
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleAcceptBooking}
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
                          Xác nhận nhận đặt xe
                        </>
                      )}
                    </button>
                  )}

                  {canUpdateToInTransit(booking.status) && (
                    <button
                      className="btn btn-info btn-lg"
                      onClick={() => handleUpdateStatus("IN_TRANSIT")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <i className="fa fa-spinner fa-spin me-2"></i>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-truck me-2"></i>
                          Bắt đầu di chuyển
                        </>
                      )}
                    </button>
                  )}

                  {canUpdateToArrived(booking.status) && (
                    <button
                      className="btn btn-success btn-lg"
                      onClick={() => handleUpdateStatus("ARRIVED")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <i className="fa fa-spinner fa-spin me-2"></i>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-map-marker-alt me-2"></i>
                          Đã đến nơi
                        </>
                      )}
                    </button>
                  )}

                  {canUpdateToCompleted(booking.status) && (
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={() => handleUpdateStatus("COMPLETED")}
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
                          Hoàn thành
                        </>
                      )}
                    </button>
                  )}

                  {booking.status === "COMPLETED" && (
                    <div className="alert alert-success mt-3 mb-0">
                      <i className="fa fa-check-circle me-2"></i>
                      Đặt xe đã hoàn thành
                    </div>
                  )}

                  {booking.status === "IN_TRANSIT" && (
                    <div className="alert alert-info mt-3 mb-0">
                      <i className="fa fa-info-circle me-2"></i>
                      Bạn đang di chuyển đến địa điểm đón
                    </div>
                  )}

                  {booking.status === "ARRIVED" && (
                    <div className="alert alert-warning mt-3 mb-0">
                      <i className="fa fa-exclamation-triangle me-2"></i>
                      Bạn đã đến nơi. Vui lòng hoàn thành sau khi xử lý xong.
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
                  {booking.patientPhone && (
                    <button
                      className="btn btn-outline-success"
                      onClick={() => handleCall(booking.patientPhone)}
                    >
                      <i className="fa fa-phone me-2"></i>
                      Gọi bệnh nhân
                    </button>
                  )}
                  {booking.pickupLat && booking.pickupLng && getGoogleMapsUrl(booking.pickupLat, booking.pickupLng) && (
                    <a
                      href={getGoogleMapsUrl(booking.pickupLat, booking.pickupLng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="fa fa-map me-2"></i>
                      Mở Google Maps (Đón)
                    </a>
                  )}
                  {booking.destinationLat && booking.destinationLng && getGoogleMapsUrl(booking.destinationLat, booking.destinationLng) && (
                    <a
                      href={getGoogleMapsUrl(booking.destinationLat, booking.destinationLng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                    >
                      <i className="fa fa-map me-2"></i>
                      Mở Google Maps (Đến)
                    </a>
                  )}
                  {booking.pickupAddress && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(booking.pickupAddress);
                        alert("Đã sao chép địa chỉ!");
                      }}
                    >
                      <i className="fa fa-copy me-2"></i>
                      Sao chép địa chỉ đón
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

