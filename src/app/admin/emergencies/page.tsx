"use client";

import { useState, useEffect, useMemo } from "react";
import { getEmergencyManagement } from "@/generated/api/endpoints/emergency-management/emergency-management";
import { getToken } from "@/utils/auth";
import axios from "axios";

interface AvailableStaff {
  id: number;
  staffType: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  clinicId?: number;
  clinicName?: string;
  department?: string;
  experienceYears?: number;
}

export default function EmergenciesPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<any>(null);
  const [availableStaff, setAvailableStaff] = useState<AvailableStaff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadEmergencies();
  }, [statusFilter, currentPage, pageSize]);

  const loadEmergencies = async () => {
    try {
      setIsLoading(true);
      const emergencyApi = getEmergencyManagement();

      // Use history endpoint with pagination
      const token = getToken();
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/emergencies/history`,
        {
          params: {
            page: currentPage,
            size: pageSize,
            ...(statusFilter ? { status: statusFilter } : {}),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      let emergenciesList = Array.isArray(data.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];

      // Sort: NEEDS_ATTENTION first, then by created date (newest first)
      emergenciesList.sort((a: any, b: any) => {
        // NEEDS_ATTENTION always comes first
        if (a.status === "NEEDS_ATTENTION" && b.status !== "NEEDS_ATTENTION") {
          return -1;
        }
        if (a.status !== "NEEDS_ATTENTION" && b.status === "NEEDS_ATTENTION") {
          return 1;
        }
        // Then sort by created date (newest first)
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setEmergencies(emergenciesList);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || emergenciesList.length);
    } catch (error: any) {
      console.error("Error loading emergencies:", error);
      // Fallback to getAllEmergencies if history endpoint fails
      try {
        const emergencyApi = getEmergencyManagement();
        const response = await emergencyApi.getAllEmergencies({
          status: statusFilter || undefined,
        });
        const data = (response as any)?.data || response;
        let emergenciesList = Array.isArray(data) ? data : [];

        // Sort: NEEDS_ATTENTION first
        emergenciesList.sort((a: any, b: any) => {
          if (
            a.status === "NEEDS_ATTENTION" &&
            b.status !== "NEEDS_ATTENTION"
          ) {
            return -1;
          }
          if (
            a.status !== "NEEDS_ATTENTION" &&
            b.status === "NEEDS_ATTENTION"
          ) {
            return 1;
          }
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        setEmergencies(emergenciesList);
        setTotalPages(Math.ceil(emergenciesList.length / pageSize));
        setTotalElements(emergenciesList.length);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setEmergencies([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableStaff = async () => {
    try {
      setIsLoadingStaff(true);
      const token = getToken();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const endpoint = `${apiUrl}/api/emergencies/available-staff`;
      
      console.log("🔍 Loading available staff from:", endpoint);

      // Load all available staff (with pagination)
      const allStaff: AvailableStaff[] = [];
      let page = 0;
      let hasMore = true;
      let maxPages = 10; // Safety limit to prevent infinite loop

      while (hasMore && page < maxPages) {
        console.log(`📄 Fetching page ${page}...`);
        
        const response = await axios.get(endpoint, {
          params: {
            page: page,
            size: 100, // Load more at once
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(`✅ Response from page ${page}:`, {
          status: response.status,
          data: response.data,
          hasContent: !!response.data?.content,
          contentLength: response.data?.content?.length || 0,
          isLast: response.data?.last,
          totalElements: response.data?.totalElements,
        });

        const data = response.data;
        
        // Handle different response formats
        let staff: AvailableStaff[] = [];
        if (Array.isArray(data)) {
          // Direct array response
          staff = data;
        } else if (Array.isArray(data.content)) {
          // Page response
          staff = data.content;
        } else if (data.data && Array.isArray(data.data)) {
          // Nested data response
          staff = data.data;
        }

        console.log(`📊 Extracted ${staff.length} staff from page ${page}`, {
          doctors: staff.filter(s => s.staffType === "DOCTOR").length,
          drivers: staff.filter(s => s.staffType === "DRIVER").length,
          sample: staff.slice(0, 2), // Show first 2 items
        });

        allStaff.push(...staff);

        // Check if there are more pages
        hasMore = !data.last && staff.length > 0 && (data.totalElements > allStaff.length);
        
        console.log(`📈 Pagination status:`, {
          hasMore,
          isLast: data.last,
          staffLength: staff.length,
          totalLoaded: allStaff.length,
          totalElements: data.totalElements,
        });

        page++;
      }

      const totalDoctors = allStaff.filter(s => s.staffType === "DOCTOR").length;
      const totalDrivers = allStaff.filter(s => s.staffType === "DRIVER").length;
      
      console.log("✅ Total available staff loaded:", {
        total: allStaff.length,
        doctors: totalDoctors,
        drivers: totalDrivers,
        staffList: allStaff,
      });

      // Log each doctor separately for debugging
      const doctors = allStaff.filter(s => s.staffType === "DOCTOR");
      if (doctors.length > 0) {
        console.log("👨‍⚕️ Available doctors:", doctors.map(d => ({
          id: d.id,
          name: d.name,
          email: d.email,
          clinic: d.clinicName,
          department: d.department,
          status: d.status,
        })));
      } else {
        console.warn("⚠️ No doctors found in available staff!");
        console.warn("   This could mean:");
        console.warn("   1. No doctors are APPROVED and ACTIVE");
        console.warn("   2. All doctors are assigned to active emergencies");
        console.warn("   3. All doctors have appointments (ongoing or starting soon)");
        console.warn("   4. All doctors are on approved leave");
        console.warn("   Total staff loaded:", allStaff.length);
        console.warn("   Drivers found:", totalDrivers);
      }

      setAvailableStaff(allStaff);
    } catch (error: any) {
      console.error("❌ Error loading available staff:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        fullError: error,
      });
      alert(`Lỗi khi tải danh sách bác sĩ/tài xế: ${error?.response?.data?.message || error?.message || "Unknown error"}`);
      setAvailableStaff([]);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleOpenAssignModal = async (emergency: any) => {
    setSelectedEmergency(emergency);
    setSelectedDoctorId(null);
    setSelectedDriverId(null);
    setDoctorSearchTerm("");
    setDriverSearchTerm("");
    setShowAssignModal(true);
    await loadAvailableStaff();
  };

  const handleAssignEmergency = async () => {
    if (!selectedEmergency || !selectedDoctorId || !selectedDriverId) {
      alert("Vui lòng chọn cả Bác sĩ và Tài xế");
      return;
    }

    try {
      setIsAssigning(true);
      const token = getToken();

      await axios.post(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/emergencies/assign-emergency`,
        {
          emergencyId: selectedEmergency.id,
          doctorId: selectedDoctorId,
          driverId: selectedDriverId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Close modal and refresh list
      setShowAssignModal(false);
      setSelectedEmergency(null);
      await loadEmergencies();
      alert("Điều phối thành công!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi điều phối";
      alert("Lỗi: " + errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter staff by search term
  const filteredDoctors = useMemo(() => {
    if (!availableStaff || availableStaff.length === 0) {
      return [];
    }
    
    const doctors = availableStaff.filter((staff) => staff.staffType === "DOCTOR");
    
    // If search term is empty, return all doctors
    if (!doctorSearchTerm || doctorSearchTerm.trim() === "") {
      return doctors;
    }
    
    // Filter by search term
    const searchLower = doctorSearchTerm.toLowerCase().trim();
    return doctors.filter(
      (staff) =>
        staff.name?.toLowerCase().includes(searchLower) ||
        staff.email?.toLowerCase().includes(searchLower) ||
        staff.phone?.includes(doctorSearchTerm.trim())
    );
  }, [availableStaff, doctorSearchTerm]);

  const filteredDrivers = useMemo(() => {
    if (!availableStaff || availableStaff.length === 0) {
      return [];
    }
    
    const drivers = availableStaff.filter((staff) => staff.staffType === "DRIVER");
    
    // If search term is empty, return all drivers
    if (!driverSearchTerm || driverSearchTerm.trim() === "") {
      return drivers;
    }
    
    // Filter by search term
    const searchLower = driverSearchTerm.toLowerCase().trim();
    return drivers.filter(
      (staff) =>
        staff.name?.toLowerCase().includes(searchLower) ||
        staff.email?.toLowerCase().includes(searchLower) ||
        staff.phone?.includes(driverSearchTerm.trim())
    );
  }, [availableStaff, driverSearchTerm]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-warning";
      case "NEEDS_ATTENTION":
        return "bg-danger";
      case "ASSIGNED":
        return "bg-info";
      case "EN_ROUTE":
        return "bg-primary";
      case "ARRIVED":
        return "bg-success";
      case "COMPLETED":
        return "bg-success";
      case "CANCELLED":
        return "bg-secondary";
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

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-danger";
      case "HIGH":
        return "bg-warning";
      case "MEDIUM":
        return "bg-info";
      case "LOW":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fa fa-ambulance me-2"></i>
          Quản lý ca cấp cứu
        </h2>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={loadEmergencies}
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="NEEDS_ATTENTION">Cần xử lý</option>
                <option value="ASSIGNED">Đã phân công</option>
                <option value="EN_ROUTE">Đang di chuyển</option>
                <option value="ARRIVED">Đã đến nơi</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Số lượng mỗi trang</label>
              <select
                className="form-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="text-muted">
                Tổng: <strong>{totalElements}</strong> ca cấp cứu
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
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : emergencies.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-ambulance fa-3x text-muted mb-3"></i>
              <p className="text-muted">Không tìm thấy ca cấp cứu nào</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Bệnh nhân</th>
                      <th>Bệnh viện</th>
                      <th>Bác sĩ</th>
                      <th>Tài xế</th>
                      <th>Ưu tiên</th>
                      <th>Trạng thái</th>
                      <th>Thời gian tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencies.map((emergency) => (
                      <tr
                        key={emergency.id}
                        className={
                          emergency.status === "NEEDS_ATTENTION"
                            ? "table-danger"
                            : ""
                        }
                      >
                        <td>
                          #{emergency.id}
                          {emergency.status === "NEEDS_ATTENTION" && (
                            <span className="badge bg-danger ms-2">
                              <i className="fa fa-exclamation-triangle me-1"></i>
                              CẦN XỬ LÝ
                            </span>
                          )}
                        </td>
                        <td>
                          <div>
                            <strong>{emergency.patientName || "N/A"}</strong>
                            {emergency.patientPhone && (
                              <div className="text-muted small">
                                <i className="fa fa-phone me-1"></i>
                                {emergency.patientPhone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{emergency.clinicName || "N/A"}</td>
                        <td>
                          {emergency.doctorName || (
                            <span className="text-muted">Chưa phân công</span>
                          )}
                        </td>
                        <td>
                          {emergency.driverName || (
                            <span className="text-muted">Chưa phân công</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${getPriorityBadgeClass(
                              emergency.priority || "MEDIUM"
                            )}`}
                          >
                            {emergency.priority || "MEDIUM"}
                          </span>
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
                          {emergency.createdAt
                            ? new Date(emergency.createdAt).toLocaleString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </td>
                        <td>
                          {(emergency.status === "PENDING" ||
                            emergency.status === "NEEDS_ATTENTION" ||
                            !emergency.doctorId ||
                            !emergency.driverId) && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleOpenAssignModal(emergency)}
                            >
                              <i className="fa fa-user-plus me-1"></i>
                              Điều phối
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Emergency pagination">
                  <ul className="pagination justify-content-center mt-4">
                    <li
                      className={`page-item ${
                        currentPage === 0 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        Trước
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i).map(
                      (page) => (
                        <li
                          key={page}
                          className={`page-item ${
                            currentPage === page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page + 1}
                          </button>
                        </li>
                      )
                    )}
                    <li
                      className={`page-item ${
                        currentPage >= totalPages - 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedEmergency && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fa fa-user-plus me-2"></i>
                  Điều phối ca cấp cứu #{selectedEmergency.id}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedEmergency(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Bệnh nhân:</strong> {selectedEmergency.patientName}
                  <br />
                  <strong>Địa chỉ:</strong> {selectedEmergency.patientAddress}
                  <br />
                  <strong>Ưu tiên:</strong>{" "}
                  <span
                    className={`badge ${getPriorityBadgeClass(
                      selectedEmergency.priority || "MEDIUM"
                    )}`}
                  >
                    {selectedEmergency.priority || "MEDIUM"}
                  </span>
                </div>

                <hr />

                {/* Doctor Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fa fa-user-md me-2"></i>
                    Chọn Bác sĩ <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Tìm kiếm bác sĩ (tên, email, số điện thoại)..."
                    value={doctorSearchTerm}
                    onChange={(e) => setDoctorSearchTerm(e.target.value)}
                  />
                  {isLoadingStaff ? (
                    <div className="text-center py-2">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                      <span className="ms-2">Đang tải danh sách bác sĩ...</span>
                    </div>
                  ) : (
                    <>
                      <select
                        className="form-select"
                        value={selectedDoctorId || ""}
                        onChange={(e) =>
                          setSelectedDoctorId(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        size={5}
                        style={{ maxHeight: "200px" }}
                      >
                        <option value="">-- Chọn bác sĩ --</option>
                        {filteredDoctors.length === 0 ? (
                          <option disabled>Không có bác sĩ rảnh</option>
                        ) : (
                          filteredDoctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.name} - {doctor.email}
                              {doctor.clinicName && ` (${doctor.clinicName})`}
                              {doctor.department && ` - ${doctor.department}`}
                            </option>
                          ))
                        )}
                      </select>
                      {filteredDoctors.length === 0 && availableStaff.length > 0 && (
                        <div className="alert alert-warning mt-2 mb-0">
                          <small>
                            <i className="fa fa-exclamation-triangle me-1"></i>
                            Không tìm thấy bác sĩ rảnh. Có {availableStaff.filter(s => s.staffType === "DRIVER").length} tài xế rảnh.
                            <br />
                            <small className="text-muted">
                              (Có thể bác sĩ đang có lịch hẹn, đang xử lý ca cấp cứu khác, hoặc đang nghỉ phép)
                            </small>
                          </small>
                        </div>
                      )}
                      {availableStaff.length === 0 && !isLoadingStaff && (
                        <div className="alert alert-danger mt-2 mb-0">
                          <small>
                            <i className="fa fa-exclamation-circle me-1"></i>
                            Không thể tải danh sách bác sĩ/tài xế. Vui lòng thử lại.
                          </small>
                        </div>
                      )}
                    </>
                  )}
                  {selectedDoctorId && (
                    <div className="mt-2">
                      <small className="text-success">
                        <i className="fa fa-check-circle me-1"></i>
                        Đã chọn:{" "}
                        {
                          filteredDoctors.find((d) => d.id === selectedDoctorId)
                            ?.name
                        }
                      </small>
                    </div>
                  )}
                </div>

                {/* Driver Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fa fa-truck-medical me-2"></i>
                    Chọn Tài xế <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Tìm kiếm tài xế (tên, email, số điện thoại)..."
                    value={driverSearchTerm}
                    onChange={(e) => setDriverSearchTerm(e.target.value)}
                  />
                  <select
                    className="form-select"
                    value={selectedDriverId || ""}
                    onChange={(e) =>
                      setSelectedDriverId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    size={5}
                    style={{ maxHeight: "200px" }}
                  >
                    <option value="">-- Chọn tài xế --</option>
                    {isLoadingStaff ? (
                      <option disabled>Đang tải...</option>
                    ) : filteredDrivers.length === 0 ? (
                      <option disabled>Không có tài xế rảnh</option>
                    ) : (
                      filteredDrivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} - {driver.email} - {driver.phone}
                        </option>
                      ))
                    )}
                  </select>
                  {selectedDriverId && (
                    <div className="mt-2">
                      <small className="text-success">
                        <i className="fa fa-check-circle me-1"></i>
                        Đã chọn:{" "}
                        {
                          filteredDrivers.find((d) => d.id === selectedDriverId)
                            ?.name
                        }
                      </small>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedEmergency(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAssignEmergency}
                  disabled={
                    isAssigning ||
                    !selectedDoctorId ||
                    !selectedDriverId ||
                    isLoadingStaff
                  }
                >
                  {isAssigning ? (
                    <>
                      <i className="fa fa-spinner fa-spin me-2"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-check me-2"></i>
                      Xác nhận điều phối
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
