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
        setAppointments(Array.isArray(apts) ? apts : []);
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

  return (
    <RequireAuth>
      <Topbar />
      <Navbar />

      <div className="container-fluid py-5">
        <div className="container">
          <div className="mb-4">
            <h2 className="mb-2">My Health Dashboard</h2>
            <p className="text-muted">Welcome back, {user?.fullName || 'User'}!</p>
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
              <div className="row g-4 mb-4">
                <div className="col-md-3">
                  <div className="card shadow-sm border-primary">
                    <div className="card-body text-center">
                      <i className="fa fa-calendar-check fa-2x text-primary mb-3"></i>
                      <h3>{appointments.filter(apt => apt.status === 'CONFIRMED' || apt.status === 'PENDING').length}</h3>
                      <p className="text-muted mb-0">Upcoming Appointments</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-danger">
                    <div className="card-body text-center">
                      <i className="fa fa-ambulance fa-2x text-danger mb-3"></i>
                      <h3>{emergencies.length}</h3>
                      <p className="text-muted mb-0">Emergency History</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-warning">
                    <div className="card-body text-center">
                      <i className="fa fa-vial fa-2x text-warning mb-3"></i>
                      <h3>{testResults.length}</h3>
                      <p className="text-muted mb-0">Test Results</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-success">
                    <div className="card-body text-center">
                      <i className="fa fa-pills fa-2x text-success mb-3"></i>
                      <h3>{prescriptions.length}</h3>
                      <p className="text-muted mb-0">Pharmacy Orders</p>
                    </div>
                  </div>
                </div>
              </div>

          <div className="row g-4">
            {/* Upcoming Appointments */}
            <div className="col-lg-6">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Upcoming Appointments</h5>
                  <Link href="/services/outdoor-checkup" className="btn btn-sm btn-light">
                    Book New
                  </Link>
                </div>
                <div className="card-body">
                  {appointments.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No upcoming appointments</p>
                      <Link href="/services/outdoor-checkup" className="btn btn-primary">
                        Book Appointment
                      </Link>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {appointments
                        .filter(apt => apt.status === 'CONFIRMED' || apt.status === 'PENDING')
                        .slice(0, 5)
                        .map((apt) => (
                        <div key={apt.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{apt.doctorName || `Doctor ${apt.doctorId}`}</h6>
                              <small className="text-muted">
                                {apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleString('vi-VN') : 'N/A'}
                              </small>
                              <br />
                              <span className={`badge ${
                                apt.status === 'CONFIRMED' ? 'bg-primary' :
                                apt.status === 'PENDING' ? 'bg-warning' :
                                apt.status === 'COMPLETED' ? 'bg-success' :
                                apt.status === 'CANCELLED' ? 'bg-secondary' :
                                'bg-info'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleViewDetails('appointment', apt)}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                      {appointments.filter(apt => apt.status === 'CONFIRMED' || apt.status === 'PENDING').length === 0 && (
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
              <div className="card shadow-sm">
                <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Emergency History</h5>
                  <Link href="/services/emergency" className="btn btn-sm btn-light">
                    Request Help
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
              <div className="card shadow-sm">
                <div className="card-header bg-warning text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Test Results</h5>
                  <Link href="/services/blood-testing" className="btn btn-sm btn-light">
                    Book Test
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
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Prescriptions</h5>
                  <Link href="/services/pharmacy" className="btn btn-sm btn-light">
                    Order Medicine
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
          <div className="row g-4 mt-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <Link href="/services/emergency" className="btn btn-danger w-100">
                        <i className="fa fa-ambulance me-2"></i>Emergency
                      </Link>
                    </div>
                    <div className="col-md-3">
                      <Link href="/services/outdoor-checkup" className="btn btn-primary w-100">
                        <i className="fa fa-stethoscope me-2"></i>Book Appointment
                      </Link>
                    </div>
                    <div className="col-md-3">
                      <Link href="/services/blood-testing" className="btn btn-warning w-100">
                        <i className="fa fa-vial me-2"></i>Blood Test
                      </Link>
                    </div>
                    <div className="col-md-3">
                      <Link href="/services/pharmacy" className="btn btn-success w-100">
                        <i className="fa fa-pills me-2"></i>Pharmacy
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
                            selectedItem.status === 'COMPLETED' ? 'bg-success' :
                            selectedItem.status === 'CANCELLED' ? 'bg-secondary' :
                            'bg-info'
                          }`}>
                            {selectedItem.status}
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

      <Footer />
      <BackToTop />
    </RequireAuth>
  );
}

