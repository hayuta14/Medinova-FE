'use client';

import { useState } from 'react';

export default function BloodTestingPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const handleRequestTest = () => {
    // TODO: Implement request test
    console.log('Request test');
    setShowRequestModal(false);
  };

  const handleViewResult = (test: any) => {
    setSelectedTest(test);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">🧪 Quản lý xét nghiệm</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowRequestModal(true)}
        >
          <i className="fa fa-plus me-2"></i>Tạo yêu cầu xét nghiệm
        </button>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="fa fa-clock fa-2x text-warning mb-3"></i>
              <h3>2</h3>
              <p className="text-muted mb-0">Chờ kết quả</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="fa fa-check-circle fa-2x text-success mb-3"></i>
              <h3>5</h3>
              <p className="text-muted mb-0">Đã có kết quả</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="fa fa-vial fa-2x text-info mb-3"></i>
              <h3>10</h3>
              <p className="text-muted mb-0">Tổng số xét nghiệm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-warning text-white">
          <h5 className="mb-0">Danh sách xét nghiệm</h5>
        </div>
        <div className="card-body">
          {tests.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-vial fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có xét nghiệm nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Mã xét nghiệm</th>
                    <th>Bệnh nhân</th>
                    <th>Loại xét nghiệm</th>
                    <th>Ngày yêu cầu</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id}>
                      <td>#{test.id}</td>
                      <td>{test.patientName}</td>
                      <td>{test.testType}</td>
                      <td>{test.requestDate}</td>
                      <td>
                        <span className={`badge ${
                          test.status === 'PENDING' ? 'bg-warning' :
                          test.status === 'COMPLETED' ? 'bg-success' :
                          'bg-secondary'
                        }`}>
                          {test.status}
                        </span>
                      </td>
                      <td>
                        {test.status === 'COMPLETED' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewResult(test)}
                          >
                            <i className="fa fa-eye me-1"></i>Xem kết quả
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Test Modal */}
      {showRequestModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRequestModal(false);
            }
          }}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo yêu cầu xét nghiệm</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRequestModal(false)}
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
                  <label className="form-label">Loại xét nghiệm</label>
                  <select className="form-select">
                    <option>Xét nghiệm máu</option>
                    <option>Xét nghiệm nước tiểu</option>
                    <option>Xét nghiệm sinh hóa</option>
                  </select>
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
                  onClick={() => setShowRequestModal(false)}
                >
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleRequestTest}>
                  Tạo yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {selectedTest && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedTest(null);
            }
          }}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Kết quả xét nghiệm</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedTest(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Thông tin bệnh nhân</h6>
                    <p><strong>Tên:</strong> {selectedTest.patientName}</p>
                    <p><strong>Loại xét nghiệm:</strong> {selectedTest.testType}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Thông tin xét nghiệm</h6>
                    <p><strong>Ngày yêu cầu:</strong> {selectedTest.requestDate}</p>
                    <p><strong>Ngày có kết quả:</strong> {selectedTest.resultDate}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <h6>Kết quả</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Chỉ số</th>
                          <th>Kết quả</th>
                          <th>Bình thường</th>
                          <th>Đánh giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Hemoglobin</td>
                          <td>14.5 g/dL</td>
                          <td>12-16 g/dL</td>
                          <td><span className="badge bg-success">Bình thường</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-3">
                  <h6>Đánh giá</h6>
                  <textarea className="form-control" rows={3} placeholder="Nhập đánh giá..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTest(null)}
                >
                  Đóng
                </button>
                <button type="button" className="btn btn-success">
                  Lưu đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

