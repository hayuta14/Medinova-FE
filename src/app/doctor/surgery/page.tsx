'use client';

import { useState } from 'react';

export default function SurgeryPage() {
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);

  const handleConfirmReady = (id: string) => {
    // TODO: Implement confirm ready
    console.log('Confirm ready:', id);
  };

  const handleUpdateResult = (id: string) => {
    // TODO: Implement update result
    console.log('Update result:', id);
  };

  return (
    <div>
      <h2 className="mb-4">⚕️ Quản lý phẫu thuật</h2>

      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Lịch phẫu thuật</h5>
        </div>
        <div className="card-body">
          {surgeries.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-procedures fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có ca phẫu thuật nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Bệnh nhân</th>
                    <th>Loại phẫu thuật</th>
                    <th>Phòng</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {surgeries.map((surgery) => (
                    <tr key={surgery.id}>
                      <td>{surgery.dateTime}</td>
                      <td>{surgery.patientName}</td>
                      <td>{surgery.type}</td>
                      <td>{surgery.room}</td>
                      <td>
                        <span className={`badge ${
                          surgery.status === 'SCHEDULED' ? 'bg-primary' :
                          surgery.status === 'READY' ? 'bg-success' :
                          surgery.status === 'IN_PROGRESS' ? 'bg-warning' :
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
                    <p><strong>Tên:</strong> {selectedSurgery.patientName}</p>
                    <p><strong>Tuổi:</strong> {selectedSurgery.age}</p>
                    <p><strong>Giới tính:</strong> {selectedSurgery.gender}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Thông tin phẫu thuật</h6>
                    <p><strong>Loại:</strong> {selectedSurgery.type}</p>
                    <p><strong>Phòng:</strong> {selectedSurgery.room}</p>
                    <p><strong>Thời gian:</strong> {selectedSurgery.dateTime}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <h6>Pre-op Checklist</h6>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="check1" />
                    <label className="form-check-label" htmlFor="check1">
                      Bệnh nhân đã nhịn ăn
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="check2" />
                    <label className="form-check-label" htmlFor="check2">
                      Xét nghiệm tiền phẫu hoàn tất
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="check3" />
                    <label className="form-check-label" htmlFor="check3">
                      Phòng mổ sẵn sàng
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <h6>Ghi chú hậu phẫu</h6>
                  <textarea className="form-control" rows={4} placeholder="Nhập ghi chú hậu phẫu..."></textarea>
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
                <button type="button" className="btn btn-info">
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

