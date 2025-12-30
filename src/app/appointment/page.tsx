'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import RequireAuth from '@/components/RequireAuth';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getUser } from '@/utils/auth';

export default function Appointment() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // Load hospitals on mount
  useEffect(() => {
    loadHospitals();
  }, []);

  // Load doctors when hospital is selected
  useEffect(() => {
    if (selectedHospitalId) {
      loadDoctorsByHospital(Number(selectedHospitalId));
      // Reset doctor selection when hospital changes
      setSelectedDoctorId('');
      setSelectedDate('');
      setSelectedTime('');
      setBookedSlots(new Set());
    } else {
      setDoctors([]);
      setSelectedDoctorId('');
    }
  }, [selectedHospitalId]);

  // Load appointments when doctor is selected
  useEffect(() => {
    if (selectedDoctorId && selectedWeek) {
      const year = selectedWeek.getFullYear();
      const month = selectedWeek.getMonth() + 1;
      loadDoctorAppointments(Number(selectedDoctorId), year, month);
    } else {
      setBookedSlots(new Set());
    }
  }, [selectedDoctorId, selectedWeek]);

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      const clinicApi = getClinicManagement();
      const response = await clinicApi.getAllClinics();
      const clinicsData = Array.isArray(response) ? response : [];
      setHospitals(clinicsData);
    } catch (error: any) {
      console.error('Error loading hospitals:', error);
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctorsByHospital = async (hospitalId: number) => {
    try {
      setIsLoadingDoctors(true);
      const doctorApi = getDoctorManagement();
      const response = await doctorApi.getDoctorsByClinic(hospitalId);
      const doctorsData = Array.isArray(response) ? response : [];
      setDoctors(doctorsData);
    } catch (error: any) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const loadDoctorAppointments = async (doctorId: number, year: number, month: number) => {
    try {
      setIsLoadingAppointments(true);
      // TODO: Replace with actual appointment API when available
      // For now, we'll use a placeholder that returns empty array
      // const appointmentApi = getAppointmentManagement();
      // const response = await appointmentApi.getDoctorAppointments(doctorId, year, month);
      
      // Placeholder: In a real implementation, you would call:
      // const appointments = response.data || response;
      // Then convert appointments to a Set of slot strings like "YYYY-MM-DD-HH"
      const appointments: any[] = [];
      const slots = new Set<string>();
      
      appointments.forEach((apt: any) => {
        if (apt.appointmentDate) {
          const date = new Date(apt.appointmentDate);
          const slotKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
          slots.add(slotKey);
        }
      });
      
      setBookedSlots(slots);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      setBookedSlots(new Set());
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHospitalId(e.target.value);
    setSelectedDoctorId('');
    setSelectedDate('');
    setSelectedTime('');
    setErrorMessage('');
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoctorId(e.target.value);
    setSelectedDate('');
    setSelectedTime('');
    setErrorMessage('');
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

  // Check if a date is in the past
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Check if a time slot is in the past
  const isPastTime = (date: Date, hour: number): boolean => {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < now;
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

    if (isSlotBooked(date, hour)) {
      setErrorMessage('Lịch này đã được đặt. Vui lòng chọn lịch khác.');
      return;
    }

    setSelectedDate(formatDateToString(date));
    setSelectedTime(`${hour.toString().padStart(2, '0')}:00`);
    setErrorMessage('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHospitalId || !selectedDoctorId || !selectedDate || !selectedTime) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const [year, month, day] = selectedDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    const selectedHour = parseInt(selectedTime.split(':')[0]);
    
    if (isSlotBooked(selectedDateObj, selectedHour)) {
      setErrorMessage('Lịch này đã được đặt. Vui lòng chọn lịch khác.');
      return;
    }

    try {
      // TODO: Replace with actual appointment creation API
      // const appointmentApi = getAppointmentManagement();
      // const appointmentDateTime = new Date(selectedDateObj);
      // appointmentDateTime.setHours(selectedHour, 0, 0, 0);
      // await appointmentApi.createAppointment({
      //   doctorId: Number(selectedDoctorId),
      //   clinicId: Number(selectedHospitalId),
      //   appointmentDate: appointmentDateTime.toISOString(),
      //   patientName: formData.name,
      //   patientEmail: formData.email,
      // });
      
      alert('Đặt lịch thành công!');
      
      // Reset form
      setSelectedHospitalId('');
      setSelectedDoctorId('');
      setSelectedDate('');
      setSelectedTime('');
      setFormData({ name: '', email: '' });
      setErrorMessage('');
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!';
      setErrorMessage(errorMsg);
    }
  };

  // Get user info for pre-filling form
  useEffect(() => {
    const user = getUser();
    if (user) {
      setFormData({
        name: user.fullName || '',
        email: user.email || '',
      });
    }
  }, []);

  const weekStart = getWeekStart(selectedWeek);
  const weekDays = getWeekDays(weekStart);
  const hours = getHours(); // 8-17
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  return (
    <RequireAuth>
      <Topbar />
      <Navbar />

      {/* Appointment Start */}
      <div className="container-fluid py-5">
        <div className="container-fluid px-4">
          <div className="row">
            <div className="col-12">
              <div className="bg-light rounded p-5">
                <h1 className="mb-4 text-center">Book An Appointment</h1>
                <form onSubmit={handleSubmit}>
                  {/* Input Fields Row - Horizontal Layout */}
                  <div className="row g-3 mb-4">
                    {/* Hospital Selection */}
                    <div className="col-lg-3 col-md-6">
                      <label className="form-label fw-bold">Cơ sở khám</label>
                      <select
                        className="form-select bg-white border-0"
                        style={{ height: '55px' }}
                        value={selectedHospitalId}
                        onChange={handleHospitalChange}
                        required
                      >
                        <option value="">Chọn cơ sở khám</option>
                        {hospitals.map((hospital) => (
                          <option key={hospital.id} value={hospital.id}>
                            {hospital.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Doctor Selection - Only enabled after hospital is selected */}
                    <div className="col-lg-3 col-md-6">
                      <label className="form-label fw-bold">Bác sĩ</label>
                      <select
                        className="form-select bg-white border-0"
                        style={{ height: '55px' }}
                        value={selectedDoctorId}
                        onChange={handleDoctorChange}
                        disabled={!selectedHospitalId || isLoadingDoctors}
                        required
                      >
                        <option value="">
                          {isLoadingDoctors ? 'Đang tải...' : selectedHospitalId ? 'Chọn bác sĩ' : 'Vui lòng chọn cơ sở trước'}
                        </option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.user?.fullName || 'Bác sĩ'} - {doctor.specialization || ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name */}
                    <div className="col-lg-3 col-md-6">
                      <label className="form-label fw-bold">Họ và tên</label>
                      <input
                        type="text"
                        className="form-control bg-white border-0"
                        placeholder="Your Name"
                        style={{ height: '55px' }}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="col-lg-3 col-md-6">
                      <label className="form-label fw-bold">Email</label>
                      <input
                        type="email"
                        className="form-control bg-white border-0"
                        placeholder="Your Email"
                        style={{ height: '55px' }}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Schedule Table - Only shown after doctor is selected */}
                  {selectedDoctorId && (
                    <>
                      {/* Week Navigation */}
                      <div className="row">
                        <div className="col-12">
                          <div className="bg-white rounded p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
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

                            {/* Schedule Table */}
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
                          <div className="row mt-3">
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
                    </>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="alert alert-danger mb-0">
                          {errorMessage}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row mt-4">
                    <div className="col-12">
                      <button
                        className="btn btn-primary w-100 py-3"
                        type="submit"
                        disabled={!selectedHospitalId || !selectedDoctorId || !selectedDate || !selectedTime}
                      >
                        Make An Appointment
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Appointment End */}

      <Footer />
      <BackToTop />
    </RequireAuth>
  );
}
