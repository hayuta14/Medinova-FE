'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import LoginModal from '@/components/LoginModal';
import SignupModal from '@/components/SignupModal';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getUser, isAuthenticated } from '@/utils/auth';

export default function OutdoorCheckupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'department' | 'doctor' | 'datetime' | 'info' | 'confirm' | 'detail'>('department');
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    symptoms: '',
  });
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const loadDepartments = useCallback(async () => {
    try {
      const clinicApi = getClinicManagement();
      const response = await clinicApi.getAllClinics();
      setDepartments(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    }
  }, []);

  const loadDoctors = useCallback(async (clinicId: number) => {
    try {
      const doctorApi = getDoctorManagement();
      const response = await doctorApi.getDoctorsByClinic(clinicId);
      setDoctors(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    }
  }, []);

  useEffect(() => {
    // Kiểm tra authentication khi component mount
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const authenticated = isAuthenticated();
      setIsCheckingAuth(false);

      if (!authenticated) {
        // Nếu chưa đăng nhập, hiển thị login modal (không gọi API)
        setShowLoginModal(true);
      } else {
        // Nếu đã đăng nhập, load dữ liệu
        loadDepartments();
        const user = getUser();
        if (user) {
          setPatientInfo({
            name: user.fullName || '',
            email: user.email || '',
            phone: '',
            age: '',
            gender: '',
            symptoms: '',
          });
        }
      }
    };

    checkAuth();

    // Listen for auth-change event (khi đăng nhập thành công)
    const handleAuthChange = () => {
      const authenticated = isAuthenticated();
      if (authenticated) {
        setShowLoginModal(false);
        setShowSignupModal(false);
        // Load dữ liệu sau khi đăng nhập
        loadDepartments();
        const user = getUser();
        if (user) {
          setPatientInfo({
            name: user.fullName || '',
            email: user.email || '',
            phone: '',
            age: '',
            gender: '',
            symptoms: '',
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
  }, [loadDepartments]);

  useEffect(() => {
    if (selectedDepartment) {
      loadDoctors(Number(selectedDepartment));
    }
  }, [selectedDepartment, loadDoctors]);

  const handleDepartmentSelect = (deptId: string) => {
    setSelectedDepartment(deptId);
    setStep('doctor');
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setStep('datetime');
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep('info');
  };

  const handleInfoSubmit = () => {
    setStep('confirm');
  };

  const handleConfirm = () => {
    // TODO: Call API to create appointment
    const id = 'APT-' + Date.now();
    setAppointmentId(id);
    setStep('detail');
  };

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

  // Get hours from 8 to 17 (8 AM to 5 PM)
  const getHours = (): number[] => {
    return Array.from({ length: 10 }, (_, i) => i + 8); // 8-17
  };

  // Check if a slot is booked
  const isSlotBooked = (date: Date, hour: number): boolean => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const slotKey = `${year}-${month}-${day}-${hour}`;
    return bookedSlots.has(slotKey);
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
      return;
    }

    if (isSlotBooked(date, hour)) {
      return;
    }

    setSelectedDate(formatDateToString(date));
    setSelectedTime(`${hour.toString().padStart(2, '0')}:00`);
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

  const handleCloseLoginModal = () => {
    // Nếu chưa đăng nhập, đóng modal sẽ redirect về trang chủ
    if (!isAuthenticated()) {
      router.push('/');
    } else {
      setShowLoginModal(false);
    }
  };

  const handleCloseSignupModal = () => {
    setShowSignupModal(false);
    // Chuyển về login modal nếu chưa đăng nhập
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

  // Calculate week days and hours for the grid
  const weekStart = getWeekStart(selectedWeek);
  const weekDays = getWeekDays(weekStart);
  const hours = getHours(); // 8-17
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  // Hiển thị loading khi đang kiểm tra authentication
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
      
      {/* Login Modal - hiển thị khi chưa đăng nhập */}
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
                    {['Department', 'Doctor', 'Date & Time', 'Patient Info', 'Confirm'].map((label, index) => {
                      const steps = ['department', 'doctor', 'datetime', 'info', 'confirm'];
                      const currentStepIndex = steps.indexOf(step);
                      const isActive = index <= currentStepIndex;
                      return (
                        <div key={label} className="text-center flex-fill">
                          <div
                            className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                              isActive ? 'bg-primary text-white' : 'bg-secondary text-white'
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

              {/* Step 1: Select Department */}
              {step === 'department' && (
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">1️⃣ Select Department</h3>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {departments.map((dept) => (
                        <div key={dept.id} className="col-md-6">
                          <button
                            className="btn btn-outline-primary w-100 p-4 text-start"
                            onClick={() => handleDepartmentSelect(dept.id.toString())}
                          >
                            <h5>{dept.name}</h5>
                            <small className="text-muted">{dept.address}</small>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select Doctor */}
              {step === 'doctor' && (
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">2️⃣ Select Doctor</h3>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-outline-secondary mb-3"
                      onClick={() => setStep('department')}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back
                    </button>
                    <div className="row g-3">
                      {doctors.map((doctor) => (
                        <div key={doctor.id} className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <h5>{doctor.user?.fullName || 'Doctor'}</h5>
                              <p className="text-muted mb-2">{doctor.specialization}</p>
                              <p className="small mb-0">Experience: {doctor.experienceYears} years</p>
                              <button
                                className="btn btn-primary mt-3 w-100"
                                onClick={() => handleDoctorSelect(doctor.id.toString())}
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

              {/* Step 3: Select Date & Time */}
              {step === 'datetime' && (
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">3️⃣ Select Date & Time</h3>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-outline-secondary mb-3"
                      onClick={() => setStep('doctor')}
                    >
                      <i className="fa fa-arrow-left me-2"></i>Back
                    </button>

                    {/* Week Navigation */}
                    <div className="row mb-3">
                      <div className="col-12">
                        <div className="bg-light rounded p-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={goToPreviousWeek}
                            >
                              <i className="fa fa-chevron-left me-2"></i>Tuần trước
                            </button>
                            <h6 className="mb-0">
                              {weekStart.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })} - {' '}
                              {weekDays[6].toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                            </h6>
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={goToNextWeek}
                            >
                              Tuần sau<i className="fa fa-chevron-right ms-2"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="row mb-3">
                      <div className="col-12">
                        <div className="bg-light rounded p-4">
                          <div className="table-responsive">
                            <table className="table table-bordered table-hover mb-0" style={{ fontSize: '0.9rem' }}>
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: '80px', textAlign: 'center' }}>Giờ</th>
                                  {weekDays.map((date, index) => (
                                    <th key={index} style={{ textAlign: 'center', minWidth: '100px' }}>
                                      <div>{dayNames[index]}</div>
                                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        {date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {hours.map((hour) => (
                                  <tr key={hour}>
                                    <td className="text-center fw-bold" style={{ verticalAlign: 'middle' }}>
                                      {hour}:00
                                    </td>
                                    {weekDays.map((date, dayIndex) => {
                                      const isBooked = isSlotBooked(date, hour);
                                      const isSelected = isSlotSelected(date, hour);
                                      const isPast = isPastTime(date, hour);
                                      const isDisabled = isPast || isBooked;

                                      let btnClass = 'btn btn-sm';
                                      if (isSelected) {
                                        btnClass += ' btn-primary';
                                      } else if (isBooked) {
                                        btnClass += ' btn-danger';
                                      } else if (isPast) {
                                        btnClass += ' btn-secondary';
                                      } else {
                                        btnClass += ' btn-outline-primary';
                                      }

                                      return (
                                        <td key={dayIndex} style={{ padding: '4px', textAlign: 'center' }}>
                                          <button
                                            type="button"
                                            className={btnClass}
                                            style={{ width: '100%', minHeight: '40px' }}
                                            onClick={() => handleSlotSelection(date, hour)}
                                            disabled={isDisabled}
                                            title={
                                              isPast
                                                ? 'Lịch đã qua'
                                                : isBooked
                                                ? 'Đã được đặt'
                                                : `Chọn ${dayNames[dayIndex]} ${date.toLocaleDateString('vi-VN')} lúc ${hour}:00`
                                            }
                                          >
                                            {isBooked ? (
                                              <i className="fa fa-times"></i>
                                            ) : isSelected ? (
                                              <i className="fa fa-check"></i>
                                            ) : (
                                              <span style={{ fontSize: '0.8rem' }}>Trống</span>
                                            )}
                                          </button>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Legend */}
                          <div className="mt-3 d-flex flex-wrap gap-3 justify-content-center" style={{ fontSize: '0.85rem' }}>
                            <div className="d-flex align-items-center gap-2">
                              <button className="btn btn-sm btn-outline-primary" disabled style={{ minWidth: '60px' }}></button>
                              <span>Trống</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <button className="btn btn-sm btn-primary" disabled style={{ minWidth: '60px' }}></button>
                              <span>Đã chọn</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <button className="btn btn-sm btn-danger" disabled style={{ minWidth: '60px' }}></button>
                              <span>Đã đặt</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <button className="btn btn-sm btn-secondary" disabled style={{ minWidth: '60px' }}></button>
                              <span>Đã qua</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selected Date and Time Display */}
                    {selectedDate && selectedTime && (() => {
                      // Parse selectedDate correctly (YYYY-MM-DD format)
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

                    {selectedDate && selectedTime && (
                      <div className="mt-4">
                        <button
                          className="btn btn-primary btn-lg w-100"
                          onClick={() => handleDateTimeSelect(selectedDate, selectedTime)}
                        >
                          Continue
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Patient Info */}
              {step === 'info' && (
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">4️⃣ Patient Information</h3>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-outline-secondary mb-3"
                      onClick={() => setStep('datetime')}
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
                      <div className="col-md-3">
                        <label className="form-label">Age</label>
                        <input
                          type="number"
                          className="form-control"
                          value={patientInfo.age}
                          onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select"
                          value={patientInfo.gender}
                          onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Symptoms / Reason for visit</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={patientInfo.symptoms}
                          onChange={(e) => setPatientInfo({ ...patientInfo, symptoms: e.target.value })}
                          placeholder="Describe your symptoms..."
                        ></textarea>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        className="btn btn-primary btn-lg w-100"
                        onClick={handleInfoSubmit}
                        disabled={!patientInfo.name || !patientInfo.email || !patientInfo.phone}
                      >
                        Continue to Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirm */}
              {step === 'confirm' && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">5️⃣ Confirm Appointment</h3>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-info">
                      <h5>Appointment Summary</h5>
                      <p><strong>Department:</strong> {departments.find(d => d.id.toString() === selectedDepartment)?.name}</p>
                      <p><strong>Doctor:</strong> {doctors.find(d => d.id.toString() === selectedDoctor)?.user?.fullName}</p>
                      <p><strong>Date:</strong> {(() => {
                        const [year, month, day] = selectedDate.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString('vi-VN');
                      })()}</p>
                      <p><strong>Time:</strong> {selectedTime}</p>
                      <p><strong>Patient:</strong> {patientInfo.name}</p>
                    </div>
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-success btn-lg"
                        onClick={handleConfirm}
                      >
                        <i className="fa fa-check me-2"></i>Confirm Appointment
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setStep('info')}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Appointment Detail */}
              {step === 'detail' && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">✅ Appointment Confirmed</h3>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-success">
                      <h5>Appointment ID: {appointmentId}</h5>
                      <p>Your appointment has been successfully booked!</p>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <button className="btn btn-outline-primary w-100">
                          <i className="fa fa-calendar-alt me-2"></i>Reschedule
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button className="btn btn-outline-danger w-100">
                          <i className="fa fa-times me-2"></i>Cancel
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button className="btn btn-outline-info w-100">
                          <i className="fa fa-comments me-2"></i>Chat
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button className="btn btn-outline-success w-100">
                          <i className="fa fa-phone me-2"></i>Call
                        </button>
                      </div>
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

