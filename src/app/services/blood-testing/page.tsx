'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import RequireAuth from '@/components/RequireAuth';
import { getUser, isAuthenticated } from '@/utils/auth';
import { getBloodTestManagement } from '@/generated/api/endpoints/blood-test-management/blood-test-management';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import LoginModal from '@/components/LoginModal';
import SignupModal from '@/components/SignupModal';

export default function BloodTestingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'test' | 'time' | 'info' | 'confirm' | 'result'>('test');
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [clinics, setClinics] = useState<any[]>([]);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [testId, setTestId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const testTypes = [
    { id: '1', name: 'Complete Blood Count (CBC)', price: 50 },
    { id: '2', name: 'Blood Glucose Test', price: 30 },
    { id: '3', name: 'Lipid Panel', price: 60 },
    { id: '4', name: 'Liver Function Test', price: 70 },
    { id: '5', name: 'Thyroid Function Test', price: 80 },
    { id: '6', name: 'Vitamin D Test', price: 90 },
  ];

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
        const user = getUser();
        if (user) {
          setPatientInfo({
            name: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
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
        const user = getUser();
        if (user) {
          setPatientInfo({
            name: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
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

  // Get start of week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Get all days in the week
  const getWeekDays = (weekStart: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get hours from 8 to 13 (8 AM to 1 PM) for blood tests
  const getHours = (): number[] => {
    return Array.from({ length: 6 }, (_, i) => i + 8); // 8-13
  };

  // Check if a time slot is in the past
  const isPastTime = (date: Date, hour: number): boolean => {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < now;
  };

  // Check if a slot is selected
  const isSlotSelected = (date: Date, hour: number): boolean => {
    if (!selectedDate || !selectedTime) return false;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    return (
      date.toDateString() === selectedDateObj.toDateString() &&
      parseInt(selectedTime.split(':')[0]) === hour
    );
  };

  // Format date to YYYY-MM-DD without timezone issues
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle slot selection
  const handleSlotSelection = (date: Date, hour: number) => {
    if (isPastTime(date, hour)) {
      setErrorMessage('Không thể chọn lịch trong quá khứ.');
      return;
    }

    const selectedDateStr = formatDateToString(date);
    const selectedTimeStr = `${hour.toString().padStart(2, '0')}:00`;
    
    setSelectedDate(selectedDateStr);
    setSelectedTime(selectedTimeStr);
    setErrorMessage('');
  };

  const handleTestSelect = (testId: string) => {
    setSelectedTest(testId);
    setStep('time');
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setSelectedWeek(newWeek);
    setSelectedDate('');
    setSelectedTime('');
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setSelectedWeek(newWeek);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleInfoSubmit = () => {
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedClinicId) {
      setErrorMessage('Vui lòng chọn phòng khám.');
      return;
    }

    if (!selectedTest || !selectedDate || !selectedTime) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const bloodTestApi = getBloodTestManagement();
      const testType = testTypes.find(t => t.id === selectedTest)?.name || selectedTest;

      const response = await bloodTestApi.createBloodTest({
        clinicId: selectedClinicId,
        testType: testType,
        testDate: selectedDate,
        testTime: selectedTime,
        notes: `Patient: ${patientInfo.name}, Email: ${patientInfo.email}, Phone: ${patientInfo.phone}`,
      });

      const test = (response as any)?.data || response;
      if (test && test.id) {
        setTestId(test.id);
        setStep('result');
      } else {
        throw new Error('Failed to create blood test: No test ID returned');
      }
    } catch (error: any) {
      console.error('Error creating blood test:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo yêu cầu xét nghiệm. Vui lòng thử lại.';
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
                    {['Select Test', 'Select Time', 'Patient Info', 'Confirm', 'View Result'].map((label, index) => {
                      const steps = ['test', 'time', 'info', 'confirm', 'result'];
                      const currentStepIndex = steps.indexOf(step);
                      const isActive = index <= currentStepIndex;
                      return (
                        <div key={label} className="text-center flex-fill">
                          <div
                            className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                              isActive ? 'bg-warning text-white' : 'bg-secondary text-white'
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

              {step === 'test' && (
                <div className="card shadow">
                  <div className="card-header bg-warning text-white">
                    <h3 className="mb-0">🧪 Select Test</h3>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {testTypes.map((test) => (
                        <div key={test.id} className="col-md-6">
                          <div className="card border-warning">
                            <div className="card-body">
                              <h5>{test.name}</h5>
                              <p className="text-muted mb-3">Price: ${test.price}</p>
                              <button
                                className="btn btn-warning w-100"
                                onClick={() => handleTestSelect(test.id)}
                              >
                                Select
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 'time' && (
                <div className="card shadow">
                  <div className="card-header bg-warning text-white">
                    <h3 className="mb-0">⏰ Select Time</h3>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-outline-secondary mb-3"
                      onClick={() => setStep('test')}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back
                    </button>
                    <div className="mb-3">
                      <label className="form-label">Chọn phòng khám *</label>
                      <select
                        className="form-select form-select-lg"
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

                    {/* Week Navigation */}
                    <div className="row mb-3">
                      <div className="col-12">
                        <div className="bg-light rounded p-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-warning"
                              onClick={goToPreviousWeek}
                            >
                              <i className="fa fa-chevron-left me-2"></i>Tuần trước
                            </button>
                            <h6 className="mb-0">
                              {(() => {
                                const weekStart = getWeekStart(selectedWeek);
                                const weekDays = getWeekDays(weekStart);
                                return `${weekStart.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })} - ${weekDays[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}`;
                              })()}
                            </h6>
                            <button
                              type="button"
                              className="btn btn-outline-warning"
                              onClick={goToNextWeek}
                            >
                              Tuần sau<i className="fa fa-chevron-right ms-2"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                      <div className="alert alert-danger mb-3" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {errorMessage}
                      </div>
                    )}

                    {/* Schedule Table */}
                    <div className="row mb-3">
                      <div className="col-12">
                        <div className="bg-light rounded p-4">
                          <div className="table-responsive">
                            <table className="table table-bordered table-hover mb-0" style={{ fontSize: '0.9rem' }}>
                              <thead className="table-light" style={{ backgroundColor: '#f8f9fa' }}>
                                <tr>
                                  <th style={{ width: '80px', textAlign: 'center', fontWeight: 'bold', padding: '12px' }}>
                                    <i className="fa fa-clock me-1"></i>Giờ
                                  </th>
                                  {(() => {
                                    const weekStart = getWeekStart(selectedWeek);
                                    const weekDays = getWeekDays(weekStart);
                                    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
                                    return weekDays.map((date, index) => (
                                      <th key={index} style={{ textAlign: 'center', minWidth: '120px', padding: '12px' }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{dayNames[index]}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'normal' }}>
                                          {date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                                        </div>
                                      </th>
                                    ));
                                  })()}
                                </tr>
                              </thead>
                              <tbody>
                                {getHours().map((hour) => (
                                  <tr key={hour}>
                                    <td className="text-center fw-bold" style={{ verticalAlign: 'middle' }}>
                                      {hour}:00
                                    </td>
                                    {(() => {
                                      const weekStart = getWeekStart(selectedWeek);
                                      const weekDays = getWeekDays(weekStart);
                                      return weekDays.map((date, dayIndex) => {
                                        const isSelected = isSlotSelected(date, hour);
                                        const isPast = isPastTime(date, hour);
                                        const isDisabled = isPast;

                                        let btnClass = 'btn btn-sm';
                                        let btnStyle: React.CSSProperties = { width: '100%', minHeight: '45px' };
                                        
                                        if (isSelected) {
                                          btnClass += ' btn-warning';
                                        } else if (isPast) {
                                          btnClass += ' btn-secondary';
                                          btnStyle.opacity = 0.5;
                                        } else {
                                          btnClass += ' btn-outline-warning';
                                        }

                                        return (
                                          <td key={dayIndex} style={{ padding: '4px', textAlign: 'center' }}>
                                            <button
                                              type="button"
                                              className={btnClass}
                                              style={btnStyle}
                                              onClick={() => handleSlotSelection(date, hour)}
                                              disabled={isDisabled}
                                              title={isPast ? 'Lịch đã qua' : `Chọn ${date.toLocaleDateString('vi-VN')} lúc ${hour}:00`}
                                            >
                                              {isSelected ? (
                                                <>
                                                  <i className="fa fa-check-circle"></i>
                                                  <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>Đã chọn</div>
                                                </>
                                              ) : (
                                                <span style={{ fontSize: '0.85rem' }}>Trống</span>
                                              )}
                                            </button>
                                          </td>
                                        );
                                      });
                                    })()}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Legend */}
                          <div className="mt-3 p-3 bg-white rounded border">
                            <div className="row g-3">
                              <div className="col-12">
                                <h6 className="mb-3 fw-bold">
                                  <i className="fa fa-info-circle me-2 text-warning"></i>
                                  Chú thích:
                                </h6>
                              </div>
                              <div className="col-md-6 col-lg-3">
                                <div className="d-flex align-items-center gap-2">
                                  <button className="btn btn-sm btn-outline-warning" disabled style={{ minWidth: '70px', minHeight: '35px' }}>
                                    <span style={{ fontSize: '0.8rem' }}>Trống</span>
                                  </button>
                                  <span style={{ fontSize: '0.85rem' }}>Có thể đặt</span>
                                </div>
                              </div>
                              <div className="col-md-6 col-lg-3">
                                <div className="d-flex align-items-center gap-2">
                                  <button className="btn btn-sm btn-warning" disabled style={{ minWidth: '70px', minHeight: '35px' }}>
                                    <i className="fa fa-check-circle"></i>
                                  </button>
                                  <span style={{ fontSize: '0.85rem' }}>Đã chọn</span>
                                </div>
                              </div>
                              <div className="col-md-6 col-lg-3">
                                <div className="d-flex align-items-center gap-2">
                                  <button className="btn btn-sm btn-secondary" disabled style={{ minWidth: '70px', minHeight: '35px', opacity: 0.5 }}></button>
                                  <span style={{ fontSize: '0.85rem' }}>Đã qua</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selected Date and Time Display */}
                    {selectedDate && selectedTime && (() => {
                      const [year, month, day] = selectedDate.split('-').map(Number);
                      const selectedDateObj = new Date(year, month - 1, day);
                      return (
                        <div className="row mb-3">
                          <div className="col-12">
                            <div className="alert alert-info mb-0">
                              <strong>Lịch đã chọn:</strong>{' '}
                              {selectedDateObj.toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'numeric',
                                year: 'numeric',
                              })}{' '}
                              lúc {selectedTime}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Continue Button */}
                    <div className="mt-4">
                      <button
                        className="btn btn-warning btn-lg w-100"
                        onClick={() => setStep('info')}
                        disabled={!selectedDate || !selectedTime || !selectedClinicId}
                      >
                        <i className="fa fa-arrow-right me-2"></i>
                        Continue
                      </button>
                      {(!selectedDate || !selectedTime || !selectedClinicId) && (
                        <small className="text-muted d-block mt-2 text-center">
                          <i className="fa fa-info-circle me-1"></i>
                          Vui lòng chọn phòng khám và lịch trước khi tiếp tục
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 'info' && (
                <div className="card shadow">
                  <div className="card-header bg-warning text-white">
                    <h3 className="mb-0">👤 Patient Information</h3>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-outline-secondary mb-3"
                      onClick={() => setStep('time')}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back
                    </button>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={patientInfo.name}
                          onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={patientInfo.email}
                          onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={patientInfo.phone}
                          onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        className="btn btn-warning btn-lg w-100"
                        onClick={handleInfoSubmit}
                        disabled={!patientInfo.name || !patientInfo.email || !patientInfo.phone}
                      >
                        Continue to Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">✅ Confirm Test Appointment</h3>
                  </div>
                  <div className="card-body">
                    {errorMessage && (
                      <div className="alert alert-danger" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {errorMessage}
                      </div>
                    )}
                    <div className="alert alert-info">
                      <h5>Test Summary</h5>
                      <p><strong>Clinic:</strong> {clinics.find(c => c.id === selectedClinicId)?.name || 'N/A'}</p>
                      <p><strong>Test:</strong> {testTypes.find(t => t.id === selectedTest)?.name}</p>
                      <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                      <p><strong>Time:</strong> {selectedTime}</p>
                      <p><strong>Patient:</strong> {patientInfo.name}</p>
                      <p><strong>Price:</strong> ${testTypes.find(t => t.id === selectedTest)?.price}</p>
                    </div>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-success btn-lg"
                        onClick={handleConfirm}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-check me-2"></i>Confirm Appointment
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

              {step === 'result' && (
                <div className="card shadow">
                  <div className="card-header bg-warning text-white">
                    <h3 className="mb-0">📊 View Result</h3>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-success">
                      <h5>Test ID: {testId}</h5>
                      <p>Your test appointment has been confirmed!</p>
                    </div>
                    <div className="alert alert-info">
                      <i className="fa fa-info-circle me-2"></i>
                      Test results will be available after the test is completed. You will be notified via email.
                    </div>
                    <div className="text-center py-5">
                      <i className="fa fa-vial fa-3x text-muted mb-3"></i>
                      <p className="text-muted">Results will appear here once available</p>
                    </div>
                    <div className="mt-4">
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => router.push('/dashboard')}
                      >
                        Go to Dashboard
                      </button>
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

