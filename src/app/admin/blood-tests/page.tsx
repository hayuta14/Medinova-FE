"use client";

import { useState, useEffect } from "react";
import { getBloodTestManagement } from "@/generated/api/endpoints/blood-test-management/blood-test-management";
import { getToken } from "@/utils/auth";
import axios from "axios";

export default function BloodTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    loadBloodTests();
  }, [statusFilter]);

  const loadBloodTests = async () => {
    try {
      setIsLoading(true);
      const bloodTestApi = getBloodTestManagement();
      const response = await bloodTestApi.getAllBloodTests({
        status: statusFilter || undefined,
      });

      const data = (response as any)?.data || response;
      setTests(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error loading blood tests:", error);
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestDetail = async (testId: number) => {
    try {
      setIsLoadingDetail(true);
      const bloodTestApi = getBloodTestManagement();
      const response = await bloodTestApi.getBloodTestById(testId);
      const data = (response as any)?.data || response;
      setSelectedTest(data);
      setNewStatus(data.status);
    } catch (error: any) {
      console.error("Error loading test detail:", error);
      alert("Không thể tải chi tiết xét nghiệm: " + (error?.response?.data?.message || error?.message));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewDetails = async (test: any) => {
    setShowDetailModal(true);
    await loadTestDetail(test.id);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTest || !newStatus || newStatus === selectedTest.status) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const token = getToken();
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      await axios.put(
        `${baseURL}/api/blood-tests/${selectedTest.id}/status`,
        null,
        {
          params: { status: newStatus },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reload test detail and tests list
      await loadTestDetail(selectedTest.id);
      await loadBloodTests();
      
      alert("Cập nhật trạng thái thành công!");
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert("Không thể cập nhật trạng thái: " + (error?.response?.data?.message || error?.message));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-warning";
      case "SCHEDULED":
        return "bg-primary";
      case "COMPLETED":
        return "bg-success";
      case "CANCELLED":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      PENDING: "Chờ xử lý",
      SCHEDULED: "Đã lên lịch",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🧪 Quản lý xét nghiệm</h2>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={loadBloodTests}
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
                <option value="SCHEDULED">SCHEDULED - Đã lên lịch</option>
                <option value="COMPLETED">COMPLETED - Hoàn thành</option>
                <option value="CANCELLED">CANCELLED - Đã hủy</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <div className="text-muted">
                Tổng: <strong>{tests.length}</strong> xét nghiệm
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
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-vial fa-3x text-muted mb-3"></i>
              <p className="text-muted">Không tìm thấy xét nghiệm nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Bệnh nhân</th>
                    <th>Loại xét nghiệm</th>
                    <th>Phòng khám</th>
                    <th>Ngày xét nghiệm</th>
                    <th>Giờ xét nghiệm</th>
                    <th>Trạng thái</th>
                    <th>Kết quả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id}>
                      <td>#{test.id}</td>
                      <td>{test.patientName || "N/A"}</td>
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
                          className={`badge ${getStatusBadgeClass(
                            test.status
                          )}`}
                        >
                          {getStatusLabel(test.status)}
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
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(test)}
                        >
                          <i className="fa fa-eye me-1"></i>Chi tiết
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

      {/* Detail Modal */}
      {showDetailModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1050,
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailModal(false);
              setSelectedTest(null);
              setNewStatus("");
            }
          }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-scrollable"
            style={{
              zIndex: 1051,
              position: "relative",
              margin: "1.75rem auto",
              maxWidth: "800px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Chi tiết xét nghiệm #{selectedTest?.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTest(null);
                    setNewStatus("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {isLoadingDetail ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : selectedTest ? (
                  <>
                    {/* Test Info */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="text-muted mb-3">Thông tin xét nghiệm</h6>
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>ID:</strong></td>
                              <td>#{selectedTest.id}</td>
                            </tr>
                            <tr>
                              <td><strong>Bệnh nhân:</strong></td>
                              <td>{selectedTest.patientName || "N/A"}</td>
                            </tr>
                            <tr>
                              <td><strong>Phòng khám:</strong></td>
                              <td>{selectedTest.clinicName || "N/A"}</td>
                            </tr>
                            <tr>
                              <td><strong>Loại xét nghiệm:</strong></td>
                              <td>{selectedTest.testType || "N/A"}</td>
                            </tr>
                            <tr>
                              <td><strong>Trạng thái:</strong></td>
                              <td>
                                <span
                                  className={`badge ${getStatusBadgeClass(
                                    selectedTest.status
                                  )}`}
                                >
                                  {getStatusLabel(selectedTest.status)}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Giá:</strong></td>
                              <td>
                                {selectedTest.price
                                  ? formatCurrency(selectedTest.price)
                                  : "N/A"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-muted mb-3">Thông tin lịch hẹn</h6>
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>Ngày xét nghiệm:</strong></td>
                              <td>
                                {selectedTest.testDate
                                  ? new Date(
                                      selectedTest.testDate
                                    ).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Giờ xét nghiệm:</strong></td>
                              <td>{selectedTest.testTime || "N/A"}</td>
                            </tr>
                            <tr>
                              <td><strong>Ngày tạo:</strong></td>
                              <td>
                                {selectedTest.createdAt
                                  ? new Date(
                                      selectedTest.createdAt
                                    ).toLocaleString("vi-VN")
                                  : "N/A"}
                              </td>
                            </tr>
                            {selectedTest.completedAt && (
                              <tr>
                                <td><strong>Ngày hoàn thành:</strong></td>
                                <td>
                                  {new Date(
                                    selectedTest.completedAt
                                  ).toLocaleString("vi-VN")}
                                </td>
                              </tr>
                            )}
                            {selectedTest.resultFileUrl && (
                              <tr>
                                <td><strong>Kết quả:</strong></td>
                                <td>
                                  <a
                                    href={selectedTest.resultFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-success"
                                  >
                                    <i className="fa fa-download me-1"></i>
                                    Tải xuống kết quả
                                  </a>
                                </td>
                              </tr>
                            )}
                            {selectedTest.notes && (
                              <tr>
                                <td><strong>Ghi chú:</strong></td>
                                <td>{selectedTest.notes}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Update Status */}
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="text-muted mb-3">Cập nhật trạng thái xét nghiệm</h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">
                              Trạng thái hiện tại
                            </label>
                            <div>
                              <span
                                className={`badge ${getStatusBadgeClass(
                                  selectedTest.status
                                )}`}
                              >
                                {getStatusLabel(selectedTest.status)}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">
                              Chuyển sang trạng thái
                            </label>
                            <select
                              className="form-select"
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              disabled={isUpdatingStatus}
                            >
                              <option value="PENDING">PENDING - Chờ xử lý</option>
                              <option value="SCHEDULED">SCHEDULED - Đã lên lịch</option>
                              <option value="COMPLETED">COMPLETED - Hoàn thành</option>
                              <option value="CANCELLED">CANCELLED - Đã hủy</option>
                            </select>
                          </div>
                        </div>
                        {newStatus !== selectedTest.status && (
                          <div className="mt-3">
                            <button
                              className="btn btn-primary"
                              onClick={handleUpdateStatus}
                              disabled={isUpdatingStatus}
                            >
                              {isUpdatingStatus ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                  ></span>
                                  Đang cập nhật...
                                </>
                              ) : (
                                <>
                                  <i className="fa fa-save me-2"></i>
                                  Cập nhật trạng thái
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted">Không tìm thấy thông tin xét nghiệm</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTest(null);
                    setNewStatus("");
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
  );
}
