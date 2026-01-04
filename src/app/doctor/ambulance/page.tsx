'use client';

import { useState } from 'react';

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
  const [selectedAmbulance, setSelectedAmbulance] = useState<any>(null);

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

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-primary border-4 h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center" style={{ minHeight: '180px' }}>
              <div className="mb-3 d-flex justify-content-center align-items-center" style={{ minHeight: '60px' }}>
                <AmbulanceIcon size={56} color="#0d6efd" />
              </div>
              <h2 className="text-primary mb-2 fw-bold">5</h2>
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
              <h2 className="text-warning mb-2 fw-bold">2</h2>
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
              <h2 className="text-danger mb-2 fw-bold">1</h2>
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
          {ambulances.length === 0 ? (
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
                    <th>Vị trí</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {ambulances.map((ambulance) => (
                    <tr key={ambulance.id}>
                      <td>{ambulance.licensePlate}</td>
                      <td>{ambulance.type}</td>
                      <td>{ambulance.location}</td>
                      <td>
                        <span className={`badge ${
                          ambulance.status === 'AVAILABLE' ? 'bg-success' :
                          ambulance.status === 'ON_ROUTE' ? 'bg-warning' :
                          'bg-danger'
                        }`}>
                          {ambulance.status}
                        </span>
                      </td>
                      <td>
                        {ambulance.status === 'AVAILABLE' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAssign(ambulance.id)}
                          >
                            <i className="fa fa-check me-1"></i>Phân công
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-primary ms-2"
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
                <div className="mb-3">
                  <strong>Biển số:</strong> {selectedAmbulance.licensePlate}
                </div>
                <div className="mb-3">
                  <strong>Loại xe:</strong> {selectedAmbulance.type}
                </div>
                <div className="mb-3">
                  <strong>Vị trí:</strong> {selectedAmbulance.location}
                </div>
                <div className="mb-3">
                  <strong>Trạng thái:</strong> {selectedAmbulance.status}
                </div>
                <div className="mb-3">
                  <strong>Nhân viên:</strong> {selectedAmbulance.staff || 'Chưa phân công'}
                </div>
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

