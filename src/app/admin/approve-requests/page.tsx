'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLeaveRequestManagement } from '@/generated/api/endpoints/leave-request-management/leave-request-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import type { DoctorLeaveRequest, LocalTime, Doctor } from '@/generated/api/models';

export default function ApproveRequestsPage() {
  const [activeTab, setActiveTab] = useState<'leave' | 'account'>('leave');
  const [leaveRequests, setLeaveRequests] = useState<DoctorLeaveRequest[]>([]);
  const [accountRequests, setAccountRequests] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load leave requests
  const loadLeaveRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const leaveApi = getLeaveRequestManagement();
      const response = await leaveApi.getAllLeaveRequests();
      
      // Handle response - could be array directly or wrapped in data
      const requestsData = (response as any)?.data || response;
      const requestsList = Array.isArray(requestsData) ? requestsData : [];
      
      // Filter only PENDING requests
      const pendingRequests = requestsList.filter((req: DoctorLeaveRequest) => 
        req.status === 'PENDING' || req.status === 'pending'
      );
      
      // Sort by creation date (newest first)
      const sortedRequests = pendingRequests.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setLeaveRequests(sortedRequests);
    } catch (error: any) {
      console.error('Error loading leave requests:', error);
      setErrorMessage('Failed to load leave requests. Please try again.');
      setLeaveRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load account update requests (doctors with PENDING update requests)
  const loadAccountRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const doctorApi = getDoctorManagement();
      const response = await doctorApi.getPendingDoctors();
      
      // Handle response - backend returns { doctors: [...], updateRequests: [...], totalPendingCount: number }
      const responseData = (response as any)?.data || response;
      let doctorsList: Doctor[] = [];
      
      if (responseData && typeof responseData === 'object') {
        // If response has doctors array
        if (responseData.doctors && Array.isArray(responseData.doctors)) {
          doctorsList = responseData.doctors;
        } else if (Array.isArray(responseData)) {
          doctorsList = responseData;
        }
      }
      
      // Sort by ID (newest first, assuming higher ID = newer)
      const sortedRequests = doctorsList.sort((a: Doctor, b: Doctor) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idB - idA;
      });
      
      setAccountRequests(sortedRequests);
    } catch (error: any) {
      console.error('Error loading account requests:', error);
      setErrorMessage('Failed to load account update requests. Please try again.');
      setAccountRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'leave') {
      loadLeaveRequests();
    } else {
      loadAccountRequests();
    }
  }, [activeTab, loadLeaveRequests, loadAccountRequests]);

  // Handle approve leave request
  const handleApproveLeave = async (id: number | undefined) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    try {
      const leaveApi = getLeaveRequestManagement();
      await leaveApi.updateLeaveRequestStatus(id, { status: 'APPROVED' });
      await loadLeaveRequests();
      alert('Leave request approved successfully!');
    } catch (error: any) {
      console.error('Error approving leave request:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to approve leave request. Please try again.';
      alert(errorMsg);
    }
  };

  // Handle reject leave request
  const handleRejectLeave = async (id: number | undefined) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to reject this leave request?')) {
      return;
    }

    try {
      const leaveApi = getLeaveRequestManagement();
      await leaveApi.updateLeaveRequestStatus(id, { status: 'REJECTED' });
      await loadLeaveRequests();
      alert('Leave request rejected successfully!');
    } catch (error: any) {
      console.error('Error rejecting leave request:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to reject leave request. Please try again.';
      alert(errorMsg);
    }
  };

  // Handle approve account update request
  const handleApproveAccount = async (doctorId: number | undefined) => {
    if (!doctorId) return;
    
    if (!confirm('Bạn có chắc chắn muốn phê duyệt yêu cầu cập nhật tài khoản này?')) {
      return;
    }

    try {
      const doctorApi = getDoctorManagement();
      await doctorApi.updateDoctorStatus(doctorId, { status: 'APPROVED' });
      await loadAccountRequests();
      alert('Phê duyệt yêu cầu cập nhật tài khoản thành công!');
    } catch (error: any) {
      console.error('Error approving account request:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Không thể phê duyệt yêu cầu. Vui lòng thử lại.';
      alert(errorMsg);
    }
  };

  // Handle reject account update request
  const handleRejectAccount = async (doctorId: number | undefined) => {
    if (!doctorId) return;
    
    if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu cập nhật tài khoản này?')) {
      return;
    }

    try {
      const doctorApi = getDoctorManagement();
      await doctorApi.updateDoctorStatus(doctorId, { status: 'REJECTED' });
      await loadAccountRequests();
      alert('Từ chối yêu cầu cập nhật tài khoản thành công!');
    } catch (error: any) {
      console.error('Error rejecting account request:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Không thể từ chối yêu cầu. Vui lòng thử lại.';
      alert(errorMsg);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format datetime
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Format LocalTime to HH:MM or HH:MM:SS
  const formatLocalTime = (localTime?: LocalTime | string): string => {
    // Handle string format (e.g., "09:00:00" or "09:00")
    if (typeof localTime === 'string') {
      // If it's already in HH:MM or HH:MM:SS format, return first 5 characters (HH:MM)
      if (localTime.match(/^\d{2}:\d{2}/)) {
        return localTime.substring(0, 5);
      }
      return localTime;
    }
    
    // Handle LocalTime object
    if (!localTime || typeof localTime !== 'object') {
      return 'N/A';
    }
    
    const hour = localTime.hour;
    const minute = localTime.minute;
    const second = localTime.second;
    
    if (hour === undefined && minute === undefined) {
      return 'N/A';
    }
    
    const hourStr = (hour ?? 0).toString().padStart(2, '0');
    const minuteStr = (minute ?? 0).toString().padStart(2, '0');
    
    // Include seconds if available
    if (second !== undefined && second !== null) {
      const secondStr = second.toString().padStart(2, '0');
      return `${hourStr}:${minuteStr}:${secondStr}`;
    }
    
    return `${hourStr}:${minuteStr}`;
  };

  // Format time range (startTime - endTime)
  const formatTimeRange = (startTime?: LocalTime | string, endTime?: LocalTime | string): string => {
    const start = formatLocalTime(startTime);
    const end = formatLocalTime(endTime);
    
    if (start === 'N/A' && end === 'N/A') {
      return 'All Day';
    }
    
    if (start === 'N/A') {
      return `Until ${end}`;
    }
    
    if (end === 'N/A') {
      return `From ${start}`;
    }
    
    return `${start} - ${end}`;
  };

  // Format department name
  const formatDepartmentName = (doctor: Doctor): string => {
    const department = (doctor as any).department;
    if (!department) {
      return doctor.specialization || 'N/A';
    }
    
    // If department is an object with displayName
    if (typeof department === 'object' && department.displayName) {
      return department.displayName;
    }
    
    // If department is a string (enum value), map it to display name
    const departmentMap: Record<string, string> = {
      'GENERAL_MEDICINE': 'Nội tổng quát',
      'PEDIATRICS': 'Nhi',
      'OBSTETRICS_GYNECOLOGY': 'Sản – Phụ',
      'SURGERY': 'Ngoại tổng quát',
      'CARDIOLOGY': 'Tim mạch',
      'NEUROLOGY': 'Thần kinh',
      'ORTHOPEDICS': 'Chấn thương chỉnh hình',
      'ONCOLOGY': 'Ung bướu',
      'GASTROENTEROLOGY': 'Tiêu hóa',
      'RESPIRATORY': 'Hô hấp',
      'NEPHROLOGY': 'Thận',
      'ENDOCRINOLOGY': 'Nội tiết',
      'HEMATOLOGY': 'Huyết học',
      'RHEUMATOLOGY': 'Cơ xương khớp',
      'DERMATOLOGY': 'Da liễu',
      'INFECTIOUS_DISEASE': 'Truyền nhiễm',
    };
    
    const deptValue = typeof department === 'string' ? department : department?.toString();
    return departmentMap[deptValue || ''] || deptValue || 'N/A';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Approve Requests</h2>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveTab('leave')}
            type="button"
          >
            <i className="fa fa-calendar-times me-2"></i>
            Leave Requests
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
            type="button"
          >
            <i className="fa fa-user-edit me-2"></i>
            Account Update Requests
          </button>
        </li>
      </ul>

      {/* Error message */}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {errorMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorMessage('')}
          ></button>
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'leave' && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fa fa-calendar-times me-2"></i>
              Leave Requests
            </h5>
            <span className="badge bg-light text-dark">
              {leaveRequests.length} pending
            </span>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
                <p className="text-muted">No pending leave requests</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Doctor</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Requested At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>
                          {request.doctor?.user?.name || 
                           request.doctor?.user?.email || 
                           request.doctor?.name || 
                           'N/A'}
                        </td>
                        <td>{formatDate(request.startDate)}</td>
                        <td>{formatDate(request.endDate)}</td>
                        <td>
                          <span className="badge bg-info text-white">
                            <i className="fa fa-clock me-1"></i>
                            {formatTimeRange(request.startTime, request.endTime)}
                          </span>
                        </td>
                        <td>{request.reason || 'N/A'}</td>
                        <td>
                          <span className={`badge ${
                            request.status === 'APPROVED' ? 'bg-success' : 
                            request.status === 'REJECTED' ? 'bg-danger' : 
                            'bg-warning'
                          }`}>
                            {request.status || 'PENDING'}
                          </span>
                        </td>
                        <td>{formatDateTime(request.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleApproveLeave(request.id)}
                            disabled={request.status !== 'PENDING' && request.status !== 'pending'}
                          >
                            <i className="fa fa-check me-1"></i>Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRejectLeave(request.id)}
                            disabled={request.status !== 'PENDING' && request.status !== 'pending'}
                          >
                            <i className="fa fa-times me-1"></i>Reject
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
      )}

      {/* Account Update Requests Tab */}
      {activeTab === 'account' && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fa fa-user-edit me-2"></i>
              Account Update Requests
            </h5>
            <span className="badge bg-light text-dark">
              {accountRequests.length} pending
            </span>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : accountRequests.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa fa-user-edit fa-3x text-muted mb-3"></i>
                <p className="text-muted">No pending account update requests</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Bác sĩ</th>
                      <th>Email</th>
                      <th>Khoa</th>
                      <th>Kinh nghiệm</th>
                      <th>Phòng khám</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountRequests.map((doctor) => (
                      <tr key={doctor.id}>
                        <td>{doctor.id}</td>
                        <td>
                          <strong>{doctor.user?.fullName || doctor.user?.name || 'N/A'}</strong>
                          {doctor.bio && (
                            <div className="text-muted small mt-1" style={{ maxWidth: '200px' }}>
                              {doctor.bio.length > 50 ? `${doctor.bio.substring(0, 50)}...` : doctor.bio}
                            </div>
                          )}
                        </td>
                        <td>{doctor.user?.email || 'N/A'}</td>
                        <td>
                          <span className="badge bg-info">
                            {formatDepartmentName(doctor)}
                          </span>
                        </td>
                        <td>
                          {doctor.experienceYears ? `${doctor.experienceYears} năm` : 'N/A'}
                        </td>
                        <td>{doctor.clinic?.name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${
                            doctor.status === 'APPROVED' ? 'bg-success' : 
                            doctor.status === 'REJECTED' ? 'bg-danger' : 
                            'bg-warning'
                          }`}>
                            {doctor.status || 'PENDING'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleApproveAccount(doctor.id)}
                            disabled={doctor.status !== 'PENDING' && doctor.status !== 'pending'}
                          >
                            <i className="fa fa-check me-1"></i>Phê duyệt
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRejectAccount(doctor.id)}
                            disabled={doctor.status !== 'PENDING' && doctor.status !== 'pending'}
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
      )}
    </div>
  );
}

