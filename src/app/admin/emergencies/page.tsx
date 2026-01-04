'use client';

import { useState, useEffect } from 'react';
import { getEmergencyManagement } from '@/generated/api/endpoints/emergency-management/emergency-management';

export default function EmergenciesPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadEmergencies();
  }, [statusFilter]);

  const loadEmergencies = async () => {
    try {
      setIsLoading(true);
      const emergencyApi = getEmergencyManagement();
      const response = await emergencyApi.getAllEmergencies(statusFilter || undefined);
      
      const data = (response as any)?.data || response;
      setEmergencies(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading emergencies:', error);
      setEmergencies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'DISPATCHED':
        return 'bg-primary';
      case 'IN_TRANSIT':
        return 'bg-info';
      case 'ARRIVED':
        return 'bg-info';
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-danger';
      case 'HIGH':
        return 'bg-warning';
      case 'MEDIUM':
        return 'bg-info';
      case 'LOW':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Emergencies Management</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={loadEmergencies}>
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
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="ARRIVED">ARRIVED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <div className="text-muted">
                Total: <strong>{emergencies.length}</strong> emergencies
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
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : emergencies.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-ambulance fa-3x text-muted mb-3"></i>
              <p className="text-muted">No emergencies found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Clinic</th>
                    <th>Doctor</th>
                    <th>Ambulance</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencies.map((emergency) => (
                    <tr key={emergency.id}>
                      <td>#{emergency.id}</td>
                      <td>{emergency.patientName || 'N/A'}</td>
                      <td>{emergency.clinicName || 'N/A'}</td>
                      <td>{emergency.doctorName || 'Not assigned'}</td>
                      <td>{emergency.ambulanceLicensePlate || 'Not assigned'}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(emergency.priority || 'MEDIUM')}`}>
                          {emergency.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(emergency.status)}`}>
                          {emergency.status}
                        </span>
                      </td>
                      <td>
                        {emergency.createdAt
                          ? new Date(emergency.createdAt).toLocaleString('vi-VN')
                          : 'N/A'}
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

