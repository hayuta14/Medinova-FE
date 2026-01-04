'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { getUser, isAuthenticated } from '@/utils/auth';
import { getPharmacyOrderManagement } from '@/generated/api/endpoints/pharmacy-order-management/pharmacy-order-management';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import { getAppointmentManagement } from '@/generated/api/endpoints/appointment-management/appointment-management';
import LoginModal from '@/components/LoginModal';
import SignupModal from '@/components/SignupModal';

export default function PharmacyPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'medicine' | 'checkout' | 'track'>('upload');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionFileUrl, setPrescriptionFileUrl] = useState<string>('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH_ON_DELIVERY');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const authenticated = isAuthenticated();
      setIsCheckingAuth(false);
      if (!authenticated) {
        setShowLoginModal(true);
      } else {
        loadClinics();
        loadMyAppointments();
        const user = getUser();
        if (user) {
          setDeliveryInfo({
            name: user.fullName || '',
            phone: user.phone || '',
            address: '',
          });
        }
      }
    };
    checkAuth();

    const handleAuthChange = () => {
      const authenticated = isAuthenticated();
      if (authenticated) {
        setShowLoginModal(false);
        setShowSignupModal(false);
        loadClinics();
        loadMyAppointments();
        const user = getUser();
        if (user) {
          setDeliveryInfo({
            name: user.fullName || '',
            phone: user.phone || '',
            address: '',
          });
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', handleAuthChange);
      return () => {
        window.removeEventListener('auth-change', handleAuthChange);
      };
    }
  }, []);

  const loadClinics = useCallback(async () => {
    try {
      const clinicApi = getClinicManagement();
      const response = await clinicApi.getAllClinics();
      setClinics(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading clinics:', error);
      setClinics([]);
    }
  }, []);

  const loadMyAppointments = useCallback(async () => {
    try {
      setIsLoadingAppointments(true);
      const appointmentApi = getAppointmentManagement();
      const response = await appointmentApi.getMyAppointments();
      const apps = Array.isArray(response) ? response : [];
      // Only show completed appointments
      setAppointments(apps.filter((app: any) => app.status === 'COMPLETED'));
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPrescriptionFile(file);
      // TODO: Upload file to server and get URL
      // For now, we'll use a placeholder
      setPrescriptionFileUrl(`/uploads/${file.name}`);
      setStep('medicine');
      // Simulate extracting medicines from prescription
      // In real app, this would be done by OCR or manual entry
      setMedicines([
        { name: 'Paracetamol 500mg', quantity: 2, price: 5.0, total: 10.0 },
        { name: 'Amoxicillin 250mg', quantity: 1, price: 8.0, total: 8.0 },
      ]);
    }
  };

  const handleAppointmentSelect = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setStep('medicine');
    // TODO: Extract medicines from appointment prescription
    // For now, use sample data
    setMedicines([
      { name: 'Paracetamol 500mg', quantity: 2, price: 5.0, total: 10.0 },
      { name: 'Amoxicillin 250mg', quantity: 1, price: 8.0, total: 8.0 },
    ]);
  };

  const handleCheckout = async () => {
    if (!selectedClinicId) {
      setErrorMessage('Vui lòng chọn phòng khám.');
      return;
    }

    if (medicines.length === 0) {
      setErrorMessage('Vui lòng thêm thuốc vào đơn.');
      return;
    }

    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const pharmacyApi = getPharmacyOrderManagement();
      const subtotal = medicines.reduce((sum, m) => sum + m.total, 0);
      const deliveryFee = 5.0;

      const response = await pharmacyApi.createPharmacyOrder({
        clinicId: selectedClinicId,
        appointmentId: selectedAppointmentId || undefined,
        prescriptionFileUrl: prescriptionFileUrl || undefined,
        items: medicines.map(m => ({
          medicineName: m.name,
          quantity: m.quantity,
          price: m.price,
          notes: '',
        })),
        deliveryAddress: deliveryInfo.address,
        deliveryPhone: deliveryInfo.phone,
        deliveryName: deliveryInfo.name,
        paymentMethod: paymentMethod,
        notes: '',
      });

      const order = (response as any)?.data || response;
      if (order && order.id) {
        setOrderId(order.id);
        setStep('track');
      } else {
        throw new Error('Failed to create pharmacy order: No order ID returned');
      }
    } catch (error: any) {
      console.error('Error creating pharmacy order:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo đơn thuốc. Vui lòng thử lại.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseLoginModal = () => {
    if (!isAuthenticated()) {
      router.push('/');
    } else {
      setShowLoginModal(false);
    }
  };

  const handleCloseSignupModal = () => {
    setShowSignupModal(false);
    if (!isAuthenticated()) {
      setShowLoginModal(true);
    }
  };

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  if (isCheckingAuth) {
    return (
      <>
        <Topbar />
        <Navbar />
        <div className="container-fluid py-5">
          <div className="container">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <Navbar />
      <LoginModal 
        show={showLoginModal && !isAuthenticated()} 
        onHide={handleCloseLoginModal}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupModal 
        show={showSignupModal && !isAuthenticated()} 
        onHide={handleCloseSignupModal}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <div className="container-fluid py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Progress Steps */}
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    {['Upload Prescription', 'Medicine List', 'Checkout', 'Track Order'].map((label, index) => {
                      const steps = ['upload', 'medicine', 'checkout', 'track'];
                      const currentStepIndex = steps.indexOf(step);
                      const isActive = index <= currentStepIndex;
                      return (
                        <div key={label} className="text-center flex-fill">
                          <div
                            className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                              isActive ? 'bg-success text-white' : 'bg-secondary text-white'
                            }`}
                            style={{ width: '40px', height: '40px' }}
                          >
                            {index + 1}
                          </div>
                          <div className="mt-2 small">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {step === 'upload' && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">💊 Upload Prescription / Choose Appointment</h3>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card border-primary">
                          <div className="card-body text-center p-5">
                            <i className="fa fa-upload fa-4x text-primary mb-4"></i>
                            <h5>Upload Prescription</h5>
                            <input
                              type="file"
                              className="form-control mt-3"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                            />
                            <small className="text-muted d-block mt-2">
                              Supported formats: JPG, PNG, PDF
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-info">
                          <div className="card-body">
                            <h5 className="mb-3">Or Choose from Appointment</h5>
                            {isLoadingAppointments ? (
                              <div className="text-center py-3">
                                <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                <small className="ms-2 text-muted">Đang tải...</small>
                              </div>
                            ) : appointments.length === 0 ? (
                              <div className="text-center py-3 text-muted">
                                <i className="fa fa-calendar-times fa-2x mb-2"></i>
                                <p className="mb-0">Không có lịch hẹn đã hoàn thành</p>
                              </div>
                            ) : (
                              <div className="list-group">
                                {appointments.map((appointment) => (
                                  <button
                                    key={appointment.id}
                                    className={`list-group-item list-group-item-action ${
                                      selectedAppointmentId === appointment.id ? 'active' : ''
                                    }`}
                                    onClick={() => handleAppointmentSelect(appointment.id)}
                                  >
                                    <div>
                                      <strong>Appointment #{appointment.id}</strong>
                                      <br />
                                      <small>
                                        {appointment.doctorName || 'Doctor'} - {' '}
                                        {appointment.appointmentTime 
                                          ? new Date(appointment.appointmentTime).toLocaleDateString('vi-VN')
                                          : 'N/A'}
                                      </small>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'medicine' && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">📋 Medicine List</h3>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-outline-secondary mb-3"
                      onClick={() => setStep('upload')}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back
                    </button>
                    {prescriptionFile && (
                      <div className="alert alert-info">
                        <i className="fa fa-file me-2"></i>
                        Prescription uploaded: {prescriptionFile.name}
                      </div>
                    )}
                    {selectedAppointmentId && (
                      <div className="alert alert-info">
                        <i className="fa fa-calendar me-2"></i>
                        Selected appointment: #{selectedAppointmentId}
                      </div>
                    )}
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Medicine Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicines.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center text-muted py-5">
                                <i className="fa fa-pills fa-3x mb-3 d-block"></i>
                                <p>No medicines found. Please upload prescription or select appointment.</p>
                              </td>
                            </tr>
                          ) : (
                            medicines.map((medicine, index) => (
                              <tr key={index}>
                                <td>{medicine.name}</td>
                                <td>{medicine.quantity}</td>
                                <td>${medicine.price}</td>
                                <td>${medicine.total}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {medicines.length > 0 && (
                          <tfoot>
                            <tr>
                              <th colSpan={3}>Total</th>
                              <th>${medicines.reduce((sum, m) => sum + m.total, 0)}</th>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Chọn phòng khám *</label>
                      <select
                        className="form-select"
                        value={selectedClinicId || ''}
                        onChange={(e) => setSelectedClinicId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">-- Chọn phòng khám --</option>
                        {clinics.map((clinic) => (
                          <option key={clinic.id} value={clinic.id}>
                            {clinic.name || `Clinic ${clinic.id}`}
                            {clinic.address && ` - ${clinic.address}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {medicines.length > 0 && (
                      <div className="mt-4">
                        <button
                          className="btn btn-success btn-lg w-100"
                          onClick={() => setStep('checkout')}
                          disabled={!selectedClinicId}
                        >
                          Proceed to Checkout
                        </button>
                        {!selectedClinicId && (
                          <small className="text-danger d-block mt-2 text-center">
                            Vui lòng chọn phòng khám
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 'checkout' && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">🛒 Checkout</h3>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-outline-secondary mb-3"
                      onClick={() => setStep('medicine')}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back
                    </button>
                    {errorMessage && (
                      <div className="alert alert-danger" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {errorMessage}
                      </div>
                    )}
                    <div className="row">
                      <div className="col-md-8">
                        <h5>Delivery Information</h5>
                        <div className="mb-3">
                          <label className="form-label">Full Name *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={deliveryInfo.name}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Phone *</label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            value={deliveryInfo.phone}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Address *</label>
                          <textarea 
                            className="form-control" 
                            rows={3}
                            value={deliveryInfo.address}
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                            required
                          ></textarea>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Payment Method</label>
                          <select 
                            className="form-select"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          >
                            <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                            <option value="CREDIT_CARD">Credit Card</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="card bg-light">
                          <div className="card-body">
                            <h6>Order Summary</h6>
                            <hr />
                            <div className="d-flex justify-content-between">
                              <span>Subtotal</span>
                              <span>${medicines.reduce((sum, m) => sum + m.total, 0).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>Delivery</span>
                              <span>$5.00</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                              <span>Total</span>
                              <span>${(medicines.reduce((sum, m) => sum + m.total, 0) + 5.0).toFixed(2)}</span>
                            </div>
                            <button
                              className="btn btn-success w-100 mt-3"
                              onClick={handleCheckout}
                              disabled={isLoading || !deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address}
                            >
                              {isLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Đang xử lý...
                                </>
                              ) : (
                                'Place Order'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'track' && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">📦 Track Order</h3>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-success">
                      <h5>Order ID: {orderId}</h5>
                      <p>Your order has been placed successfully!</p>
                    </div>
                    <div className="mt-4">
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => router.push('/dashboard')}
                      >
                        Go to Dashboard
                      </button>
                    </div>
                    <div className="timeline">
                      <div className="d-flex align-items-center mb-3">
                        <div className="badge bg-success rounded-circle p-3 me-3">
                          <i className="fa fa-check"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">Order Placed</h5>
                          <small className="text-muted">Your order has been received</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="badge bg-warning rounded-circle p-3 me-3">
                          <i className="fa fa-spinner fa-spin"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">Processing</h5>
                          <small className="text-muted">Preparing your medicines</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="badge bg-secondary rounded-circle p-3 me-3">
                          <i className="fa fa-clock"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">Out for Delivery</h5>
                          <small className="text-muted">Waiting...</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="badge bg-secondary rounded-circle p-3 me-3">
                          <i className="fa fa-clock"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">Delivered</h5>
                          <small className="text-muted">Waiting...</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </>
  );
}

