'use client';

import { useState, useEffect } from 'react';
import { getDashboard } from '@/generated/api/endpoints/dashboard/dashboard';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      const dashboardApi = getDashboard();
      const response = await dashboardApi.getAdminDashboardStats();
      const statsData = (response as any)?.data || response;
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
      setError(err?.message || 'Có lỗi xảy ra khi tải thống kê');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fa fa-exclamation-circle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={loadDashboardStats}>
          <i className="fa fa-sync-alt me-1"></i>Refresh
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Hospitals</h6>
                  <h3 className="mb-0">{stats?.totalHospitals || 0}</h3>
                  <small className="text-muted">Clinics</small>
                </div>
                <i className="fa fa-hospital fa-3x text-primary opacity-50"></i>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link href="/admin/hospitals" className="text-decoration-none">
                View All <i className="fa fa-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Doctors</h6>
                  <h3 className="mb-0">{stats?.totalDoctors || 0}</h3>
                  <small className="text-muted">
                    {stats?.doctorsByStatus?.APPROVED || 0} Approved
                  </small>
                </div>
                <i className="fa fa-user-md fa-3x text-success opacity-50"></i>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link href="/admin/doctors" className="text-decoration-none">
                View All <i className="fa fa-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Pending Approvals</h6>
                  <h3 className="mb-0">{stats?.pendingDoctors || 0}</h3>
                  <small className="text-muted">Doctors</small>
                </div>
                <i className="fa fa-clock fa-3x text-warning opacity-50"></i>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link href="/admin/doctors/pending" className="text-decoration-none">
                View All <i className="fa fa-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Users</h6>
                  <h3 className="mb-0">{stats?.totalPatients || 0}</h3>
                  <small className="text-muted">Patients</small>
                </div>
                <i className="fa fa-users fa-3x text-info opacity-50"></i>
              </div>
            </div>
            <div className="card-footer bg-transparent">
              <Link href="/admin/users" className="text-decoration-none">
                View All <i className="fa fa-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Appointments</h6>
                  <h3 className="mb-0">{stats?.totalAppointments || 0}</h3>
                  <small className="text-muted">
                    {stats?.appointmentsByStatus?.CONFIRMED || 0} Confirmed
                  </small>
                </div>
                <i className="fa fa-calendar-check fa-3x text-danger opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Emergencies</h6>
                  <h3 className="mb-0">{stats?.totalEmergencies || 0}</h3>
                  <small className="text-muted">
                    {stats?.emergenciesByStatus?.PENDING || 0} Pending
                  </small>
                </div>
                <i className="fa fa-ambulance fa-3x text-danger opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Today Appointments</h6>
                  <h3 className="mb-0">{stats?.todayAppointments || 0}</h3>
                  <small className="text-muted">Scheduled today</small>
                </div>
                <i className="fa fa-vial fa-3x text-warning opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Today Emergencies</h6>
                  <h3 className="mb-0">{stats?.todayEmergencies || 0}</h3>
                  <small className="text-muted">
                    {stats?.activeEmergencies || 0} Active
                  </small>
                </div>
                <i className="fa fa-pills fa-3x text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fa fa-bolt me-2"></i>Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <Link href="/admin/users" className="btn btn-outline-primary w-100">
                    <i className="fa fa-users me-2"></i>Manage Users
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link href="/admin/doctors" className="btn btn-outline-success w-100">
                    <i className="fa fa-user-md me-2"></i>Manage Doctors
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link href="/admin/hospitals" className="btn btn-outline-info w-100">
                    <i className="fa fa-hospital me-2"></i>Manage Hospitals
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link href="/admin/approve-requests" className="btn btn-outline-warning w-100">
                    <i className="fa fa-check-circle me-2"></i>Approve Requests
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

