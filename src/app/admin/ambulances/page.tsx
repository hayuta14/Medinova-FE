'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAmbulanceManagement } from '@/generated/api/endpoints/ambulance-management/ambulance-management';
import type { AmbulanceResponse } from '@/generated/api/models/ambulanceResponse';
import { CreateAmbulanceRequestStatus, CreateAmbulanceRequestAmbulanceType } from '@/generated/api/models';

export default function AmbulancesPage() {
  const router = useRouter();
  const [ambulances, setAmbulances] = useState<AmbulanceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<AmbulanceResponse | null>(null);
  const [formData, setFormData] = useState({
    licensePlate: '',
    status: CreateAmbulanceRequestStatus.AVAILABLE,
    ambulanceType: CreateAmbulanceRequestAmbulanceType.STANDARD,
    latitude: '',
    longitude: '',
    clinicId: '',
  });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 21.0285, lng: 105.8542 }); // Default to Hanoi
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);

  useEffect(() => {
    loadAmbulances();
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const { getClinicManagement } = await import('@/generated/api/endpoints/clinic-management/clinic-management');
      const clinicApi = getClinicManagement();
      const response = await clinicApi.getAllClinics();
      const clinicsList = Array.isArray(response) ? response : [];
      setClinics(clinicsList);
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  const loadAmbulances = async () => {
    try {
      setIsLoading(true);
      const ambulanceApi = getAmbulanceManagement();
      const response = await ambulanceApi.getAllAmbulances();
      const ambulancesList = Array.isArray(response) ? response : [];
      setAmbulances(ambulancesList);
    } catch (error: any) {
      console.error('Error loading ambulances:', error);
      setAmbulances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa xe cấp cứu này?')) {
      return;
    }

    try {
      const ambulanceApi = getAmbulanceManagement();
      await ambulanceApi.deleteAmbulance(id);
      await loadAmbulances();
      alert('Xóa xe cấp cứu thành công!');
    } catch (error: any) {
      console.error('Error deleting ambulance:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xóa xe cấp cứu. Vui lòng thử lại!';
      alert(errorMessage);
    }
  };

  const handleCreate = () => {
    setIsCreateMode(true);
    setEditingAmbulance(null);
    setFormData({
      licensePlate: '',
      status: CreateAmbulanceRequestStatus.AVAILABLE,
      ambulanceType: CreateAmbulanceRequestAmbulanceType.STANDARD,
      latitude: '',
      longitude: '',
      clinicId: '',
    });
    setCoordinates(null);
    setMapCenter({ lat: 21.0285, lng: 105.8542 });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (ambulance: AmbulanceResponse) => {
    setIsCreateMode(false);
    setEditingAmbulance(ambulance);
    const lat = ambulance.currentLat || '';
    const lng = ambulance.currentLng || '';
    const clinicId = ambulance.clinicId?.toString() || '';
    
    setFormData({
      licensePlate: ambulance.licensePlate || '',
      status: (ambulance.status as any) || CreateAmbulanceRequestStatus.AVAILABLE,
      ambulanceType: (ambulance.ambulanceType as any) || CreateAmbulanceRequestAmbulanceType.STANDARD,
      latitude: lat.toString(),
      longitude: lng.toString(),
      clinicId: clinicId,
    });
    
    // Nếu có vị trí từ ambulance, dùng nó. Nếu không, lấy từ clinic
    if (lat && lng) {
      const coord = { lat: parseFloat(lat.toString()), lng: parseFloat(lng.toString()) };
      setCoordinates(coord);
    } else if (clinicId) {
      // Tự động lấy vị trí từ clinic
      const selectedClinic = clinics.find(c => c.id?.toString() === clinicId);
      if (selectedClinic && selectedClinic.latitude && selectedClinic.longitude) {
        const coord = {
          lat: parseFloat(selectedClinic.latitude.toString()),
          lng: parseFloat(selectedClinic.longitude.toString())
        };
        setCoordinates(coord);
        setFormData(prev => ({
          ...prev,
          latitude: coord.lat.toString(),
          longitude: coord.lng.toString(),
        }));
      } else {
        setCoordinates(null);
      }
    } else {
      setCoordinates(null);
    }
    
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsCreateMode(false);
    setEditingAmbulance(null);
    setFormData({
      licensePlate: '',
      status: CreateAmbulanceRequestStatus.AVAILABLE,
      ambulanceType: CreateAmbulanceRequestAmbulanceType.STANDARD,
      latitude: '',
      longitude: '',
      clinicId: '',
    });
    setCoordinates(null);
    setMapCenter({ lat: 21.0285, lng: 105.8542 });
    setErrors({});
  };

  // Handle map location select
  const handleMapLocationSelect = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    setMapCenter({ lat, lng });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: any = {};
    if (!formData.clinicId) {
      newErrors.clinicId = 'Cơ sở y tế là bắt buộc';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const ambulanceApi = getAmbulanceManagement();
      
      // Prepare request body
      const requestBody: any = {
        clinicId: parseInt(formData.clinicId),
        status: formData.status,
        ambulanceType: formData.ambulanceType,
      };

      // Add license plate if provided
      if (formData.licensePlate) {
        requestBody.licensePlate = formData.licensePlate;
      }

      // Tự động lấy vị trí từ clinic nếu có
      if (coordinates) {
        requestBody.currentLat = coordinates.lat;
        requestBody.currentLng = coordinates.lng;
      } else if (formData.latitude && formData.longitude) {
        requestBody.currentLat = parseFloat(formData.latitude);
        requestBody.currentLng = parseFloat(formData.longitude);
      } else if (formData.clinicId) {
        // Nếu không có coordinates, lấy từ clinic đã chọn
        const selectedClinic = clinics.find(c => c.id?.toString() === formData.clinicId);
        if (selectedClinic && selectedClinic.latitude && selectedClinic.longitude) {
          requestBody.currentLat = parseFloat(selectedClinic.latitude.toString());
          requestBody.currentLng = parseFloat(selectedClinic.longitude.toString());
        }
      }

      if (isCreateMode) {
        await ambulanceApi.createAmbulance(requestBody);
        alert('Tạo xe cấp cứu thành công!');
      } else {
        await ambulanceApi.updateAmbulance(editingAmbulance!.id!, requestBody);
        alert('Cập nhật xe cấp cứu thành công!');
      }
      
      await loadAmbulances();
      handleCloseModal();
    } catch (error: any) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} ambulance:`, error);
      const errorMessage = error?.response?.data?.message || error?.message || `Có lỗi xảy ra khi ${isCreateMode ? 'tạo' : 'cập nhật'} xe cấp cứu. Vui lòng thử lại!`;
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case CreateAmbulanceRequestStatus.AVAILABLE:
        return <span className="badge bg-success">Sẵn sàng</span>;
      case CreateAmbulanceRequestStatus.BUSY:
        return <span className="badge bg-warning">Đang bận</span>;
      case CreateAmbulanceRequestStatus.MAINTENANCE:
        return <span className="badge bg-danger">Bảo trì</span>;
      case CreateAmbulanceRequestStatus.DISPATCHED:
        return <span className="badge bg-info">Đang điều động</span>;
      default:
        return <span className="badge bg-secondary">N/A</span>;
    }
  };

  const getAmbulanceTypeLabel = (type?: string) => {
    switch (type) {
      case CreateAmbulanceRequestAmbulanceType.STANDARD:
        return 'Tiêu chuẩn';
      case CreateAmbulanceRequestAmbulanceType.ICU:
        return 'ICU';
      case CreateAmbulanceRequestAmbulanceType.ADVANCED:
        return 'Nâng cao';
      default:
        return 'N/A';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách xe cấp cứu</h2>
        <button 
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <i className="fa fa-plus me-2"></i>Đăng ký xe cấp cứu mới
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : ambulances.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-ambulance fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có xe cấp cứu nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Biển số xe</th>
                    <th>Loại xe</th>
                    <th>Trạng thái</th>
                    <th>Cơ sở y tế</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {ambulances.map((ambulance) => (
                    <tr key={ambulance.id}>
                      <td>{ambulance.id}</td>
                      <td>{ambulance.licensePlate || 'N/A'}</td>
                      <td>{getAmbulanceTypeLabel(ambulance.ambulanceType)}</td>
                      <td>{getStatusBadge(ambulance.status)}</td>
                      <td>{ambulance.clinicName || `ID: ${ambulance.clinicId}` || 'N/A'}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(ambulance)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(ambulance.id!)}
                        >
                          <i className="fa fa-trash"></i>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isCreateMode ? 'Đăng ký xe cấp cứu mới' : 'Chỉnh sửa xe cấp cứu'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="licensePlate" className="form-label">
                          Biển số xe <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.licensePlate ? 'is-invalid' : ''}`}
                          id="licensePlate"
                          value={formData.licensePlate}
                          onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                          required
                          placeholder="VD: 30A-12345"
                        />
                        {errors.licensePlate && <div className="invalid-feedback">{errors.licensePlate}</div>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="clinicId" className="form-label">
                          Cơ sở y tế <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.clinicId ? 'is-invalid' : ''}`}
                          id="clinicId"
                          value={formData.clinicId}
                          onChange={(e) => {
                            const selectedClinicId = e.target.value;
                            const selectedClinic = clinics.find(c => c.id?.toString() === selectedClinicId);
                            
                            // Tự động lấy vị trí từ clinic
                            if (selectedClinic && selectedClinic.latitude && selectedClinic.longitude) {
                              const lat = parseFloat(selectedClinic.latitude.toString());
                              const lng = parseFloat(selectedClinic.longitude.toString());
                              setCoordinates({ lat, lng });
                              setFormData({
                                ...formData,
                                clinicId: selectedClinicId,
                                latitude: lat.toString(),
                                longitude: lng.toString(),
                              });
                            } else {
                              setFormData({ ...formData, clinicId: selectedClinicId });
                              setCoordinates(null);
                            }
                          }}
                          required
                        >
                          <option value="">Chọn cơ sở y tế</option>
                          {clinics.map((clinic) => (
                            <option key={clinic.id} value={clinic.id}>
                              {clinic.name}
                            </option>
                          ))}
                        </select>
                        {errors.clinicId && <div className="invalid-feedback">{errors.clinicId}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="status" className="form-label">
                          Trạng thái <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          required
                        >
                          <option value={CreateAmbulanceRequestStatus.AVAILABLE}>Sẵn sàng</option>
                          <option value={CreateAmbulanceRequestStatus.BUSY}>Đang bận</option>
                          <option value={CreateAmbulanceRequestStatus.MAINTENANCE}>Bảo trì</option>
                          <option value={CreateAmbulanceRequestStatus.DISPATCHED}>Đang điều động</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="ambulanceType" className="form-label">
                          Loại xe <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          id="ambulanceType"
                          value={formData.ambulanceType}
                          onChange={(e) => setFormData({ ...formData, ambulanceType: e.target.value as any })}
                          required
                        >
                          <option value={CreateAmbulanceRequestAmbulanceType.STANDARD}>Tiêu chuẩn</option>
                          <option value={CreateAmbulanceRequestAmbulanceType.ICU}>ICU</option>
                          <option value={CreateAmbulanceRequestAmbulanceType.ADVANCED}>Nâng cao</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {coordinates && (
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="fa fa-map-marker-alt me-2 text-danger"></i>
                        Vị trí (tự động từ cơ sở y tế)
                      </label>
                      <div className="alert alert-info mb-2">
                        <small>
                          <i className="fa fa-info-circle me-1"></i>
                          Vị trí được tự động lấy từ cơ sở y tế đã chọn.
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger"
                        >
                          <i className="fa fa-external-link-alt me-1"></i>
                          Xem trên Google Maps
                        </a>
                        <span className="align-self-center text-muted small">
                          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  )}

                  {errors.submit && (
                    <div className="alert alert-danger" role="alert">
                      {errors.submit}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Đóng
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isCreateMode ? 'Đang tạo...' : 'Đang lưu...'}
                      </>
                    ) : (
                      isCreateMode ? 'Tạo' : 'Lưu'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

