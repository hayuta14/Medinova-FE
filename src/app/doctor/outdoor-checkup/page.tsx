'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAppointmentManagement } from '@/generated/api/endpoints/appointment-management/appointment-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getUser } from '@/utils/auth';
import type { AppointmentResponse } from '@/generated/api/models';

export default function OutdoorCheckupPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');

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

  // Load appointments when doctor ID is available or view mode changes
  useEffect(() => {
    if (doctorId) {
      if (viewMode === 'today') {
        loadTodayAppointments();
      } else {
        loadAllAppointments();
      }
    }
  }, [doctorId, viewMode]);

  // Load today's appointments
  const loadTodayAppointments = useCallback(async () => {
    if (!doctorId) return;

    try {
      setIsLoading(true);
      setErrorMessage('');
      const appointmentApi = getAppointmentManagement();
      const response = await appointmentApi.getTodayAppointments({ doctorId });
      
      // Handle response - could be array directly or wrapped in data
      const appointmentsData = (response as any)?.data || response;
      const appointmentsList = Array.isArray(appointmentsData) ? appointmentsData : [];
      
      // Sort appointments by time (earliest first)
      const sortedAppointments = appointmentsList.sort((a, b) => {
        const timeA = a.appointmentTime || a.scheduleStartTime || '';
        const timeB = b.appointmentTime || b.scheduleStartTime || '';
        return timeA.localeCompare(timeB);
      });
      
      setAppointments(sortedAppointments);
    } catch (error: any) {
      console.error('Error loading today appointments:', error);
      setErrorMessage('Có lỗi xảy ra khi tải lịch hẹn. Vui lòng thử lại.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  // Load all appointments
  const loadAllAppointments = useCallback(async () => {
    if (!doctorId) return;

    try {
      setIsLoading(true);
      setErrorMessage('');
      const appointmentApi = getAppointmentManagement();
      const response = await appointmentApi.getAppointments({ 
        doctorId,
        page: 0,
        size: 1000 // Get a large number to show all appointments
      });
      
      // Handle response - API returns Page object with content array
      const pageData = (response as any)?.data || response;
      const appointmentsList = pageData?.content || pageData || [];
      
      // Sort appointments by date and time (earliest first)
      const sortedAppointments = appointmentsList.sort((a: AppointmentResponse, b: AppointmentResponse) => {
        const dateTimeA = a.appointmentTime || a.scheduleWorkDate || '';
        const dateTimeB = b.appointmentTime || b.scheduleWorkDate || '';
        return dateTimeA.localeCompare(dateTimeB);
      });
      
      setAppointments(sortedAppointments);
    } catch (error: any) {
      console.error('Error loading all appointments:', error);
      setErrorMessage('Có lỗi xảy ra khi tải lịch hẹn. Vui lòng thử lại.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  // Format time for display
  const formatTime = (time: string | any): string => {
    if (!time) return 'N/A';
    
    // If it's a LocalTime object with hour and minute
    if (typeof time === 'object' && time.hour !== undefined && time.minute !== undefined) {
      return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
    }
    
    // If it's a datetime string
    if (typeof time === 'string') {
      try {
        const date = new Date(time);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        // If it's already in HH:mm format
        if (time.match(/^\d{2}:\d{2}/)) {
          return time.substring(0, 5);
        }
      } catch (e) {
        // If parsing fails, return as is
        return time;
      }
    }
    
    return String(time);
  };

  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string | undefined): string => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-warning';
      case 'CONFIRMED':
      case 'BOOKED':
        return 'bg-info';
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status: string | undefined): string => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
      case 'BOOKED':
        return 'Đã xác nhận';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status || 'N/A';
    }
  };

  const handleStartConsultation = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
  };

  const handleMarkCompleted = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      // TODO: Implement API call to mark appointment as completed
      const appointmentApi = getAppointmentManagement();
      await appointmentApi.updateAppointmentStatus(id, { status: 'CANCELLED' }); // Temporary - need proper status
      handleRefresh();
    } catch (error) {
      console.error('Error marking as completed:', error);
      setErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  const handleMarkAbsent = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      // TODO: Implement API call to mark patient as absent
      console.log('Mark absent:', id);
      handleRefresh();
    } catch (error) {
      console.error('Error marking as absent:', error);
      setErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  const handleRequestLab = (id: number | undefined) => {
    // TODO: Implement request lab test
    console.log('Request lab:', id);
  };

  // Handle refresh button
  const handleRefresh = () => {
    if (viewMode === 'today') {
      loadTodayAppointments();
    } else {
      loadAllAppointments();
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🏥 Quản lý lịch khám ngoại trú</h2>
        <div className="d-flex gap-2">
          {/* View Mode Toggle */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('today')}
              disabled={isLoading}
            >
              <i className="fa fa-calendar-day me-2"></i>
              Hôm nay
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('all')}
              disabled={isLoading}
            >
              <i className="fa fa-calendar-alt me-2"></i>
              Tất cả
            </button>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <i className={`fa fa-${isLoading ? 'spinner fa-spin' : 'sync'} me-2`}></i>
            Làm mới
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fa fa-exclamation-circle me-2"></i>
          {errorMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorMessage('')}
          ></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className={`fa fa-${viewMode === 'today' ? 'calendar-day' : 'calendar-alt'} me-2`}></i>
            {viewMode === 'today' ? 'Danh sách lịch khám hôm nay' : 'Danh sách tất cả lịch khám'}
          </h5>
          <span className="badge bg-light text-dark">
            {appointments.length} lịch hẹn
          </span>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Đang tải lịch hẹn...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                {viewMode === 'today' 
                  ? 'Chưa có lịch khám nào trong ngày hôm nay' 
                  : 'Chưa có lịch khám nào'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    {viewMode === 'all' && <th style={{ width: '120px' }}>Ngày</th>}
                    <th style={{ width: '120px' }}>Thời gian</th>
                    <th>Bệnh nhân</th>
                    <th>Email</th>
                    <th>Tuổi / Giới tính</th>
                    <th>Triệu chứng</th>
                    <th style={{ width: '120px' }}>Trạng thái</th>
                    <th style={{ width: '250px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id}>
                      {viewMode === 'all' && (
                        <td>
                          <div className="fw-bold">
                            {formatDate(apt.scheduleWorkDate || apt.appointmentTime)}
                          </div>
                        </td>
                      )}
                      <td>
                        <div className="fw-bold">
                          {formatTime(apt.appointmentTime || apt.scheduleStartTime)}
                        </div>
                        {apt.scheduleEndTime && (
                          <small className="text-muted">
                            - {formatTime(apt.scheduleEndTime)}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold">{apt.patientName || 'N/A'}</div>
                        {apt.clinicName && (
                          <small className="text-muted d-block">{apt.clinicName}</small>
                        )}
                      </td>
                      <td>
                        <small>{apt.patientEmail || 'N/A'}</small>
                      </td>
                      <td>
                        {apt.age && (
                          <span className="me-2">{apt.age} tuổi</span>
                        )}
                        {apt.gender && (
                          <span className="badge bg-secondary">
                            {apt.gender === 'MALE' ? 'Nam' : apt.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                          </span>
                        )}
                        {!apt.age && !apt.gender && 'N/A'}
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {apt.symptoms ? (
                            <small className="text-truncate d-block" title={apt.symptoms}>
                              {apt.symptoms}
                            </small>
                          ) : (
                            <small className="text-muted">Không có</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(apt.status)}`}>
                          {getStatusText(apt.status)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleStartConsultation(apt)}
                            title="Bắt đầu khám"
                          >
                            <i className="fa fa-play"></i>
                          </button>
                          <button
                            className="btn btn-success"
                            onClick={() => handleMarkCompleted(apt.id)}
                            title="Hoàn thành"
                            disabled={apt.status === 'COMPLETED' || apt.status === 'CANCELLED'}
                          >
                            <i className="fa fa-check"></i>
                          </button>
                          <button
                            className="btn btn-warning"
                            onClick={() => handleMarkAbsent(apt.id)}
                            title="Vắng mặt"
                          >
                            <i className="fa fa-times"></i>
                          </button>
                          <button
                            className="btn btn-info"
                            onClick={() => handleRequestLab(apt.id)}
                            title="Yêu cầu xét nghiệm"
                          >
                            <i className="fa fa-vial"></i>
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

      {/* Medical Record Modal */}
      {selectedAppointment && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedAppointment(null);
            }
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fa fa-user-md me-2"></i>
                  Hồ sơ bệnh nhân - {selectedAppointment.patientName || 'N/A'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedAppointment(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="text-primary">
                      <i className="fa fa-info-circle me-2"></i>
                      Thông tin bệnh nhân
                    </h6>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Tên:</strong></td>
                          <td>{selectedAppointment.patientName || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{selectedAppointment.patientEmail || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Tuổi:</strong></td>
                          <td>{selectedAppointment.age || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Giới tính:</strong></td>
                          <td>
                            {selectedAppointment.gender === 'MALE' ? 'Nam' : 
                             selectedAppointment.gender === 'FEMALE' ? 'Nữ' : 
                             selectedAppointment.gender || 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Cơ sở:</strong></td>
                          <td>{selectedAppointment.clinicName || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">
                      <i className="fa fa-calendar me-2"></i>
                      Thông tin lịch hẹn
                    </h6>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Thời gian:</strong></td>
                          <td>
                            {formatTime(selectedAppointment.appointmentTime || selectedAppointment.scheduleStartTime)}
                            {selectedAppointment.scheduleEndTime && (
                              <> - {formatTime(selectedAppointment.scheduleEndTime)}</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Ngày:</strong></td>
                          <td>{formatDate(selectedAppointment.scheduleWorkDate || selectedAppointment.appointmentTime)}</td>
                        </tr>
                        <tr>
                          <td><strong>Trạng thái:</strong></td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(selectedAppointment.status)}`}>
                              {getStatusText(selectedAppointment.status)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mb-3">
                  <h6 className="text-primary">
                    <i className="fa fa-stethoscope me-2"></i>
                    Triệu chứng / Lý do khám
                  </h6>
                  <div className="p-3 bg-light rounded">
                    {selectedAppointment.symptoms || 'Không có thông tin'}
                  </div>
                </div>
                <div className="mt-3">
                  <h6 className="text-primary">
                    <i className="fa fa-file-medical me-2"></i>
                    Ghi chú khám
                  </h6>
                  <textarea 
                    className="form-control" 
                    rows={4} 
                    placeholder="Nhập ghi chú khám, chẩn đoán, và kế hoạch điều trị..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAppointment(null)}
                >
                  <i className="fa fa-times me-2"></i>Đóng
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    // TODO: Implement save consultation result
                    console.log('Save consultation result');
                  }}
                >
                  <i className="fa fa-save me-2"></i>Lưu kết quả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
