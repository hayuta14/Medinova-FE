
"use client";

import { useState, useEffect, useCallback } from "react";
import { getBloodTestManagement } from "@/generated/api/endpoints/blood-test-management/blood-test-management";
import { getClinicManagement } from "@/generated/api/endpoints/clinic-management/clinic-management";
import { getDoctorManagement } from "@/generated/api/endpoints/doctor-management/doctor-management";
import { getUser } from "@/utils/auth";

export default function BloodTestingPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  useEffect(() => {
    loadDoctorId();
    loadClinics();
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadBloodTests();
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

  const loadBloodTests = async () => {
    if (!doctorId) return;

    try {
      setIsLoading(true);
      const bloodTestApi = getBloodTestManagement();

      // Get blood tests by clinic (doctor's clinic)
      const userData = getUser();
      const doctorApi = getDoctorManagement();
      const doctorsResponse = await doctorApi.getAllDoctors();
      const doctorsData = (doctorsResponse as any)?.data || doctorsResponse;
      const allDoctors = Array.isArray(doctorsData) ? doctorsData : [];
      const currentDoctor = allDoctors.find((doc: any) => doc.id === doctorId);

      if (currentDoctor && currentDoctor.clinic?.id) {
        const response = await bloodTestApi.getBloodTestsByClinic(
          currentDoctor.clinic.id,
          { status: statusFilter || undefined }
        );
        const data = (response as any)?.data || response;
        setTests(Array.isArray(data) ? data : []);
      } else {
        // Fallback: get all blood tests
        const response = await bloodTestApi.getAllBloodTests({
          status: statusFilter || undefined,
        });
        const data = (response as any)?.data || response;
        setTests(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      console.error("Error loading blood tests:", error);
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (testId: number, newStatus: string) => {
    if (
      !confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành ${newStatus}?`)
    ) {
      return;
    }

    try {
      const bloodTestApi = getBloodTestManagement();
      await bloodTestApi.updateBloodTestStatus(testId, { status: newStatus });
      alert("Cập nhật trạng thái thành công!");
      await loadBloodTests();
    } catch (error: any) {
      console.error("Error updating blood test status:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi cập nhật trạng thái.";
      alert(errorMessage);
    }
  };

  const handleUploadResult = async (testId: number, resultFileUrl: string) => {
    try {
      const bloodTestApi = getBloodTestManagement();
      await bloodTestApi.updateBloodTestResult(testId, { resultFileUrl });
      alert("Upload kết quả thành công!");
      await loadBloodTests();
    } catch (error: any) {
      console.error("Error uploading result:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi upload kết quả.";
      alert(errorMessage);
    }
  };

  const handleRequestTest = () => {
    // TODO: Implement request test
    console.log("Request test");
    setShowRequestModal(false);
  };

  const handleViewResult = (test: any) => {
    setSelectedTest(test);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🧪 Quản lý xét nghiệm</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowRequestModal(true)}
        >
          <i className="fa fa-plus me-2"></i>Tạo yêu cầu xét nghiệm
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
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={loadBloodTests}
              >
                <i className="fa fa-sync-alt me-1"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="fa fa-clock fa-2x text-warning mb-3"></i>
              <h3>
                {
                  tests.filter(
                    (t) => t.status === "PENDING" || t.status === "SCHEDULED"
                  ).length
                }
              </h3>
              <p className="text-muted mb-0">Chờ kết quả</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="fa fa-check-circle fa-2x text-success mb-3"></i>
              <h3>{tests.filter((t) => t.status === "COMPLETED").length}</h3>
              <p className="text-muted mb-0">Đã có kết quả</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="fa fa-vial fa-2x text-info mb-3"></i>
              <h3>{tests.length}</h3>
              <p className="text-muted mb-0">Tổng số xét nghiệm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-warning text-white">
          <h5 className="mb-0">Danh sách xét nghiệm</h5>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-vial fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có xét nghiệm nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Mã xét nghiệm</th>
                    <th>Loại xét nghiệm</th>
                    <th>Clinic</th>
                    <th>Ngày xét nghiệm</th>
                    <th>Giờ</th>
                    <th>Trạng thái</th>
                    <th>Kết quả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id}>
                      <td>#{test.id}</td>
                      <td>{test.testType || "N/A"}</td>
                      <td>{test.clinicName || "N/A"}</td>
                      <td>
                        {test.testDate
                          ? new Date(test.testDate).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </td>
                      <td>{test.testTime || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${
                            test.status === "PENDING"
                              ? "bg-warning"
                              : test.status === "SCHEDULED"
                              ? "bg-primary"
                              : test.status === "COMPLETED"
                              ? "bg-success"
                              : test.status === "CANCELLED"
                              ? "bg-secondary"
                              : "bg-secondary"
                          }`}
                        >
                          {test.status}
                        </span>
                      </td>
                      <td>
                        {test.resultFileUrl ? (
                          <a
                            href={test.resultFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-success"
                          >
                            <i className="fa fa-download me-1"></i>Xem
                          </a>
                        ) : (
                          <span className="text-muted">Chưa có</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {test.status !== "COMPLETED" && (
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                handleUpdateStatus(test.id, "COMPLETED")
                              }
                            >
                              <i className="fa fa-check me-1"></i>Hoàn thành
                            </button>
                          )}
                          {test.status === "PENDING" && (
                            <button
                              className="btn btn-primary"
                              onClick={() =>
                                handleUpdateStatus(test.id, "SCHEDULED")
                              }
                            >
                              <i className="fa fa-calendar me-1"></i>Lên lịch
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        {test.status === "COMPLETED" && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewResult(test)}
                          >
                            <i className="fa fa-eye me-1"></i>Xem kết quả
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Test Modal */}
      {showRequestModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRequestModal(false);
            }
          }}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo yêu cầu xét nghiệm</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRequestModal(false)}
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
                  <label className="form-label">Loại xét nghiệm</label>
                  <select className="form-select">
                    <option>Xét nghiệm máu</option>
                    <option>Xét nghiệm nước tiểu</option>
                    <option>Xét nghiệm sinh hóa</option>
                  </select>
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
                  onClick={() => setShowRequestModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRequestTest}
                >
                  Tạo yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {selectedTest && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedTest(null);
            }
          }}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Kết quả xét nghiệm</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedTest(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Thông tin bệnh nhân</h6>
                    <p>
                      <strong>Tên:</strong> {selectedTest.patientName}
                    </p>
                    <p>
                      <strong>Loại xét nghiệm:</strong> {selectedTest.testType}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Thông tin xét nghiệm</h6>
                    <p>
                      <strong>Ngày yêu cầu:</strong> {selectedTest.requestDate}
                    </p>
                    <p>
                      <strong>Ngày có kết quả:</strong>{" "}
                      {selectedTest.resultDate}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <h6>Kết quả</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Chỉ số</th>
                          <th>Kết quả</th>
                          <th>Bình thường</th>
                          <th>Đánh giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Hemoglobin</td>
                          <td>14.5 g/dL</td>
                          <td>12-16 g/dL</td>
                          <td>
                            <span className="badge bg-success">
                              Bình thường
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-3">
                  <h6>Đánh giá</h6>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Nhập đánh giá..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTest(null)}
                >
                  Đóng
                </button>
                <button type="button" className="btn btn-success">
                  Lưu đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
