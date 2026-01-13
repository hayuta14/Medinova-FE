"use client";

import { useState, useEffect } from "react";
import { getDoctorManagement } from "@/generated/api/endpoints/doctor-management/doctor-management";

export default function PendingDoctorsPage() {
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const loadPendingDoctors = async () => {
    try {
      setIsLoading(true);
      const doctorApi = getDoctorManagement();
      const response = await doctorApi.getAllDoctors();

      // API function already extracts response.data, so response is the data itself
      // Handle both array and object with data/content property
      const doctorsData =
        (response as any)?.data || (response as any)?.content || response;
      const allDoctors = Array.isArray(doctorsData) ? doctorsData : [];

      // Filter các doctors có status PENDING
      const pending = allDoctors.filter(
        (doctor: any) =>
          doctor.user?.status === "PENDING" ||
          doctor.user?.status === "pending" ||
          (!doctor.user?.status && doctor.user) // Nếu có user nhưng chưa có status
      );

      setPendingDoctors(pending);
    } catch (error: any) {
      console.error("Error loading pending doctors:", error);
      setPendingDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const doctorApi = getDoctorManagement();
      // Update doctor status to APPROVED
      await doctorApi.updateDoctor(id, {
        // Có thể cần thêm các field khác tùy vào UpdateDoctorRequest
      });
      // Reload danh sách
      await loadPendingDoctors();
      alert("Duyệt bác sĩ thành công!");
    } catch (error: any) {
      console.error("Error approving doctor:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi duyệt bác sĩ. Vui lòng thử lại!";
      alert(errorMessage);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối bác sĩ này?")) {
      return;
    }

    try {
      const doctorApi = getDoctorManagement();
      // Có thể update status hoặc delete
      await doctorApi.deleteDoctor(id);
      // Reload danh sách
      await loadPendingDoctors();
      alert("Từ chối bác sĩ thành công!");
    } catch (error: any) {
      console.error("Error rejecting doctor:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi từ chối bác sĩ. Vui lòng thử lại!";
      alert(errorMessage);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Bác sĩ chờ duyệt</h2>
      <div className="card shadow-sm">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : pendingDoctors.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-check-circle fa-3x text-success mb-3"></i>
              <p className="text-muted">Không có bác sĩ nào chờ duyệt</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên bác sĩ</th>
                    <th>Chuyên khoa</th>
                    <th>Cơ sở</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Ngày đăng ký</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>{doctor.id || "N/A"}</td>
                      <td>{doctor.user?.fullName || "N/A"}</td>
                      <td>{doctor.specialization || "N/A"}</td>
                      <td>{doctor.clinic?.name || "N/A"}</td>
                      <td>{doctor.user?.email || "N/A"}</td>
                      <td>{doctor.user?.phone || "N/A"}</td>
                      <td>
                        {doctor.user?.createdAt
                          ? new Date(doctor.user.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleApprove(doctor.id!)}
                        >
                          <i className="fa fa-check me-1"></i>Duyệt
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(doctor.id!)}
                        >
                          <i className="fa fa-times me-1"></i>Từ chối
                        </button>
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
