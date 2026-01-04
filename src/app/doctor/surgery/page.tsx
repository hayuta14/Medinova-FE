'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSurgeryConsultationManagement } from '@/generated/api/endpoints/surgery-consultation-management/surgery-consultation-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getUser } from '@/utils/auth';

export default function SurgeryPage() {
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadDoctorId();
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadSurgeryConsultations();
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

  const loadSurgeryConsultations = async () => {
    try {
      setIsLoading(true);
      const surgeryApi = getSurgeryConsultationManagement();
      const response = await surgeryApi.getMySurgeryConsultations();
      const data = (response as any)?.data || response;
      let consultations = Array.isArray(data) ? data : [];
      
      // Filter by status if needed
      if (statusFilter) {
        consultations = consultations.filter((c: any) => c.status === statusFilter);
      }
      
      // Sort by consultation date (newest first)
      consultations.sort((a: any, b: any) => {
        const dateA = a.consultationDate ? new Date(a.consultationDate).getTime() : 0;
        const dateB = b.consultationDate ? new Date(b.consultationDate).getTime() : 0;
        return dateB - dateA;
      });
      
      setSurgeries(consultations);
    } catch (error: any) {
      console.error('Error loading surgery consultations:', error);
      setSurgeries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (consultationId: number, newStatus: string) => {
    if (!confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành ${newStatus}?`)) {
      return;
    }

    try {
      const surgeryApi = getSurgeryConsultationManagement();
      await surgeryApi.updateSurgeryConsultationStatus(consultationId, newStatus);
      alert('Cập nhật trạng thái thành công!');
      await loadSurgeryConsultations();
    } catch (error: any) {
      console.error('Error updating surgery consultation status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái.';
      alert(errorMessage);
    }
  };

  const handleUpdateNotes = async (consultationId: number, notes: string) => {
    try {
      const surgeryApi = getSurgeryConsultationManagement();
      await surgeryApi.updateSurgeryConsultationNotes(consultationId, notes);
      alert('Cập nhật ghi chú thành công!');
      await loadSurgeryConsultations();
    } catch (error: any) {
      console.error('Error updating notes:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật ghi chú.';
      alert(errorMessage);
    }
  };

  const handleConfirmReady = (id: number) => {
    handleUpdateStatus(id, 'READY');
  };

  const handleUpdateResult = (id: number) => {
    const notes = prompt('Nhập ghi chú hậu phẫu:');
    if (notes !== null) {
      handleUpdateNotes(id, notes);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">⚕️ Quản lý phẫu thuật</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={loadSurgeryConsultations}>
          <i className="fa fa-sync-alt me-1"></i>Refresh
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
                <option value="READY">READY</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <div className="text-muted">
                Total: <strong>{surgeries.length}</strong> consultations
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Lịch phẫu thuật</h5>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : surgeries.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-procedures fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có ca phẫu thuật nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Bệnh nhân</th>
                    <th>Clinic</th>
                    <th>Ngày tư vấn</th>
                    <th>Loại phẫu thuật</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {surgeries.map((surgery) => (
                    <tr key={surgery.id}>
                      <td>#{surgery.id}</td>
                      <td>{surgery.patientName || 'N/A'}</td>
                      <td>{surgery.clinicName || 'N/A'}</td>
                      <td>
                        {surgery.consultationDate
                          ? new Date(surgery.consultationDate).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td>{surgery.surgeryType || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          surgery.status === 'PENDING' ? 'bg-warning' :
                          surgery.status === 'SCHEDULED' ? 'bg-primary' :
                          surgery.status === 'READY' ? 'bg-success' :
                          surgery.status === 'IN_PROGRESS' ? 'bg-info' :
                          surgery.status === 'COMPLETED' ? 'bg-success' :
                          surgery.status === 'CANCELLED' ? 'bg-secondary' :
                          'bg-secondary'
                        }`}>
                          {surgery.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {surgery.status === 'SCHEDULED' && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleConfirmReady(surgery.id)}
                            >
                              <i className="fa fa-check me-1"></i>Sẵn sàng
                            </button>
                          )}
                          {surgery.status === 'IN_PROGRESS' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleUpdateResult(surgery.id)}
                            >
                              <i className="fa fa-edit me-1"></i>Cập nhật
                            </button>
                          )}
                          {surgery.status === 'PENDING' && (
                            <button
                              className="btn btn-info"
                              onClick={() => handleUpdateStatus(surgery.id, 'SCHEDULED')}
                            >
                              <i className="fa fa-calendar me-1"></i>Lên lịch
                            </button>
                          )}
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setSelectedSurgery(surgery)}
                          >
                            <i className="fa fa-info-circle me-1"></i>Chi tiết
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

      {/* Surgery Detail Modal */}
      {selectedSurgery && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedSurgery(null);
            }
          }}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">Chi tiết ca phẫu thuật</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedSurgery(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Thông tin bệnh nhân</h6>
                    <p><strong>Tên:</strong> {selectedSurgery.patientName || 'N/A'}</p>
                    <p><strong>Clinic:</strong> {selectedSurgery.clinicName || 'N/A'}</p>
                    <p><strong>Ngày tư vấn:</strong> {
                      selectedSurgery.consultationDate
                        ? new Date(selectedSurgery.consultationDate).toLocaleDateString('vi-VN')
                        : 'N/A'
                    }</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Thông tin phẫu thuật</h6>
                    <p><strong>Loại:</strong> {selectedSurgery.surgeryType || 'N/A'}</p>
                    <p><strong>Trạng thái:</strong> 
                      <span className={`badge ms-2 ${
                        selectedSurgery.status === 'PENDING' ? 'bg-warning' :
                        selectedSurgery.status === 'SCHEDULED' ? 'bg-primary' :
                        selectedSurgery.status === 'READY' ? 'bg-success' :
                        selectedSurgery.status === 'IN_PROGRESS' ? 'bg-info' :
                        selectedSurgery.status === 'COMPLETED' ? 'bg-success' :
                        'bg-secondary'
                      }`}>
                        {selectedSurgery.status}
                      </span>
                    </p>
                    <p><strong>Ngày tạo:</strong> {
                      selectedSurgery.createdAt
                        ? new Date(selectedSurgery.createdAt).toLocaleString('vi-VN')
                        : 'N/A'
                    }</p>
                  </div>
                </div>
                {selectedSurgery.description && (
                  <div className="mt-3">
                    <h6>Mô tả</h6>
                    <p>{selectedSurgery.description}</p>
                  </div>
                )}
                <div className="mt-3">
                  <h6>Ghi chú hậu phẫu</h6>
                  <textarea 
                    className="form-control" 
                    rows={4} 
                    placeholder="Nhập ghi chú hậu phẫu..."
                    defaultValue={selectedSurgery.notes || ''}
                    onChange={(e) => {
                      setSelectedSurgery({ ...selectedSurgery, notes: e.target.value });
                    }}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedSurgery(null)}
                >
                  Đóng
                </button>
                <button 
                  type="button" 
                  className="btn btn-info"
                  onClick={() => {
                    if (selectedSurgery.id && selectedSurgery.notes) {
                      handleUpdateNotes(selectedSurgery.id, selectedSurgery.notes);
                      setSelectedSurgery(null);
                    }
                  }}
                >
                  Lưu kết quả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

