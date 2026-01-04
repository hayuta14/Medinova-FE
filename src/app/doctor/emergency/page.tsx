'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEmergencyManagement } from '@/generated/api/endpoints/emergency-management/emergency-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getUser } from '@/utils/auth';
import type { EmergencyResponse } from '@/generated/api/models';

export default function EmergencyPage() {
  const [emergencies, setEmergencies] = useState<EmergencyResponse[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(''); // Filter by status
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get doctor ID from user
  useEffect(() => {
    const loadDoctorId = async () => {
      try {
        const userData = getUser();
        if (!userData) {
          console.warn('User data not found');
          return;
        }

        // Try to get doctor ID directly from user object
        const directDoctorId = userData.doctorId || userData.doctor?.id;
        if (directDoctorId) {
          setDoctorId(Number(directDoctorId));
          return;
        }

        // If not found, search for doctor by user ID or email
        const userId = userData.id || userData.userId || userData.user?.id;
        const userEmail = userData.email;

        if (!userId && !userEmail) {
          console.warn('User ID and email not found');
          return;
        }

        const doctorApi = getDoctorManagement();
        const response = await doctorApi.getAllDoctors();
        const doctorsData = (response as any)?.data || response;
        const allDoctors = Array.isArray(doctorsData) ? doctorsData : [];
        
        // Find doctor by user ID or email
        let currentDoctor = null;
        if (userId) {
          currentDoctor = allDoctors.find((doc: any) => 
            doc.user?.id === userId || 
            doc.userId === userId ||
            doc.user?.userId === userId
          );
        }
        
        if (!currentDoctor && userEmail) {
          currentDoctor = allDoctors.find((doc: any) => 
            doc.user?.email === userEmail || 
            doc.email === userEmail
          );
        }
        
        if (currentDoctor && currentDoctor.id) {
          setDoctorId(Number(currentDoctor.id));
        }
      } catch (error) {
        console.error('Error loading doctor ID:', error);
      }
    };

    loadDoctorId();
  }, []);

  // Load emergencies when doctor ID is available
  useEffect(() => {
    if (doctorId) {
      loadEmergencies();
      // Auto-refresh every 10 seconds for real-time updates
      const interval = setInterval(() => {
        loadEmergencies(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [doctorId, statusFilter]);

  // Load emergencies
  const loadEmergencies = useCallback(async (silent = false) => {
    if (!doctorId) return;

    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setErrorMessage('');

      const emergencyApi = getEmergencyManagement();
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await emergencyApi.getMyEmergencies(params);
      const emergenciesData = (response as any)?.data || response;
      const emergenciesList = Array.isArray(emergenciesData) ? emergenciesData : [];
      
      // Sort by creation time (newest first)
      emergenciesList.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setEmergencies(emergenciesList);
    } catch (error: any) {
      console.error('Error loading emergencies:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tải danh sách ca cấp cứu.';
      setErrorMessage(errorMsg);
      setEmergencies([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [doctorId, statusFilter]);

  // Load emergency details
  const loadEmergencyDetails = useCallback(async (id: number) => {
    try {
      const emergencyApi = getEmergencyManagement();
      const response = await emergencyApi.getEmergencyById(id);
      const emergency = (response as any)?.data || response;
      setSelectedEmergency(emergency);
    } catch (error: any) {
      console.error('Error loading emergency details:', error);
      alert('Có lỗi xảy ra khi tải chi tiết ca cấp cứu.');
    }
  }, []);

  const handleViewDetails = async (emergency: EmergencyResponse) => {
    if (emergency.id) {
      await loadEmergencyDetails(emergency.id);
    } else {
      setSelectedEmergency(emergency);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return { class: 'bg-warning', label: 'Chờ xử lý' };
      case 'DISPATCHED':
        return { class: 'bg-info', label: 'Đã điều động' };
      case 'IN_TRANSIT':
        return { class: 'bg-primary', label: 'Đang di chuyển' };
      case 'COMPLETED':
        return { class: 'bg-success', label: 'Hoàn thành' };
      case 'CANCELLED':
        return { class: 'bg-secondary', label: 'Đã hủy' };
      default:
        return { class: 'bg-danger', label: status || 'N/A' };
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return { class: 'bg-danger', label: 'Cao' };
      case 'MEDIUM':
        return { class: 'bg-warning', label: 'Trung bình' };
      case 'LOW':
        return { class: 'bg-info', label: 'Thấp' };
      default:
        return { class: 'bg-secondary', label: priority || 'N/A' };
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">🚨 Quản lý cấp cứu</h2>
          <small className="text-muted">Tự động cập nhật mỗi 10 giây</small>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {isRefreshing && (
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          )}
          <button
            className="btn btn-outline-primary"
            onClick={() => loadEmergencies()}
            disabled={isLoading}
          >
            <i className="fa fa-sync me-1"></i>Tải lại
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <label className="mb-0 fw-bold">Lọc theo trạng thái:</label>
            <button
              className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setStatusFilter('')}
            >
              Tất cả
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setStatusFilter('PENDING')}
            >
              Chờ xử lý
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'DISPATCHED' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setStatusFilter('DISPATCHED')}
            >
              Đã điều động
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'IN_TRANSIT' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setStatusFilter('IN_TRANSIT')}
            >
              Đang di chuyển
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'COMPLETED' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setStatusFilter('COMPLETED')}
            >
              Hoàn thành
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      {isLoading && !isRefreshing ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : emergencies.length === 0 ? (
        <div className="card shadow-sm border-danger">
          <div className="card-body text-center py-5">
            <i className="fa fa-ambulance fa-3x text-danger mb-3"></i>
            <p className="text-muted">
              {statusFilter ? `Không có ca cấp cứu nào với trạng thái "${getStatusBadge(statusFilter).label}"` : 'Hiện tại không có ca cấp cứu nào'}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {emergencies.map((emergency) => {
            const statusBadge = getStatusBadge(emergency.status);
            const priorityBadge = getPriorityBadge(emergency.priority);
            const isUrgent = emergency.status === 'PENDING' || emergency.status === 'DISPATCHED';
            
            return (
              <div key={emergency.id} className="col-md-6 col-lg-4">
                <div className={`card shadow-sm border-start border-5 h-100 ${
                  isUrgent ? 'border-danger' : 'border-secondary'
                }`}>
                  <div className={`card-header text-white d-flex justify-content-between align-items-center ${
                    isUrgent ? 'bg-danger' : 'bg-secondary'
                  }`}>
                    <h6 className="mb-0">Ca cấp cứu #{emergency.id}</h6>
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <strong>Bệnh nhân:</strong> {emergency.patientName || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>SĐT:</strong> {emergency.patientPhone || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Địa chỉ:</strong> {emergency.patientAddress || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Mô tả:</strong> {emergency.description || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Mức độ ưu tiên:</strong>
                      <span className={`badge ${priorityBadge.class} ms-2`}>
                        {priorityBadge.label}
                      </span>
                    </div>
                    {emergency.clinicName && (
                      <div className="mb-2">
                        <strong>Cơ sở y tế:</strong> {emergency.clinicName}
                      </div>
                    )}
                    {emergency.ambulanceLicensePlate && (
                      <div className="mb-2">
                        <strong>Xe cấp cứu:</strong> {emergency.ambulanceLicensePlate}
                        {emergency.distanceKm && (
                          <span className="text-muted ms-1">
                            ({emergency.distanceKm.toFixed(2)} km)
                          </span>
                        )}
                      </div>
                    )}
                    {emergency.doctorName && (
                      <div className="mb-2">
                        <strong>Bác sĩ:</strong> {emergency.doctorName}
                      </div>
                    )}
                    <div className="mb-2">
                      <strong>Thời gian tạo:</strong> {formatDateTime(emergency.createdAt)}
                    </div>
                    {emergency.dispatchedAt && (
                      <div className="mb-2">
                        <strong>Thời gian điều động:</strong> {formatDateTime(emergency.dispatchedAt)}
                      </div>
                    )}
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => handleViewDetails(emergency)}
                      >
                        <i className="fa fa-info-circle me-1"></i>Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Emergency Detail Modal */}
      {selectedEmergency && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedEmergency(null);
            }
          }}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Chi tiết ca cấp cứu #{selectedEmergency.id}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedEmergency(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="text-primary">Thông tin bệnh nhân</h6>
                    <p><strong>Tên:</strong> {selectedEmergency.patientName || 'N/A'}</p>
                    <p><strong>SĐT:</strong> {selectedEmergency.patientPhone || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> {selectedEmergency.patientAddress || 'N/A'}</p>
                    {selectedEmergency.patientLat && selectedEmergency.patientLng && (
                      <p>
                        <strong>Vị trí:</strong>{' '}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedEmergency.patientLat},${selectedEmergency.patientLng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          <i className="fa fa-map-marker-alt text-danger me-1"></i>
                          Xem trên bản đồ
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">Thông tin ca cấp cứu</h6>
                    <p>
                      <strong>Trạng thái:</strong>{' '}
                      <span className={`badge ${getStatusBadge(selectedEmergency.status).class}`}>
                        {getStatusBadge(selectedEmergency.status).label}
                      </span>
                    </p>
                    <p>
                      <strong>Mức độ ưu tiên:</strong>{' '}
                      <span className={`badge ${getPriorityBadge(selectedEmergency.priority).class}`}>
                        {getPriorityBadge(selectedEmergency.priority).label}
                      </span>
                    </p>
                    <p><strong>Thời gian tạo:</strong> {formatDateTime(selectedEmergency.createdAt)}</p>
                    {selectedEmergency.dispatchedAt && (
                      <p><strong>Thời gian điều động:</strong> {formatDateTime(selectedEmergency.dispatchedAt)}</p>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <h6 className="text-primary">Mô tả</h6>
                  <p className="border p-3 rounded bg-light">
                    {selectedEmergency.description || 'Không có mô tả'}
                  </p>
                </div>
                {selectedEmergency.clinicName && (
                  <div className="mb-3">
                    <h6 className="text-primary">Cơ sở y tế</h6>
                    <p>{selectedEmergency.clinicName} (ID: {selectedEmergency.clinicId})</p>
                  </div>
                )}
                {selectedEmergency.ambulanceLicensePlate && (
                  <div className="mb-3">
                    <h6 className="text-primary">Xe cấp cứu</h6>
                    <p>
                      Biển số: {selectedEmergency.ambulanceLicensePlate}
                      {selectedEmergency.distanceKm && (
                        <span className="text-muted ms-2">
                          (Cách {selectedEmergency.distanceKm.toFixed(2)} km)
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {selectedEmergency.doctorName && (
                  <div className="mb-3">
                    <h6 className="text-primary">Bác sĩ được phân công</h6>
                    <p>{selectedEmergency.doctorName} (ID: {selectedEmergency.doctorId})</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedEmergency(null)}
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
