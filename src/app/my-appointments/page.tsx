'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import RequireAuth from '@/components/RequireAuth';
import { getAppointmentManagement } from '@/generated/api/endpoints/appointment-management/appointment-management';
import { getReviewManagement } from '@/generated/api/endpoints/review-management/review-management';
import { getUser } from '@/utils/auth';
import type { AppointmentResponse } from '@/generated/api/models';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [existingReviews, setExistingReviews] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const appointmentApi = getAppointmentManagement();
      const response = await appointmentApi.getMyAppointments(statusFilter ? { status: statusFilter } : {});
      const appointmentsData = (response as any)?.data || response;
      const appointmentsList = Array.isArray(appointmentsData) ? appointmentsData : [];
      
      // Sort by appointment time (newest first)
      appointmentsList.sort((a: AppointmentResponse, b: AppointmentResponse) => {
        const timeA = a.appointmentTime ? new Date(a.appointmentTime).getTime() : 0;
        const timeB = b.appointmentTime ? new Date(b.appointmentTime).getTime() : 0;
        return timeB - timeA;
      });
      
      setAppointments(appointmentsList);
      
      // Check which appointments already have reviews
      await checkExistingReviews(appointmentsList);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tải danh sách lịch hẹn.';
      setErrorMessage(errorMsg);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  const checkExistingReviews = async (appointmentsList: AppointmentResponse[]) => {
    try {
      const reviewApi = getReviewManagement();
      const myReviewsResponse = await reviewApi.getMyReviews();
      const reviews = Array.isArray(myReviewsResponse) ? myReviewsResponse : [];
      
      const reviewMap = new Map<number, boolean>();
      appointmentsList.forEach((apt) => {
        if (apt.id) {
          const hasReview = reviews.some((review: any) => review.appointmentId === apt.id);
          reviewMap.set(apt.id, hasReview);
        }
      });
      
      setExistingReviews(reviewMap);
    } catch (error) {
      console.error('Error checking existing reviews:', error);
    }
  };

  const getStatusBadgeClass = (status: string | undefined): string => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-warning';
      case 'CONFIRMED':
        return 'bg-info';
      case 'CHECKED_IN':
        return 'bg-primary';
      case 'IN_PROGRESS':
        return 'bg-warning text-dark';
      case 'REVIEW':
        return 'bg-primary';
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
      case 'CANCELLED_BY_PATIENT':
        return 'bg-danger';
      case 'CANCELLED_BY_DOCTOR':
        return 'bg-danger';
      case 'NO_SHOW':
        return 'bg-secondary';
      case 'REJECTED':
        return 'bg-danger';
      case 'EXPIRED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status: string | undefined): string => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CHECKED_IN':
        return 'Đã check-in';
      case 'IN_PROGRESS':
        return 'Đang khám';
      case 'REVIEW':
        return 'Chờ đánh giá';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
      case 'CANCELLED_BY_PATIENT':
        return 'Đã hủy';
      case 'CANCELLED_BY_DOCTOR':
        return 'Đã hủy bởi bác sĩ';
      case 'NO_SHOW':
        return 'Vắng mặt';
      case 'REJECTED':
        return 'Đã từ chối';
      case 'EXPIRED':
        return 'Hết hạn';
      default:
        return status || 'N/A';
    }
  };

  const canReview = (appointment: AppointmentResponse): boolean => {
    // Can review if status is REVIEW or COMPLETED and hasn't been reviewed yet
    const status = appointment.status?.toUpperCase();
    if (status !== 'REVIEW' && status !== 'COMPLETED') {
      return false;
    }
    // Check if already reviewed
    if (appointment.id && existingReviews.get(appointment.id)) {
      return false;
    }
    return true;
  };

  const handleReviewClick = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setReviewForm({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointment || !selectedAppointment.doctorId) {
      alert('Không tìm thấy thông tin bác sĩ.');
      return;
    }

    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      alert('Vui lòng chọn đánh giá từ 1 đến 5 sao.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const reviewApi = getReviewManagement();
      await reviewApi.createReview({
        doctorId: selectedAppointment.doctorId,
        appointmentId: selectedAppointment.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });

      alert('Cảm ơn bạn đã đánh giá bác sĩ!');
      setShowReviewModal(false);
      setSelectedAppointment(null);
      setReviewForm({ rating: 5, comment: '' });
      
      // Reload appointments to update review status
      await loadAppointments();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
      alert(errorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <RequireAuth>
      <Topbar />
      <Navbar />

      <div className="container-fluid py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-2">📅 Lịch hẹn của tôi</h2>
              <p className="text-muted mb-0">Xem và quản lý tất cả lịch hẹn khám của bạn</p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <label className="mb-0 fw-bold">Lọc theo trạng thái:</label>
                <button
                  className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setStatusFilter('')}
                >
                  Tất cả
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setStatusFilter('PENDING')}
                >
                  Chờ xác nhận
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'CONFIRMED' ? 'btn-info' : 'btn-outline-info'}`}
                  onClick={() => setStatusFilter('CONFIRMED')}
                >
                  Đã xác nhận
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'REVIEW' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setStatusFilter('REVIEW')}
                >
                  Chờ đánh giá
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'COMPLETED' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setStatusFilter('COMPLETED')}
                >
                  Hoàn thành
                </button>
                <button
                  className={`btn btn-sm ${statusFilter === 'CANCELLED' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setStatusFilter('CANCELLED')}
                >
                  Đã hủy
                </button>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="fa fa-exclamation-circle me-2"></i>
              {errorMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setErrorMessage('')}
              ></button>
            </div>
          )}

          {/* Appointments List */}
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fa fa-calendar-check me-2"></i>
                Danh sách lịch hẹn ({appointments.length})
              </h5>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-3 text-muted">Đang tải danh sách lịch hẹn...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
                  <p className="text-muted">
                    {statusFilter 
                      ? `Không có lịch hẹn nào với trạng thái "${getStatusText(statusFilter)}"`
                      : 'Bạn chưa có lịch hẹn nào'}
                  </p>
                  {!statusFilter && (
                    <a href="/appointment" className="btn btn-primary">
                      <i className="fa fa-plus me-2"></i>Đặt lịch khám
                    </a>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '150px' }}>Thời gian</th>
                        <th>Bác sĩ</th>
                        <th>Cơ sở</th>
                        <th style={{ width: '120px' }}>Trạng thái</th>
                        <th style={{ width: '200px' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((apt) => {
                        const canReviewThis = canReview(apt);
                        const hasReview = apt.id ? existingReviews.get(apt.id) : false;
                        
                        return (
                          <tr key={apt.id}>
                            <td>
                              <div className="fw-bold">
                                {formatDateTime(apt.appointmentTime)}
                              </div>
                            </td>
                            <td>
                              <div className="fw-bold">{apt.doctorName || `Bác sĩ #${apt.doctorId}`}</div>
                              {apt.doctorSpecialization && (
                                <small className="text-muted d-block">{apt.doctorSpecialization}</small>
                              )}
                            </td>
                            <td>{apt.clinicName || 'N/A'}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(apt.status)}`}>
                                {getStatusText(apt.status)}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm" role="group">
                                {canReviewThis && (
                                  <button
                                    className="btn btn-warning"
                                    onClick={() => handleReviewClick(apt)}
                                    title="Đánh giá bác sĩ"
                                  >
                                    <i className="fa fa-star me-1"></i>
                                    Đánh giá
                                  </button>
                                )}
                                {hasReview && (
                                  <span className="badge bg-success">
                                    <i className="fa fa-check me-1"></i>
                                    Đã đánh giá
                                  </span>
                                )}
                                {apt.status === 'PENDING' && (
                                  <button
                                    className="btn btn-danger"
                                    onClick={async () => {
                                      if (!confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
                                        return;
                                      }
                                      try {
                                        const appointmentApi = getAppointmentManagement();
                                        await appointmentApi.updateAppointmentStatus(apt.id!, { status: 'CANCELLED' });
                                        alert('Đã hủy lịch hẹn thành công!');
                                        loadAppointments();
                                      } catch (error: any) {
                                        const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra.';
                                        alert(errorMsg);
                                      }
                                    }}
                                    title="Hủy lịch hẹn"
                                  >
                                    <i className="fa fa-times"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedAppointment && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReviewModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-warning text-white">
                <h5 className="modal-title">
                  <i className="fa fa-star me-2"></i>
                  Đánh giá bác sĩ
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowReviewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6>Bác sĩ: {selectedAppointment.doctorName || `Bác sĩ #${selectedAppointment.doctorId}`}</h6>
                  <p className="text-muted mb-0">
                    Lịch hẹn: {formatDateTime(selectedAppointment.appointmentTime)}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Đánh giá <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex gap-2 align-items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        style={{ fontSize: '2rem', color: star <= reviewForm.rating ? '#ffc107' : '#ccc' }}
                      >
                        <i className="fa fa-star"></i>
                      </button>
                    ))}
                    <span className="ms-2 fw-bold">
                      {reviewForm.rating} / 5 sao
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Nhận xét (tùy chọn)</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về bác sĩ..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReviewModal(false)}
                  disabled={isSubmittingReview}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-paper-plane me-2"></i>
                      Gửi đánh giá
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <BackToTop />
    </RequireAuth>
  );
}

