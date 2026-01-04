'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAmbulanceManagement } from '@/generated/api/endpoints/ambulance-management/ambulance-management';
import { getAmbulanceBookingManagement } from '@/generated/api/endpoints/ambulance-booking-management/ambulance-booking-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getUser } from '@/utils/auth';

// Component logo xe cứu thương
const AmbulanceIcon = ({ size = 24, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
  >
    {/* Thân xe */}
    <rect x="18" y="48" width="64" height="32" rx="6" fill={color === 'currentColor' ? '#dc3545' : color}/>
    {/* Cửa sổ trước */}
    <rect x="24" y="54" width="16" height="22" fill="#ffffff" opacity="0.95" rx="2"/>
    {/* Cửa sổ giữa */}
    <rect x="44" y="54" width="16" height="22" fill="#ffffff" opacity="0.95" rx="2"/>
    {/* Cửa sau */}
    <rect x="64" y="54" width="12" height="22" fill="#ffffff" opacity="0.95" rx="2"/>
    {/* Bánh xe trái */}
    <circle cx="32" cy="88" r="9" fill="#1a1a1a"/>
    <circle cx="32" cy="88" r="6" fill="#ffffff"/>
    <circle cx="32" cy="88" r="3" fill="#1a1a1a"/>
    {/* Bánh xe phải */}
    <circle cx="68" cy="88" r="9" fill="#1a1a1a"/>
    <circle cx="68" cy="88" r="6" fill="#ffffff"/>
    <circle cx="68" cy="88" r="3" fill="#1a1a1a"/>
    {/* Nóc xe */}
    <rect x="28" y="32" width="44" height="22" rx="4" fill={color === 'currentColor' ? '#ff4757' : color} opacity="0.9"/>
    {/* Dấu thập đỏ trên nóc */}
    <rect x="45" y="36" width="10" height="2" fill="#ffffff"/>
    <rect x="49" y="32" width="2" height="10" fill="#ffffff"/>
    {/* Đèn cảnh báo */}
    <circle cx="50" cy="28" r="4" fill="#ffffff"/>
    <circle cx="50" cy="28" r="2" fill={color === 'currentColor' ? '#dc3545' : color}/>
    {/* Cửa sổ nóc */}
    <rect x="38" y="38" width="24" height="10" fill="#ffffff" opacity="0.7" rx="2"/>
  </svg>
);

export default function AmbulancePage() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedAmbulance, setSelectedAmbulance] = useState<any>(null);

  useEffect(() => {
    loadDoctorId();
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadAmbulances();
      loadBookings();
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

  const loadAmbulances = async () => {
    try {
      setIsLoading(true);
      const ambulanceApi = getAmbulanceManagement();
      
      // Get doctor's clinic
      const userData = getUser();
      const doctorApi = getDoctorManagement();
      const doctorsResponse = await doctorApi.getAllDoctors();
      const doctorsData = (doctorsResponse as any)?.data || doctorsResponse;
      const allDoctors = Array.isArray(doctorsData) ? doctorsData : [];
      const currentDoctor = allDoctors.find((doc: any) => doc.id === doctorId);
      
      if (currentDoctor && currentDoctor.clinic?.id) {
        const response = await ambulanceApi.getAllAmbulances({
          clinicId: currentDoctor.clinic.id,
          status: statusFilter || undefined
        });
        const data = (response as any)?.data || response;
        setAmbulances(Array.isArray(data) ? data : []);
      } else {
        // Fallback: get all ambulances
        const response = await ambulanceApi.getAllAmbulances({
          status: statusFilter || undefined
        });
        const data = (response as any)?.data || response;
        setAmbulances(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      console.error('Error loading ambulances:', error);
      setAmbulances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const bookingApi = getAmbulanceBookingManagement();
      const response = await bookingApi.getMyAmbulanceBookings();
      const data = (response as any)?.data || response;
      let bookingsList = Array.isArray(data) ? data : [];
      
      // Filter by status if needed
      if (statusFilter) {
        bookingsList = bookingsList.filter((b: any) => b.status === statusFilter);
      }
      
      setBookings(bookingsList);
    } catch (error: any) {
      console.error('Error loading ambulance bookings:', error);
      setBookings([]);
    }
  };

  const handleAssign = (id: string) => {
    // TODO: Implement assign ambulance
    console.log('Assign ambulance:', id);
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <AmbulanceIcon size={40} color="#dc3545" className="me-3" />
        <div>
          <h2 className="mb-0">Quản lý xe cứu thương</h2>
          <p className="text-muted mb-0">Theo dõi và quản lý đội xe cứu thương</p>
        </div>
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
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ON_ROUTE">ON_ROUTE</option>
                <option value="BUSY">BUSY</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <button className="btn btn-outline-primary btn-sm" onClick={loadAmbulances}>
                <i className="fa fa-sync-alt me-1"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-primary border-4 h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center" style={{ minHeight: '180px' }}>
              <div className="mb-3 d-flex justify-content-center align-items-center" style={{ minHeight: '60px' }}>
                <AmbulanceIcon size={56} color="#0d6efd" />
              </div>
              <h2 className="text-primary mb-2 fw-bold">
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  ambulances.filter(a => a.status === 'AVAILABLE').length
                )}
              </h2>
              <p className="text-muted mb-0 fw-semibold">Xe sẵn sàng</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-warning border-4 h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center" style={{ minHeight: '180px' }}>
              <div className="mb-3 d-flex justify-content-center align-items-center position-relative" style={{ minHeight: '60px' }}>
                <AmbulanceIcon size={56} color="#ffc107" />
                <div className="position-absolute" style={{ top: '-8px', right: 'calc(50% - 40px)' }}>
                  <i className="fa fa-spinner fa-spin text-warning" style={{ fontSize: '18px' }}></i>
                </div>
              </div>
              <h2 className="text-warning mb-2 fw-bold">
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  ambulances.filter(a => a.status === 'ON_ROUTE').length
                )}
              </h2>
              <p className="text-muted mb-0 fw-semibold">Đang di chuyển</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-danger border-4 h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center" style={{ minHeight: '180px' }}>
              <div className="mb-3 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60px' }}>
                <AmbulanceIcon size={56} color="#dc3545" />
                <div className="mt-2">
                  <i className="fa fa-exclamation-triangle text-danger" style={{ fontSize: '18px' }}></i>
                </div>
              </div>
              <h2 className="text-danger mb-2 fw-bold">
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  ambulances.filter(a => a.status === 'BUSY').length
                )}
              </h2>
              <p className="text-muted mb-0 fw-semibold">Bận</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex align-items-center">
          <AmbulanceIcon size={28} color="#ffffff" className="me-2" />
          <h5 className="mb-0">Danh sách xe cứu thương</h5>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : ambulances.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <AmbulanceIcon size={140} color="#dc3545" />
              </div>
              <h5 className="text-muted mb-2">Chưa có thông tin xe cứu thương</h5>
              <p className="text-muted small">Danh sách xe cứu thương sẽ hiển thị tại đây</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Biển số</th>
                    <th>Loại xe</th>
                    <th>Clinic</th>
                    <th>Vị trí</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {ambulances.map((ambulance) => (
                    <tr key={ambulance.id}>
                      <td>{ambulance.licensePlate || 'N/A'}</td>
                      <td>{ambulance.ambulanceType || 'N/A'}</td>
                      <td>{ambulance.clinicName || 'N/A'}</td>
                      <td>
                        {ambulance.currentLat && ambulance.currentLng
                          ? `${ambulance.currentLat.toFixed(4)}, ${ambulance.currentLng.toFixed(4)}`
                          : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge ${
                          ambulance.status === 'AVAILABLE' ? 'bg-success' :
                          ambulance.status === 'ON_ROUTE' ? 'bg-warning' :
                          ambulance.status === 'BUSY' ? 'bg-danger' :
                          'bg-secondary'
                        }`}>
                          {ambulance.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedAmbulance(ambulance)}
                        >
                          <i className="fa fa-info-circle me-1"></i>Chi tiết
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

      {/* Ambulance Detail Modal */}
      {selectedAmbulance && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedAmbulance(null);
            }
          }}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Chi tiết xe cứu thương</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedAmbulance(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Biển số:</strong> {selectedAmbulance.licensePlate || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Loại xe:</strong> {selectedAmbulance.ambulanceType || 'N/A'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Clinic:</strong> {selectedAmbulance.clinicName || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Trạng thái:</strong>
                    <span className={`badge ms-2 ${
                      selectedAmbulance.status === 'AVAILABLE' ? 'bg-success' :
                      selectedAmbulance.status === 'ON_ROUTE' ? 'bg-warning' :
                      selectedAmbulance.status === 'BUSY' ? 'bg-danger' :
                      'bg-secondary'
                    }`}>
                      {selectedAmbulance.status}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Vị trí hiện tại:</strong>
                  {selectedAmbulance.currentLat && selectedAmbulance.currentLng ? (
                    <div>
                      <p className="mb-1">
                        Lat: {selectedAmbulance.currentLat.toFixed(6)}, 
                        Lng: {selectedAmbulance.currentLng.toFixed(6)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${selectedAmbulance.currentLat},${selectedAmbulance.currentLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="fa fa-map-marker-alt me-1"></i>Xem trên bản đồ
                      </a>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </div>
                {selectedAmbulance.lastIdleAt && (
                  <div className="mb-3">
                    <strong>Thời gian rảnh cuối:</strong>{' '}
                    {new Date(selectedAmbulance.lastIdleAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAmbulance(null)}
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

