'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAppointmentManagement } from '@/generated/api/endpoints/appointment-management/appointment-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getUser } from '@/utils/auth';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadDoctorId();
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadAppointments();
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

  const loadAppointments = async () => {
    if (!doctorId) return;

    try {
      setIsLoading(true);
      const appointmentApi = getAppointmentManagement();
      const response = await appointmentApi.getAppointments({
        doctorId,
        status: statusFilter || undefined,
        page: 0,
        size: 100
      });
      
      const data = (response as any)?.data || response;
      const appointmentsList = data?.content || (Array.isArray(data) ? data : []);
      setAppointments(appointmentsList);

      // Extract unique patients from appointments
      const uniquePatients = new Map();
      appointmentsList.forEach((apt: any) => {
        if (apt.patientId && !uniquePatients.has(apt.patientId)) {
          uniquePatients.set(apt.patientId, {
            id: apt.patientId,
            name: apt.patientName,
            email: apt.patientEmail,
            appointments: appointmentsList.filter((a: any) => a.patientId === apt.patientId)
          });
        }
      });
      setPatients(Array.from(uniquePatients.values()));
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleCloseModal = () => {
    setShowPatientModal(false);
    setSelectedPatient(null);
  };

  const handleUpdateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    if (!confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành ${newStatus}?`)) {
      return;
    }

    try {
      const appointmentApi = getAppointmentManagement();
      await appointmentApi.updateAppointmentStatusByDoctor(appointmentId, { status: newStatus });
      alert('Cập nhật trạng thái thành công!');
      await loadAppointments();
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái.';
      alert(errorMessage);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Quản lý bệnh nhân</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={loadAppointments}>
          <i className="fa fa-sync-alt me-1"></i>Refresh
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Lọc theo trạng thái</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label">Tìm kiếm theo ID bệnh nhân</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fa fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập ID bệnh nhân..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm('')}
                    title="Xóa tìm kiếm"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="text-muted">
                Tổng số: <strong>{
                  searchTerm.trim() 
                    ? patients.filter((p) => 
                        p.id?.toString().includes(searchTerm.trim()) || 
                        p.id?.toString() === searchTerm.trim()
                      ).length 
                    : patients.length
                }</strong> bệnh nhân
                {searchTerm.trim() && (
                  <span className="ms-2 text-primary">
                    (đã lọc)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Danh sách bệnh nhân</h5>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (() => {
              const filteredPatients = patients.filter((patient) => {
                if (searchTerm.trim()) {
                  const searchId = searchTerm.trim();
                  return patient.id?.toString().includes(searchId) || 
                         patient.id?.toString() === searchId;
                }
                return true;
              });
              
              return filteredPatients.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-search fa-3x text-muted mb-3"></i>
                  <p className="text-muted">
                    {searchTerm.trim() 
                      ? `Không tìm thấy bệnh nhân với ID: ${searchTerm}`
                      : 'Chưa có bệnh nhân nào'}
                  </p>
                  {searchTerm.trim() && (
                    <button
                      className="btn btn-outline-primary mt-2"
                      onClick={() => setSearchTerm('')}
                    >
                      <i className="fa fa-times me-2"></i>Xóa bộ lọc
                    </button>
                  )}
                </div>
              ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên bệnh nhân</th>
                    <th>Email</th>
                    <th>Số lịch hẹn</th>
                    <th>Lịch hẹn gần nhất</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>#{patient.id}</td>
                      <td>{patient.name || 'N/A'}</td>
                      <td>{patient.email || 'N/A'}</td>
                      <td>
                        <span className="badge bg-info">
                          {patient.appointments?.length || 0}
                        </span>
                      </td>
                      <td>
                        {patient.appointments && patient.appointments.length > 0
                          ? (() => {
                              const latest = patient.appointments
                                .sort((a: any, b: any) => 
                                  new Date(b.appointmentTime || 0).getTime() - 
                                  new Date(a.appointmentTime || 0).getTime()
                                )[0];
                              return latest.appointmentTime
                                ? new Date(latest.appointmentTime).toLocaleDateString('vi-VN')
                                : 'N/A';
                            })()
                          : 'N/A'}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewPatient(patient)}
                        >
                          <i className="fa fa-eye me-1"></i>Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              );
            })()}
        </div>
      </div>

      {/* Appointments List - Hidden, this page is for patients only, not appointments */}

      {/* Patient Detail Modal */}
      {showPatientModal && selectedPatient && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fa fa-user me-2"></i>Chi tiết bệnh nhân
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>ID:</strong> #{selectedPatient.id}
                  </div>
                  <div className="col-md-6">
                    <strong>Tên:</strong> {selectedPatient.name || 'N/A'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Email:</strong> {selectedPatient.email || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Tổng lịch hẹn đã hoàn thành:</strong> {
                      selectedPatient.appointments?.filter((apt: any) => 
                        apt.status?.toUpperCase() === 'COMPLETED'
                      ).length || 0
                    }
                  </div>
                </div>
                <hr />
                <h6 className="mb-3">Lịch sử khám đã hoàn thành</h6>
                {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                  (() => {
                    // Filter only COMPLETED appointments
                    const completedAppointments = selectedPatient.appointments.filter((apt: any) => 
                      apt.status?.toUpperCase() === 'COMPLETED'
                    );
                    
                    return completedAppointments.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Ngày giờ</th>
                              <th>Clinic</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {completedAppointments.map((apt: any) => (
                              <tr key={apt.id}>
                                <td>#{apt.id}</td>
                                <td>
                                  {apt.appointmentTime
                                    ? new Date(apt.appointmentTime).toLocaleString('vi-VN')
                                    : 'N/A'}
                                </td>
                                <td>{apt.clinicName || 'N/A'}</td>
                                <td>
                                  <span className="badge bg-success">
                                    {apt.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted">Chưa có lịch khám nào đã hoàn thành</p>
                    );
                  })()
                ) : (
                  <p className="text-muted">Chưa có lịch hẹn nào</p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

