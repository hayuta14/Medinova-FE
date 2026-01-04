'use client';

import { useState, useEffect } from 'react';
import { getBloodTestManagement } from '@/generated/api/endpoints/blood-test-management/blood-test-management';

export default function BloodTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadBloodTests();
  }, [statusFilter]);

  const loadBloodTests = async () => {
    try {
      setIsLoading(true);
      const bloodTestApi = getBloodTestManagement();
      const response = await bloodTestApi.getAllBloodTests(statusFilter || undefined);
      
      const data = (response as any)?.data || response;
      setTests(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading blood tests:', error);
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'SCHEDULED':
        return 'bg-primary';
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Blood Tests Management</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={loadBloodTests}>
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
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <div className="text-muted">
                Total: <strong>{tests.length}</strong> blood tests
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-vial fa-3x text-muted mb-3"></i>
              <p className="text-muted">No blood tests found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Test Type</th>
                    <th>Clinic</th>
                    <th>Test Date</th>
                    <th>Test Time</th>
                    <th>Status</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id}>
                      <td>#{test.id}</td>
                      <td>{test.testType || 'N/A'}</td>
                      <td>{test.clinicName || 'N/A'}</td>
                      <td>
                        {test.testDate
                          ? new Date(test.testDate).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </td>
                      <td>{test.testTime || 'N/A'}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(test.status)}`}>
                          {test.status}
                        </span>
                      </td>
                      <td>
                        {test.resultFileUrl ? (
                          <a
                            href={test.resultFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-success"
                          >
                            <i className="fa fa-download me-1"></i>View
                          </a>
                        ) : (
                          <span className="text-muted">Not available</span>
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
    </div>
  );
}

