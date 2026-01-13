'use client';

import { useState, useEffect } from 'react';
import { getUser } from '@/utils/auth';

export default function DriverNotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    // TODO: Load notifications from API when Notification API is ready
    setIsLoading(false);
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="mb-0">
              <i className="fa fa-bell me-2"></i>
              Thông báo
            </h2>
            <p className="text-muted">Xem các thông báo về ca cấp cứu và hệ thống</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5">
            <i className="fa fa-bell-slash fa-3x text-muted mb-3"></i>
            <p className="text-muted">Chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="list-group">
                {notifications.map((notification: any) => (
                  <div key={notification.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{notification.title}</h6>
                        <p className="mb-1">{notification.message}</p>
                        <small className="text-muted">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : 'N/A'}
                        </small>
                      </div>
                      {!notification.isRead && (
                        <span className="badge bg-primary">Mới</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

