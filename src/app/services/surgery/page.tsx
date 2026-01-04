'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { getUser, isAuthenticated } from '@/utils/auth';
import { getSurgeryConsultationManagement } from '@/generated/api/endpoints/surgery-consultation-management/surgery-consultation-management';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import LoginModal from '@/components/LoginModal';
import SignupModal from '@/components/SignupModal';

export default function SurgeryPage() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'consultation' | 'appointment' | 'schedule' | 'followup'>('info');
  const [surgeryInfo, setSurgeryInfo] = useState({
    type: '',
    description: '',
    urgency: 'ROUTINE',
    clinicId: null as number | null,
  });
  const [clinics, setClinics] = useState<any[]>([]);
  const [consultationId, setConsultationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const surgeryTypes = [
    'General Surgery',
    'Cardiac Surgery',
    'Orthopedic Surgery',
    'Neurosurgery',
    'Plastic Surgery',
    'Other',
  ];

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      const authenticated = isAuthenticated();
      setIsCheckingAuth(false);
      if (!authenticated) {
        setShowLoginModal(true);
      } else {
        loadClinics();
      }
    };
    checkAuth();

    const handleAuthChange = () => {
      if (isAuthenticated()) {
        setShowLoginModal(false);
        setShowSignupModal(false);
        loadClinics();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', handleAuthChange);
      return () => window.removeEventListener('auth-change', handleAuthChange);
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

  const handleInfoSubmit = () => {
    if (!surgeryInfo.clinicId) {
      setErrorMessage('Vui lòng chọn phòng khám.');
      return;
    }
    setStep('consultation');
  };

  const handleRequestConsultation = async () => {
    if (!surgeryInfo.type || !surgeryInfo.description || !surgeryInfo.clinicId) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const surgeryApi = getSurgeryConsultationManagement();
      const response = await surgeryApi.createSurgeryConsultation({
        clinicId: surgeryInfo.clinicId!,
        surgeryType: surgeryInfo.type,
        description: surgeryInfo.description,
        urgency: surgeryInfo.urgency || 'ROUTINE',
      });

      const consultation = (response as any)?.data || response;
      if (consultation && consultation.id) {
        setConsultationId(consultation.id);
        setStep('appointment');
      } else {
        throw new Error('Failed to create consultation request');
      }
    } catch (error: any) {
      console.error('Error creating consultation:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <>
        <Topbar />
        <Navbar />
        <div className="container-fluid py-5">
          <div className="container text-center">
            <div className="spinner-border text-primary" role="status"></div>
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
        onHide={() => !isAuthenticated() ? router.push('/') : setShowLoginModal(false)}
        onSwitchToSignup={() => { setShowLoginModal(false); setShowSignupModal(true); }}
      />
      <SignupModal 
        show={showSignupModal && !isAuthenticated()} 
        onHide={() => { setShowSignupModal(false); if (!isAuthenticated()) setShowLoginModal(true); }}
        onSwitchToLogin={() => { setShowSignupModal(false); setShowLoginModal(true); }}
      />

      <div className="container-fluid py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="alert alert-warning">
                <i className="fa fa-info-circle me-2"></i>
                <strong>Note:</strong> Surgery cannot be booked directly. Please request a consultation first.
              </div>

              {step === 'info' && (
                <div className="card shadow">
                  <div className="card-header bg-info text-white">
                    <h3 className="mb-0">⚕️ Surgery Information</h3>
                  </div>
                  <div className="card-body">
                    {errorMessage && (
                      <div className="alert alert-danger" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {errorMessage}
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">Chọn phòng khám *</label>
                      <select
                        className="form-select"
                        value={surgeryInfo.clinicId || ''}
                        onChange={(e) => setSurgeryInfo({ ...surgeryInfo, clinicId: e.target.value ? Number(e.target.value) : null })}
                      >
                        <option value="">-- Chọn phòng khám --</option>
                        {clinics.map((clinic) => (
                          <option key={clinic.id} value={clinic.id}>
                            {clinic.name || `Clinic ${clinic.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Surgery Type *</label>
                      <select
                        className="form-select"
                        value={surgeryInfo.type}
                        onChange={(e) => setSurgeryInfo({ ...surgeryInfo, type: e.target.value })}
                      >
                        <option value="">Select surgery type</option>
                        {surgeryTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={surgeryInfo.description}
                        onChange={(e) => setSurgeryInfo({ ...surgeryInfo, description: e.target.value })}
                        placeholder="Describe the surgery needed, medical history, current condition..."
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Urgency Level</label>
                      <select
                        className="form-select"
                        value={surgeryInfo.urgency}
                        onChange={(e) => setSurgeryInfo({ ...surgeryInfo, urgency: e.target.value })}
                      >
                        <option value="ROUTINE">Routine</option>
                        <option value="URGENT">Urgent</option>
                        <option value="EMERGENCY">Emergency</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-info btn-lg w-100"
                      onClick={handleInfoSubmit}
                      disabled={!surgeryInfo.type || !surgeryInfo.description || !surgeryInfo.clinicId}
                    >
                      Request Consultation
                    </button>
                  </div>
                </div>
              )}

              {step === 'consultation' && (
                <div className="card shadow">
                  <div className="card-header bg-info text-white">
                    <h3 className="mb-0">📋 Consultation Request</h3>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-info">
                      <h5>Your Request Summary</h5>
                      <p><strong>Type:</strong> {surgeryInfo.type}</p>
                      <p><strong>Urgency:</strong> {surgeryInfo.urgency || 'Not specified'}</p>
                      <p><strong>Description:</strong> {surgeryInfo.description}</p>
                    </div>
                    <p className="mb-4">
                      A doctor will review your request and schedule a consultation appointment with you.
                    </p>
                    {errorMessage && (
                      <div className="alert alert-danger mb-3" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {errorMessage}
                      </div>
                    )}
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-info btn-lg"
                        onClick={handleRequestConsultation}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-paper-plane me-2"></i>Submit Consultation Request
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setStep('info')}
                        disabled={isLoading}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'appointment' && consultationId && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">✅ Consultation Requested</h3>
                  </div>
                  <div className="card-body text-center">
                    <i className="fa fa-check-circle fa-5x text-success mb-4"></i>
                    <h4>Your consultation request has been submitted!</h4>
                    <p className="text-muted">
                      A doctor will contact you soon to schedule a consultation appointment.
                    </p>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-primary mt-4"
                        onClick={() => router.push('/dashboard')}
                      >
                        Go to Dashboard
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setStep('schedule')}
                      >
                        View Schedule
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'schedule' && (
                <div className="card shadow">
                  <div className="card-header bg-info text-white">
                    <h3 className="mb-0">📅 Surgery Schedule</h3>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-warning">
                      <i className="fa fa-clock me-2"></i>
                      Your surgery schedule will be available after consultation with the doctor.
                    </div>
                    <div className="text-center py-5">
                      <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No surgery scheduled yet</p>
                    </div>
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => setStep('appointment')}
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {step === 'followup' && (
                <div className="card shadow">
                  <div className="card-header bg-info text-white">
                    <h3 className="mb-0">🔄 Follow-up</h3>
                  </div>
                  <div className="card-body">
                    <p>Follow-up information will be available after surgery.</p>
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

