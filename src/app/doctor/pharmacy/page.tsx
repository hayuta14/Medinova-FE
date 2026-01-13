"use client";

import { useState, useEffect, useCallback } from "react";
import { getPharmacyOrderManagement } from "@/generated/api/endpoints/pharmacy-order-management/pharmacy-order-management";
import { getClinicManagement } from "@/generated/api/endpoints/clinic-management/clinic-management";
import { getDoctorManagement } from "@/generated/api/endpoints/doctor-management/doctor-management";
import { getUser } from "@/utils/auth";

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  useEffect(() => {
    loadDoctorId();
    loadClinics();
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadPharmacyOrders();
    }
  }, [doctorId, statusFilter]);

  const loadDoctorId = async () => {
    try {
      const userData = getUser();
      if (!userData) return;

      const directDoctorId = userData.doctorId || userData.doctor?.id;
      if (directDoctorId) {
        setDoctorId(Number(directDoctorId));
        return;
      }

      const userId = userData.id || userData.userId || userData.user?.id;
      const userEmail = userData.email;

      if (!userId && !userEmail) return;

      const doctorApi = getDoctorManagement();
      const response = await doctorApi.getAllDoctors();
      const doctorsData = (response as any)?.data || response;
      const allDoctors = Array.isArray(doctorsData) ? doctorsData : [];

      let currentDoctor = null;
      if (userId) {
        currentDoctor = allDoctors.find(
          (doc: any) =>
            doc.user?.id === userId ||
            doc.userId === userId ||
            doc.user?.userId === userId
        );
      }

      if (!currentDoctor && userEmail) {
        currentDoctor = allDoctors.find(
          (doc: any) => doc.user?.email === userEmail || doc.email === userEmail
        );
      }

      if (currentDoctor && currentDoctor.id) {
        setDoctorId(Number(currentDoctor.id));
      }
    } catch (error) {
      console.error("Error loading doctor ID:", error);
    }
  };

  const loadClinics = async () => {
    try {
      const clinicApi = getClinicManagement();
      const response = await clinicApi.getAllClinics();
      const clinicsData = Array.isArray(response) ? response : [];
      setClinics(clinicsData);
    } catch (error) {
      console.error("Error loading clinics:", error);
      setClinics([]);
    }
  };

  const loadPharmacyOrders = async () => {
    if (!doctorId) return;

    try {
      setIsLoading(true);
      const pharmacyApi = getPharmacyOrderManagement();

      // Get doctor's clinic
      const userData = getUser();
      const doctorApi = getDoctorManagement();
      const doctorsResponse = await doctorApi.getAllDoctors();
      const doctorsData = (doctorsResponse as any)?.data || doctorsResponse;
      const allDoctors = Array.isArray(doctorsData) ? doctorsData : [];
      const currentDoctor = allDoctors.find((doc: any) => doc.id === doctorId);

      if (currentDoctor && currentDoctor.clinic?.id) {
        const response = await pharmacyApi.getPharmacyOrdersByClinic(
          currentDoctor.clinic.id,
          { status: statusFilter || undefined }
        );
        const data = (response as any)?.data || response;
        setPrescriptions(Array.isArray(data) ? data : []);
      } else {
        // Fallback: get all pharmacy orders
        const response = await pharmacyApi.getAllPharmacyOrders({
          status: statusFilter || undefined,
        });
        const data = (response as any)?.data || response;
        setPrescriptions(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      console.error("Error loading pharmacy orders:", error);
      setPrescriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if (
      !confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành ${newStatus}?`)
    ) {
      return;
    }

    try {
      const pharmacyApi = getPharmacyOrderManagement();
      await pharmacyApi.updatePharmacyOrderStatus(orderId, {
        status: newStatus,
      });
      alert("Cập nhật trạng thái thành công!");
      await loadPharmacyOrders();
    } catch (error: any) {
      console.error("Error updating pharmacy order status:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi cập nhật trạng thái.";
      alert(errorMessage);
    }
  };

  const handleCreatePrescription = () => {
    // TODO: Implement create prescription
    console.log("Create prescription");
    setShowCreateModal(false);
  };

  const handleEditPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">💊 Quản lý kê đơn thuốc</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fa fa-plus me-2"></i>Tạo đơn thuốc mới
        </button>
      </div>

      {/* Filter */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Filter by Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="DISPENSED">DISPENSED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={loadPharmacyOrders}
              >
                <i className="fa fa-sync-alt me-1"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">Danh sách đơn thuốc</h5>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-pills fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có đơn thuốc nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Clinic</th>
                    <th>Số lượng thuốc</th>
                    <th>Tổng tiền</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.clinicName || "N/A"}</td>
                      <td>
                        {order.items && order.items.length > 0
                          ? `${order.items.length} items`
                          : "N/A"}
                      </td>
                      <td>
                        {order.totalAmount
                          ? `$${order.totalAmount.toFixed(2)}`
                          : "N/A"}
                      </td>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === "PENDING"
                              ? "bg-warning"
                              : order.status === "CONFIRMED"
                              ? "bg-primary"
                              : order.status === "DISPENSED"
                              ? "bg-info"
                              : order.status === "DELIVERED"
                              ? "bg-success"
                              : order.status === "CANCELLED"
                              ? "bg-secondary"
                              : "bg-secondary"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {order.status === "PENDING" && (
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                handleUpdateStatus(order.id, "CONFIRMED")
                              }
                            >
                              <i className="fa fa-check me-1"></i>Xác nhận
                            </button>
                          )}
                          {order.status === "CONFIRMED" && (
                            <button
                              className="btn btn-info"
                              onClick={() =>
                                handleUpdateStatus(order.id, "DISPENSED")
                              }
                            >
                              <i className="fa fa-pills me-1"></i>Đã phát
                            </button>
                          )}
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setSelectedPrescription(order)}
                          >
                            <i className="fa fa-eye me-1"></i>Xem
                          </button>
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

      {/* Create Prescription Modal */}
      {showCreateModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Tạo đơn thuốc mới</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Bệnh nhân</label>
                  <select className="form-select">
                    <option>Chọn bệnh nhân</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Thêm thuốc</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tên thuốc"
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Liều lượng"
                    />
                    <button className="btn btn-outline-primary">
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Danh sách thuốc</label>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Tên thuốc</th>
                          <th>Liều lượng</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={3} className="text-center text-muted">
                            Chưa có thuốc nào
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Nhập ghi chú..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCreatePrescription}
                >
                  Tạo đơn thuốc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
