'use client';

import { useState } from 'react';

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  const handleCreatePrescription = () => {
    // TODO: Implement create prescription
    console.log('Create prescription');
    setShowCreateModal(false);
  };

  const handleEditPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">💊 Quản lý kê đơn thuốc</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fa fa-plus me-2"></i>Tạo đơn thuốc mới
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">Danh sách đơn thuốc</h5>
        </div>
        <div className="card-body">
          {prescriptions.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-pills fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có đơn thuốc nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Bệnh nhân</th>
                    <th>Ngày kê</th>
                    <th>Số lượng thuốc</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>#{prescription.id}</td>
                      <td>{prescription.patientName}</td>
                      <td>{prescription.date}</td>
                      <td>{prescription.medicineCount}</td>
                      <td>
                        <span className={`badge ${
                          prescription.status === 'PENDING' ? 'bg-warning' :
                          prescription.status === 'DISPENSED' ? 'bg-success' :
                          'bg-secondary'
                        }`}>
                          {prescription.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleEditPrescription(prescription)}
                          >
                            <i className="fa fa-edit me-1"></i>Sửa
                          </button>
                          <button className="btn btn-outline-primary">
                            <i className="fa fa-eye me-1"></i>Xem
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

      {/* Create Prescription Modal */}
      {showCreateModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Tạo đơn thuốc mới</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Bệnh nhân</label>
                    <select className="form-select">
                      <option>Chọn bệnh nhân</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Thêm thuốc</label>
                    <div className="input-group">
                      <input type="text" className="form-control" placeholder="Tên thuốc" />
                      <input type="text" className="form-control" placeholder="Liều lượng" />
                      <button className="btn btn-outline-primary">
                        <i className="fa fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Danh sách thuốc</label>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Tên thuốc</th>
                            <th>Liều lượng</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={3} className="text-center text-muted">
                              Chưa có thuốc nào
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ghi chú</label>
                    <textarea className="form-control" rows={3} placeholder="Nhập ghi chú..."></textarea>
                  </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button type="button" className="btn btn-success" onClick={handleCreatePrescription}>
                  Tạo đơn thuốc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

