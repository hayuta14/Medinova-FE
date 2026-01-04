'use client';

import { useState, useEffect } from 'react';
import { getPharmacyOrderManagement } from '@/generated/api/endpoints/pharmacy-order-management/pharmacy-order-management';

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadPharmacyOrders();
  }, [statusFilter]);

  const loadPharmacyOrders = async () => {
    try {
      setIsLoading(true);
      const pharmacyApi = getPharmacyOrderManagement();
      const response = await pharmacyApi.getAllPharmacyOrders(statusFilter || undefined);
      
      const data = (response as any)?.data || response;
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading pharmacy orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'CONFIRMED':
        return 'bg-primary';
      case 'DISPENSED':
        return 'bg-info';
      case 'DELIVERED':
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
        <h2 className="mb-0">Pharmacy Orders Management</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={loadPharmacyOrders}>
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
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="DISPENSED">DISPENSED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end">
              <div className="text-muted">
                Total: <strong>{orders.length}</strong> pharmacy orders
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
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-pills fa-3x text-muted mb-3"></i>
              <p className="text-muted">No pharmacy orders found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Clinic</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.clinicName || 'N/A'}</td>
                      <td>
                        {order.items && order.items.length > 0
                          ? `${order.items.length} items`
                          : 'N/A'}
                      </td>
                      <td>
                        {order.totalAmount
                          ? `$${order.totalAmount.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString('vi-VN')
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

