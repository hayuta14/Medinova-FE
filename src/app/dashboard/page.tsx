'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import RequireAuth from '@/components/RequireAuth';
import { getUser, isAuthenticated } from '@/utils/auth';
import { getAppointmentManagement } from '@/generated/api/endpoints/appointment-management/appointment-management';
import { getEmergencyManagement } from '@/generated/api/endpoints/emergency-management/emergency-management';
import { getBloodTestManagement } from '@/generated/api/endpoints/blood-test-management/blood-test-management';
import { getPharmacyOrderManagement } from '@/generated/api/endpoints/pharmacy-order-management/pharmacy-order-management';
import { getSurgeryConsultationManagement } from '@/generated/api/endpoints/surgery-consultation-management/surgery-consultation-management';
import { getAmbulanceBookingManagement } from '@/generated/api/endpoints/ambulance-booking-management/ambulance-booking-management';
import { getReviewManagement } from '@/generated/api/endpoints/review-management/review-management';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [surgeryConsultations, setSurgeryConsultations] = useState<any[]>([]);
  const [ambulanceBookings, setAmbulanceBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'appointment' | 'emergency' | 'test' | 'order' | 'surgery' | 'ambulance' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [appointmentReviews, setAppointmentReviews] = useState<Map<number, boolean>>(new Map());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Load all data in parallel
      const [
        appointmentsData,
        emergenciesData,
        bloodTestsData,
        pharmacyOrdersData,
        surgeryConsultationsData,
        ambulanceBookingsData
      ] = await Promise.allSettled([
        getAppointmentManagement().getMyAppointments(),
        getEmergencyManagement().getMyPatientEmergencies(),
        getBloodTestManagement().getMyBloodTests(),
        getPharmacyOrderManagement().getMyPharmacyOrders(),
        getSurgeryConsultationManagement().getMySurgeryConsultations(),
        getAmbulanceBookingManagement().getMyAmbulanceBookings()
      ]);

      // Process appointments
      if (appointmentsData.status === 'fulfilled') {
        const apts = (appointmentsData.value as any)?.data || appointmentsData.value || [];
        // Filter out HOLD status appointments (these are temporary holds, not actual appointments)
        const filteredApts = Array.isArray(apts) 
          ? apts.filter((apt: any) => apt.status?.toUpperCase() !== 'HOLD')
          : [];
        setAppointments(filteredApts);
        
        // Check which appointments have reviews
        checkAppointmentReviews(filteredApts);
      }

      // Process emergencies
      if (emergenciesData.status === 'fulfilled') {
        const emgs = (emergenciesData.value as any)?.data || emergenciesData.value || [];
        setEmergencies(Array.isArray(emgs) ? emgs : []);
      }

      // Process blood tests
      if (bloodTestsData.status === 'fulfilled') {
        const tests = (bloodTestsData.value as any)?.data || bloodTestsData.value || [];
        setTestResults(Array.isArray(tests) ? tests : []);
      }

      // Process pharmacy orders
      if (pharmacyOrdersData.status === 'fulfilled') {
        const orders = (pharmacyOrdersData.value as any)?.data || pharmacyOrdersData.value || [];
        setPrescriptions(Array.isArray(orders) ? orders : []);
      }

      // Process surgery consultations
      if (surgeryConsultationsData.status === 'fulfilled') {
        const consultations = (surgeryConsultationsData.value as any)?.data || surgeryConsultationsData.value || [];
        setSurgeryConsultations(Array.isArray(consultations) ? consultations : []);
      }

      // Process ambulance bookings
      if (ambulanceBookingsData.status === 'fulfilled') {
        const bookings = (ambulanceBookingsData.value as any)?.data || ambulanceBookingsData.value || [];
        setAmbulanceBookings(Array.isArray(bookings) ? bookings : []);
      }
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err?.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleViewDetails = (type: 'appointment' | 'emergency' | 'test' | 'order' | 'surgery' | 'ambulance', item: any) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType(null);
    setSelectedItem(null);
  };

  const checkAppointmentReviews = async (appointmentsList: any[]) => {
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
      
      setAppointmentReviews(reviewMap);
    } catch (error) {
      console.error('Error checking appointment reviews:', error);
    }
  };

  const canReviewAppointment = (appointment: any): boolean => {
    const status = appointment.status?.toUpperCase();
    if (status !== 'REVIEW' && status !== 'COMPLETED') {
      return false;
    }
    if (appointment.id && appointmentReviews.get(appointment.id)) {
      return false;
    }
    return true;
  };

  const handleReviewClick = (appointment: any) => {
    setSelectedAppointmentForReview(appointment);
    setReviewForm({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedAppointmentForReview || !selectedAppointmentForReview.doctorId) {
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
        doctorId: selectedAppointmentForReview.doctorId,
        appointmentId: selectedAppointmentForReview.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });

      alert('Cảm ơn bạn đã đánh giá bác sĩ!');
      setShowReviewModal(false);
      setSelectedAppointmentForReview(null);
      setReviewForm({ rating: 5, comment: '' });
      
      // Reload dashboard data
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
      alert(errorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const canCancelAppointment = (appointment: any): boolean => {
    const status = appointment.status?.toUpperCase();
    // Có thể hủy nếu là PENDING hoặc CONFIRMED
    return status === 'PENDING' || status === 'CONFIRMED';
  };

  const handleCancelClick = (appointment: any) => {
    setSelectedAppointmentForCancel(appointment);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleSubmitCancel = async () => {
    if (!selectedAppointmentForCancel || !selectedAppointmentForCancel.id) {
      alert('Không tìm thấy thông tin lịch hẹn.');
      return;
    }

    try {
      setIsCancelling(true);
      const appointmentApi = getAppointmentManagement();
      await appointmentApi.updateAppointmentStatus(selectedAppointmentForCancel.id, {
        status: 'CANCELLED',
        reason: cancelReason.trim() || undefined
      });

      alert('Đã hủy lịch hẹn thành công. Bác sĩ sẽ được thông báo về lý do hủy của bạn.');
      setShowCancelModal(false);
      setSelectedAppointmentForCancel(null);
      setCancelReason('');
      
      // Reload dashboard data
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi hủy lịch hẹn.';
      alert(errorMsg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <RequireAuth>
      <Topbar />
      <Navbar />

      <div className="container-fluid py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
        <div className="container">
          {/* Welcome Header */}
          <div className="mb-5">
            <div className="card shadow-lg border-0" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              overflow: 'hidden'
            }}>
              <div className="card-body p-4 p-md-5 text-white">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h1 className="display-5 fw-bold mb-3">
                      <i className="fa fa-heartbeat me-3"></i>
                      Chào mừng trở lại!
                    </h1>
                    <p className="lead mb-0" style={{ opacity: 0.95 }}>
                      Xin chào, <strong>{user?.fullName || 'Người dùng'}</strong>! 👋
                    </p>
                    <p className="mb-0 mt-2" style={{ opacity: 0.85 }}>
                      Đây là tổng quan về sức khỏe và dịch vụ y tế của bạn
                    </p>
                  </div>
                  <div className="col-md-4 text-center mt-4 mt-md-0">
                    <div style={{ fontSize: '5rem', opacity: 0.3 }}>
                      <i className="fa fa-user-md"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fa fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="row g-4 mb-5">
                <div className="col-md-3 col-sm-6">
                  <div 
                    className="card shadow-lg border-0 h-100"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body text-center text-white p-4">
                      <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.9 }}>
                        <i className="fa fa-calendar-check"></i>
                      </div>
                      <h2 className="fw-bold mb-2">{appointments.filter(apt => {
                        const status = apt.status?.toUpperCase();
                        return (status === 'CONFIRMED' || status === 'PENDING') && status !== 'HOLD';
                      }).length}</h2>
                      <p className="mb-0" style={{ opacity: 0.9, fontSize: '0.95rem' }}>Lịch hẹn sắp tới</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div 
                    className="card shadow-lg border-0 h-100"
                    style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body text-center text-white p-4">
                      <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.9 }}>
                        <i className="fa fa-ambulance"></i>
                      </div>
                      <h2 className="fw-bold mb-2">{emergencies.length}</h2>
                      <p className="mb-0" style={{ opacity: 0.9, fontSize: '0.95rem' }}>Lịch sử cấp cứu</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div 
                    className="card shadow-lg border-0 h-100"
                    style={{
                      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(252, 182, 159, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body text-center p-4">
                      <div className="mb-3" style={{ fontSize: '3rem', color: '#d35400' }}>
                        <i className="fa fa-vial"></i>
                      </div>
                      <h2 className="fw-bold mb-2" style={{ color: '#d35400' }}>{testResults.length}</h2>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>Kết quả xét nghiệm</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div 
                    className="card shadow-lg border-0 h-100"
                    style={{
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      borderRadius: '15px',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(168, 237, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body text-center p-4">
                      <div className="mb-3" style={{ fontSize: '3rem', color: '#27ae60' }}>
                        <i className="fa fa-pills"></i>
                      </div>
                      <h2 className="fw-bold mb-2" style={{ color: '#27ae60' }}>{prescriptions.length}</h2>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>Đơn thuốc</p>
                    </div>
                  </div>
                </div>
              </div>

          <div className="row g-4">
            {/* Upcoming Appointments */}
            <div className="col-lg-6">
              <div className="card shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div 
                  className="card-header text-white d-flex justify-content-between align-items-center py-3"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <h5 className="mb-0 fw-bold">
                    <i className="fa fa-calendar-check me-2"></i>
                    Lịch hẹn sắp tới
                  </h5>
                  <div className="d-flex gap-2">
                    <Link href="/my-appointments" className="btn btn-sm btn-light" style={{ borderRadius: '8px' }}>
                      <i className="fa fa-list me-1"></i>Xem tất cả
                    </Link>
                    <Link href="/services/outdoor-checkup" className="btn btn-sm btn-light" style={{ borderRadius: '8px' }}>
                      <i className="fa fa-plus me-1"></i>Đặt lịch
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  {appointments.length === 0 ? (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '4rem', color: '#e0e0e0', marginBottom: '1rem' }}>
                        <i className="fa fa-calendar-times"></i>
                      </div>
                      <h6 className="text-muted mb-3">Chưa có lịch hẹn nào</h6>
                      <Link href="/services/outdoor-checkup" className="btn btn-primary" style={{ borderRadius: '10px' }}>
                        <i className="fa fa-plus me-2"></i>Đặt lịch hẹn ngay
                      </Link>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {appointments
                        .filter(apt => {
                          const status = apt.status?.toUpperCase();
                          return (status === 'CONFIRMED' || status === 'PENDING') && status !== 'HOLD';
                        })
                        .slice(0, 5)
                        .map((apt) => (
                        <div 
                          key={apt.id} 
                          className="list-group-item border-0"
                          style={{
                            borderBottom: '1px solid #f0f0f0 !important',
                            transition: 'background-color 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <div 
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{ 
                                    width: '45px', 
                                    height: '45px', 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                  }}
                                >
                                  <i className="fa fa-user-md"></i>
                                </div>
                                <div>
                                  <h6 className="mb-0 fw-bold">{apt.doctorName || `Bác sĩ ${apt.doctorId}`}</h6>
                                  <small className="text-muted">
                                    <i className="fa fa-clock me-1"></i>
                                    {apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : 'N/A'}
                                  </small>
                                </div>
                              </div>
                              <span 
                                className={`badge px-3 py-2`}
                                style={{
                                  background: apt.status === 'CONFIRMED' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                                            apt.status === 'PENDING' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                                            apt.status === 'CHECKED_IN' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                                            apt.status === 'IN_PROGRESS' ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' :
                                            apt.status === 'REVIEW' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                                            apt.status === 'COMPLETED' ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' :
                                            'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                              >
                                {apt.status === 'REVIEW' ? 'Chờ đánh giá' : 
                                 apt.status === 'REJECTED' ? 'Đã từ chối' :
                                 apt.status === 'EXPIRED' ? 'Hết hạn' :
                                 apt.status === 'CANCELLED_BY_DOCTOR' ? 'Đã hủy (bác sĩ)' :
                                 apt.status === 'CANCELLED_BY_PATIENT' ? 'Đã hủy (bệnh nhân)' :
                                 apt.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                 apt.status === 'PENDING' ? 'Đang chờ' :
                                 apt.status}
                              </span>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                              {canReviewAppointment(apt) && (
                                <button 
                                  className="btn btn-warning btn-sm rounded-circle"
                                  style={{ width: '35px', height: '35px', padding: 0 }}
                                  onClick={() => handleReviewClick(apt)}
                                  title="Đánh giá bác sĩ"
                                >
                                  <i className="fa fa-star"></i>
                                </button>
                              )}
                              {apt.id && appointmentReviews.get(apt.id) && (
                                <span className="badge bg-success rounded-circle" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="fa fa-check"></i>
                                </span>
                              )}
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                style={{ borderRadius: '8px' }}
                                onClick={() => handleViewDetails('appointment', apt)}
                              >
                                <i className="fa fa-eye me-1"></i>Xem
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {appointments.filter(apt => {
                        const status = apt.status?.toUpperCase();
                        return (status === 'CONFIRMED' || status === 'PENDING') && status !== 'HOLD';
                      }).length === 0 && (
                        <div className="text-center py-4">
                          <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
                          <p className="text-muted">No upcoming appointments</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency History */}
            <div className="col-lg-6">
              <div className="card shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div 
                  className="card-header text-white d-flex justify-content-between align-items-center py-3"
                  style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                >
                  <h5 className="mb-0 fw-bold">
                    <i className="fa fa-ambulance me-2"></i>
                    Lịch sử cấp cứu
                  </h5>
                  <Link href="/services/emergency" className="btn btn-sm btn-light" style={{ borderRadius: '8px' }}>
                    <i className="fa fa-plus me-1"></i>Yêu cầu hỗ trợ
                  </Link>
                </div>
                <div className="card-body">
                  {emergencies.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fa fa-ambulance fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No emergency history</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {emergencies.slice(0, 5).map((emergency) => (
                        <div key={emergency.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">Emergency #{emergency.id}</h6>
                              <small className="text-muted">
                                {emergency.createdAt ? new Date(emergency.createdAt).toLocaleString('vi-VN') : 'N/A'}
                              </small>
                              <br />
                              <span className={`badge ${
                                emergency.status === 'PENDING' ? 'bg-warning' :
                                emergency.status === 'DISPATCHED' ? 'bg-primary' :
                                emergency.status === 'IN_TRANSIT' ? 'bg-info' :
                                emergency.status === 'ARRIVED' ? 'bg-info' :
                                emergency.status === 'COMPLETED' ? 'bg-success' :
                                emergency.status === 'CANCELLED' ? 'bg-secondary' :
                                'bg-secondary'
                              }`}>
                                {emergency.status}
                              </span>
                            </div>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewDetails('emergency', emergency)}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                      {emergencies.length === 0 && (
                        <div className="text-center py-4">
                          <i className="fa fa-ambulance fa-3x text-muted mb-3"></i>
                          <p className="text-muted">No emergency history</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="col-lg-6">
              <div className="card shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div 
                  className="card-header text-white d-flex justify-content-between align-items-center py-3"
                  style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}
                >
                  <h5 className="mb-0 fw-bold" style={{ color: '#d35400' }}>
                    <i className="fa fa-vial me-2"></i>
                    Kết quả xét nghiệm
                  </h5>
                  <Link href="/services/blood-testing" className="btn btn-sm" style={{ borderRadius: '8px', background: '#d35400', color: 'white', border: 'none' }}>
                    <i className="fa fa-plus me-1"></i>Đặt lịch
                  </Link>
                </div>
                <div className="card-body">
                  {testResults.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fa fa-vial fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No test results available</p>
                      <Link href="/services/blood-testing" className="btn btn-warning">
                        Book Test
                      </Link>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {testResults.slice(0, 5).map((test) => (
                        <div key={test.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{test.testType || 'Blood Test'}</h6>
                              <small className="text-muted">
                                {test.testDate ? new Date(test.testDate).toLocaleDateString('vi-VN') : 'N/A'}
                                {test.testTime && ` at ${test.testTime}`}
                              </small>
                              <br />
                              <span className={`badge ${
                                test.status === 'PENDING' ? 'bg-warning' :
                                test.status === 'SCHEDULED' ? 'bg-primary' :
                                test.status === 'COMPLETED' ? 'bg-success' :
                                test.status === 'CANCELLED' ? 'bg-secondary' :
                                'bg-secondary'
                              }`}>
                                {test.status}
                              </span>
                            </div>
                            <button 
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => handleViewDetails('test', test)}
                            >
                              {test.resultFileUrl ? 'View Result' : 'View Details'}
                            </button>
                          </div>
                        </div>
                      ))}
                      {testResults.length === 0 && (
                        <div className="text-center py-4">
                          <i className="fa fa-vial fa-3x text-muted mb-3"></i>
                          <p className="text-muted">No test results available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="col-lg-6">
              <div className="card shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div 
                  className="card-header d-flex justify-content-between align-items-center py-3"
                  style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}
                >
                  <h5 className="mb-0 fw-bold" style={{ color: '#27ae60' }}>
                    <i className="fa fa-pills me-2"></i>
                    Đơn thuốc
                  </h5>
                  <Link href="/services/pharmacy" className="btn btn-sm" style={{ borderRadius: '8px', background: '#27ae60', color: 'white', border: 'none' }}>
                    <i className="fa fa-shopping-cart me-1"></i>Đặt thuốc
                  </Link>
                </div>
                <div className="card-body">
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fa fa-pills fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No prescriptions</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {prescriptions.slice(0, 5).map((order) => (
                        <div key={order.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">Order #{order.id}</h6>
                              <small className="text-muted">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                {order.items && order.items.length > 0 && ` - ${order.items.length} items`}
                              </small>
                              <br />
                              <span className={`badge ${
                                order.status === 'PENDING' ? 'bg-warning' :
                                order.status === 'CONFIRMED' ? 'bg-primary' :
                                order.status === 'DISPENSED' ? 'bg-success' :
                                order.status === 'DELIVERED' ? 'bg-success' :
                                order.status === 'CANCELLED' ? 'bg-secondary' :
                                'bg-secondary'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleViewDetails('order', order)}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                      {prescriptions.length === 0 && (
                        <div className="text-center py-4">
                          <i className="fa fa-pills fa-3x text-muted mb-3"></i>
                          <p className="text-muted">No pharmacy orders</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Quick Actions */}
          <div className="row g-4 mt-5">
            <div className="col-12">
              <div className="card shadow-lg border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0 fw-bold">
                    <i className="fa fa-bolt me-2 text-warning"></i>
                    Thao tác nhanh
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-md-3 col-sm-6">
                      <Link 
                        href="/services/emergency" 
                        className="btn w-100 text-white fw-bold"
                        style={{
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          borderRadius: '12px',
                          padding: '15px',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 87, 108, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <i className="fa fa-ambulance fa-2x d-block mb-2"></i>
                        Cấp cứu
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <Link 
                        href="/services/outdoor-checkup" 
                        className="btn w-100 text-white fw-bold"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '12px',
                          padding: '15px',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <i className="fa fa-stethoscope fa-2x d-block mb-2"></i>
                        Đặt lịch khám
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <Link 
                        href="/services/blood-testing" 
                        className="btn w-100 fw-bold"
                        style={{
                          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                          color: '#d35400',
                          borderRadius: '12px',
                          padding: '15px',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(252, 182, 159, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <i className="fa fa-vial fa-2x d-block mb-2"></i>
                        Xét nghiệm máu
                      </Link>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <Link 
                        href="/services/pharmacy" 
                        className="btn w-100 fw-bold"
                        style={{
                          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                          color: '#27ae60',
                          borderRadius: '12px',
                          padding: '15px',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(168, 237, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <i className="fa fa-pills fa-2x d-block mb-2"></i>
                        Nhà thuốc
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className={`modal-header text-white ${
                modalType === 'appointment' ? 'bg-primary' :
                modalType === 'emergency' ? 'bg-danger' :
                modalType === 'test' ? 'bg-warning' :
                modalType === 'order' ? 'bg-success' :
                'bg-info'
              }`}>
                <h5 className="modal-title">
                  {modalType === 'appointment' && <i className="fa fa-calendar-check me-2"></i>}
                  {modalType === 'emergency' && <i className="fa fa-ambulance me-2"></i>}
                  {modalType === 'test' && <i className="fa fa-vial me-2"></i>}
                  {modalType === 'order' && <i className="fa fa-pills me-2"></i>}
                  {modalType === 'appointment' && 'Appointment Details'}
                  {modalType === 'emergency' && 'Emergency Details'}
                  {modalType === 'test' && 'Blood Test Details'}
                  {modalType === 'order' && 'Pharmacy Order Details'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {modalType === 'appointment' && (
                  <div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong><i className="fa fa-user-md me-2 text-primary"></i>Doctor:</strong>
                        <p className="mb-0">{selectedItem.doctorName || `Doctor ${selectedItem.doctorId}` || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <strong><i className="fa fa-hospital me-2 text-primary"></i>Clinic:</strong>
                        <p className="mb-0">{selectedItem.clinicName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong><i className="fa fa-calendar me-2 text-primary"></i>Date & Time:</strong>
                        <p className="mb-0">
                          {selectedItem.appointmentTime ? new Date(selectedItem.appointmentTime).toLocaleString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <strong><i className="fa fa-info-circle me-2 text-primary"></i>Status:</strong>
                        <p className="mb-0">
                          <span className={`badge ${
                            selectedItem.status === 'CONFIRMED' ? 'bg-primary' :
                            selectedItem.status === 'PENDING' ? 'bg-warning' :
                            selectedItem.status === 'REVIEW' ? 'bg-info' :
                            selectedItem.status === 'COMPLETED' ? 'bg-success' :
                            selectedItem.status === 'CANCELLED' ? 'bg-secondary' :
                            'bg-info'
                          }`}>
                            {selectedItem.status === 'REVIEW' ? 'Chờ đánh giá' : selectedItem.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    {selectedItem.notes && (
                      <div className="mb-3">
                        <strong><i className="fa fa-sticky-note me-2 text-primary"></i>Notes:</strong>
                        <p className="mb-0">{selectedItem.notes}</p>
                      </div>
                    )}
                    {canCancelAppointment(selectedItem) && (
                      <div className="mb-3">
                        <button
                          className="btn btn-danger w-100"
                          onClick={() => {
                            setShowModal(false);
                            handleCancelClick(selectedItem);
                          }}
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fa fa-times me-2"></i>
                          Hủy lịch hẹn
                        </button>
                      </div>
                    )}
                    {canReviewAppointment(selectedItem) && (
                      <div className="mb-3">
                        <button
                          className="btn btn-warning w-100"
                          onClick={() => {
                            setShowModal(false);
                            handleReviewClick(selectedItem);
                          }}
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fa fa-star me-2"></i>
                          Đánh giá bác sĩ
                        </button>
                      </div>
                    )}
                    {selectedItem.id && appointmentReviews.get(selectedItem.id) && (
                      <div className="alert alert-success mb-0">
                        <i className="fa fa-check-circle me-2"></i>
                        Bạn đã đánh giá bác sĩ cho lịch hẹn này.
                      </div>
                    )}
                    {selectedItem.createdAt && (
                      <div className="mb-3">
                        <strong><i className="fa fa-clock me-2 text-muted"></i>Created:</strong>
                        <p className="mb-0 text-muted">
                          {new Date(selectedItem.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {modalType === 'emergency' && (
                  <div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong><i className="fa fa-id-badge me-2 text-danger"></i>Emergency ID:</strong>
                        <p className="mb-0">#{selectedItem.id}</p>
                      </div>
                      <div className="col-md-6">
                        <strong><i className="fa fa-info-circle me-2 text-danger"></i>Status:</strong>
                        <p className="mb-0">
                          <span className={`badge ${
                            selectedItem.status === 'PENDING' ? 'bg-warning' :
                            selectedItem.status === 'DISPATCHED' ? 'bg-primary' :
                            selectedItem.status === 'IN_TRANSIT' ? 'bg-info' :
                            selectedItem.status === 'ARRIVED' ? 'bg-info' :
                            selectedItem.status === 'COMPLETED' ? 'bg-success' :
                            selectedItem.status === 'CANCELLED' ? 'bg-secondary' :
                            'bg-secondary'
                          }`}>
                            {selectedItem.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong><i className="fa fa-hospital me-2 text-danger"></i>Clinic:</strong>
                        <p className="mb-0">{selectedItem.clinicName || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <strong><i className="fa fa-exclamation-triangle me-2 text-danger"></i>Priority:</strong>
                        <p className="mb-0">
                          <span className={`badge ${
                            selectedItem.priority === 'CRITICAL' ? 'bg-danger' :
                            selectedItem.priority === 'HIGH' ? 'bg-warning' :
                            selectedItem.priority === 'MEDIUM' ? 'bg-info' :
                            'bg-secondary'
                          }`}>
                            {selectedItem.priority || 'MEDIUM'}
                          </span>
                        </p>
                      </div>
                    </div>
                    {selectedItem.patientAddress && (
                      <div className="mb-3">
                        <strong><i className="fa fa-map-marker-alt me-2 text-danger"></i>Location:</strong>
                        <p className="mb-0">{selectedItem.patientAddress}</p>
                        {selectedItem.patientLat && selectedItem.patientLng && (
                          <small className="text-muted">
                            Coordinates: {selectedItem.patientLat.toFixed(6)}, {selectedItem.patientLng.toFixed(6)}
                          </small>
                        )}
                      </div>
                    )}
                    <div className="mb-3">
                      <strong><i className="fa fa-user-md me-2 text-danger"></i>Assigned Doctor:</strong>
                      {selectedItem.doctorName || selectedItem.doctorId ? (
                        <div>
                          <p className="mb-1">
                            <strong>Name:</strong> {selectedItem.doctorName || 'N/A'}
                          </p>
                          {selectedItem.doctorId && (
                            <p className="mb-0 text-muted">
                              <small>Doctor ID: #{selectedItem.doctorId}</small>
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="mb-0 text-warning">
                          <i className="fa fa-exclamation-circle me-1"></i>
                          Chưa có bác sĩ được phân công
                        </p>
                      )}
                    </div>
                    {selectedItem.ambulanceLicensePlate && (
                      <div className="mb-3">
                        <strong><i className="fa fa-ambulance me-2 text-danger"></i>Ambulance:</strong>
                        <p className="mb-0">{selectedItem.ambulanceLicensePlate}</p>
                        {selectedItem.distanceKm && (
                          <small className="text-muted">Distance: {selectedItem.distanceKm.toFixed(2)} km</small>
                        )}
                      </div>
                    )}
                    {selectedItem.description && (
                      <div className="mb-3">
                        <strong><i className="fa fa-file-alt me-2 text-danger"></i>Description:</strong>
                        <p className="mb-0">{selectedItem.description}</p>
                      </div>
                    )}
                    <div className="row mb-3">
                      {selectedItem.createdAt && (
                        <div className="col-md-6">
                          <strong><i className="fa fa-clock me-2 text-muted"></i>Created:</strong>
                          <p className="mb-0 text-muted">
                            {new Date(selectedItem.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                      {selectedItem.dispatchedAt && (
                        <div className="col-md-6">
                          <strong><i className="fa fa-paper-plane me-2 text-muted"></i>Dispatched:</strong>
                          <p className="mb-0 text-muted">
                            {new Date(selectedItem.dispatchedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {modalType === 'test' && (
                  <div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong><i className="fa fa-vial me-2 text-warning"></i>Test Type:</strong>
                        <p className="mb-0">{selectedItem.testType || 'Blood Test'}</p>
                      </div>
                      <div className="col-md-6">
                        <strong><i className="fa fa-info-circle me-2 text-warning"></i>Status:</strong>
                        <p className="mb-0">
                          <span className={`badge ${
                            selectedItem.status === 'PENDING' ? 'bg-warning' :
                            selectedItem.status === 'SCHEDULED' ? 'bg-primary' :
                            selectedItem.status === 'COMPLETED' ? 'bg-success' :
                            selectedItem.status === 'CANCELLED' ? 'bg-secondary' :
                            'bg-secondary'
                          }`}>
                            {selectedItem.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong><i className="fa fa-calendar me-2 text-warning"></i>Test Date:</strong>
                        <p className="mb-0">
                          {selectedItem.testDate ? new Date(selectedItem.testDate).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <strong><i className="fa fa-clock me-2 text-warning"></i>Test Time:</strong>
                        <p className="mb-0">{selectedItem.testTime || 'N/A'}</p>
                      </div>
                    </div>
                    {selectedItem.clinicName && (
                      <div className="mb-3">
                        <strong><i className="fa fa-hospital me-2 text-warning"></i>Clinic:</strong>
                        <p className="mb-0">{selectedItem.clinicName}</p>
                      </div>
                    )}
                    {selectedItem.resultFileUrl && (
                      <div className="mb-3">
                        <strong><i className="fa fa-file-pdf me-2 text-warning"></i>Result File:</strong>
                        <p className="mb-0">
                          <a 
                            href={selectedItem.resultFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-warning"
                          >
                            <i className="fa fa-download me-1"></i>Download Result
                          </a>
                        </p>
                      </div>
                    )}
                    {selectedItem.notes && (
                      <div className="mb-3">
                        <strong><i className="fa fa-sticky-note me-2 text-warning"></i>Notes:</strong>
                        <p className="mb-0">{selectedItem.notes}</p>
                      </div>
                    )}
                    {selectedItem.createdAt && (
                      <div className="mb-3">
                        <strong><i className="fa fa-clock me-2 text-muted"></i>Created:</strong>
                        <p className="mb-0 text-muted">
                          {new Date(selectedItem.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {modalType === 'order' && (
                  <div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong><i className="fa fa-shopping-cart me-2 text-success"></i>Order ID:</strong>
                        <p className="mb-0">#{selectedItem.id}</p>
                      </div>
                      <div className="col-md-6">
                        <strong><i className="fa fa-info-circle me-2 text-success"></i>Status:</strong>
                        <p className="mb-0">
                          <span className={`badge ${
                            selectedItem.status === 'PENDING' ? 'bg-warning' :
                            selectedItem.status === 'CONFIRMED' ? 'bg-primary' :
                            selectedItem.status === 'DISPENSED' ? 'bg-success' :
                            selectedItem.status === 'DELIVERED' ? 'bg-success' :
                            selectedItem.status === 'CANCELLED' ? 'bg-secondary' :
                            'bg-secondary'
                          }`}>
                            {selectedItem.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    {selectedItem.clinicName && (
                      <div className="mb-3">
                        <strong><i className="fa fa-hospital me-2 text-success"></i>Clinic:</strong>
                        <p className="mb-0">{selectedItem.clinicName}</p>
                      </div>
                    )}
                    {selectedItem.items && selectedItem.items.length > 0 && (
                      <div className="mb-3">
                        <strong><i className="fa fa-list me-2 text-success"></i>Order Items:</strong>
                        <div className="table-responsive mt-2">
                          <table className="table table-sm table-bordered">
                            <thead>
                              <tr>
                                <th>Medicine</th>
                                <th>Quantity</th>
                                <th>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedItem.items.map((item: any, index: number) => (
                                <tr key={index}>
                                  <td>{item.medicineName || 'N/A'}</td>
                                  <td>{item.quantity || 'N/A'}</td>
                                  <td>${item.price || '0.00'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {selectedItem.totalAmount && (
                      <div className="mb-3">
                        <strong><i className="fa fa-dollar-sign me-2 text-success"></i>Total Amount:</strong>
                        <p className="mb-0 h5 text-success">${selectedItem.totalAmount.toFixed(2)}</p>
                      </div>
                    )}
                    {selectedItem.deliveryAddress && (
                      <div className="mb-3">
                        <strong><i className="fa fa-map-marker-alt me-2 text-success"></i>Delivery Address:</strong>
                        <p className="mb-0">{selectedItem.deliveryAddress}</p>
                      </div>
                    )}
                    {selectedItem.notes && (
                      <div className="mb-3">
                        <strong><i className="fa fa-sticky-note me-2 text-success"></i>Notes:</strong>
                        <p className="mb-0">{selectedItem.notes}</p>
                      </div>
                    )}
                    {selectedItem.createdAt && (
                      <div className="mb-3">
                        <strong><i className="fa fa-clock me-2 text-muted"></i>Created:</strong>
                        <p className="mb-0 text-muted">
                          {new Date(selectedItem.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointmentForCancel && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          role="dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCancelModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '15px', overflow: 'hidden' }}>
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="fa fa-times-circle me-2"></i>
                  Hủy lịch hẹn
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Thông tin lịch hẹn:</h6>
                  <p className="mb-1">
                    <strong>Bác sĩ:</strong> {selectedAppointmentForCancel.doctorName || `Bác sĩ #${selectedAppointmentForCancel.doctorId}`}
                  </p>
                  <p className="mb-1">
                    <strong>Thời gian:</strong>{' '}
                    {selectedAppointmentForCancel.appointmentTime 
                      ? new Date(selectedAppointmentForCancel.appointmentTime).toLocaleString('vi-VN', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </p>
                </div>

                <div className="alert alert-warning mb-4" style={{ borderRadius: '10px' }}>
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  <strong>Lưu ý:</strong> Bạn có chắc chắn muốn hủy lịch hẹn này? Lý do hủy sẽ được gửi cho bác sĩ.
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Lý do hủy lịch <span className="text-muted">(tùy chọn)</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Vui lòng chia sẻ lý do hủy lịch hẹn của bạn. Thông tin này sẽ giúp bác sĩ hiểu rõ hơn..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    disabled={isCancelling}
                    style={{ borderRadius: '10px' }}
                  ></textarea>
                  <small className="text-muted">
                    Lý do hủy sẽ được gửi cho bác sĩ để họ có thể cải thiện dịch vụ.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  style={{ borderRadius: '8px' }}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleSubmitCancel}
                  disabled={isCancelling}
                  style={{ borderRadius: '8px' }}
                >
                  {isCancelling ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang hủy...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-times me-2"></i>
                      Xác nhận hủy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedAppointmentForReview && (
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
                  <h6>Bác sĩ: {selectedAppointmentForReview.doctorName || `Bác sĩ #${selectedAppointmentForReview.doctorId}`}</h6>
                  <p className="text-muted mb-0">
                    Lịch hẹn: {selectedAppointmentForReview.appointmentTime 
                      ? new Date(selectedAppointmentForReview.appointmentTime).toLocaleString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
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

