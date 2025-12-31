'use client';

import { useState, useEffect } from 'react';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getUser, isAuthenticated } from '@/utils/auth';

interface AppointmentFormProps {
  bgColor?: string;
  textColor?: string;
}

export default function AppointmentForm({ bgColor = 'bg-white', textColor = 'bg-light' }: AppointmentFormProps) {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // Load hospitals on mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated()) {
      loadHospitals();
    }
  }, []);

  // Load doctors when hospital is selected (only if authenticated)
  useEffect(() => {
    if (selectedHospitalId && isAuthenticated()) {
      loadDoctorsByHospital(Number(selectedHospitalId));
      setSelectedDoctorId('');
      setSelectedDay(0);
      setSelectedHour(0);
      setBookedSlots(new Set());
    } else {
      setDoctors([]);
      setSelectedDoctorId('');
    }
  }, [selectedHospitalId]);

  // Load appointments when doctor is selected
  useEffect(() => {
    if (selectedDoctorId && selectedYear && selectedMonth) {
      loadDoctorAppointments(Number(selectedDoctorId), selectedYear, selectedMonth);
    } else {
      setBookedSlots(new Set());
    }
  }, [selectedDoctorId, selectedYear, selectedMonth]);

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
      const doctorsData = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : []);
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
    setSelectedDay(0);
    setSelectedHour(0);
    setErrorMessage('');
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoctorId(e.target.value);
    setSelectedDay(0);
    setSelectedHour(0);
    setErrorMessage('');
  };

  const handleDateSelection = (day: number) => {
    if (day === 0) return;
    
    setSelectedDay(day);
    setSelectedHour(0);
    setSelectedTime('');
    setErrorMessage('');
    
    const date = new Date(selectedYear, selectedMonth - 1, day);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleTimeSelection = (hour: number) => {
    if (selectedDay === 0) {
      setErrorMessage('Vui lòng chọn ngày trước.');
      return;
    }
    
    const slotKey = `${selectedYear}-${selectedMonth}-${selectedDay}-${hour}`;
    if (bookedSlots.has(slotKey)) {
      setErrorMessage('Lịch này đã được đặt. Vui lòng chọn lịch khác.');
      return;
    }
    
    setSelectedHour(hour);
    setErrorMessage('');
    
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    setSelectedTime(timeStr);
  };

  const isSlotBooked = (day: number, hour: number): boolean => {
    if (day === 0) return false;
    const slotKey = `${selectedYear}-${selectedMonth}-${day}-${hour}`;
    return bookedSlots.has(slotKey);
  };

  const hasBookedSlotsOnDay = (day: number): boolean => {
    if (day === 0) return false;
    return hours.some(hour => isSlotBooked(day, hour));
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month - 1, 1).getDay();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHospitalId || !selectedDoctorId || !selectedDay || !selectedHour) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (isSlotBooked(selectedDay, selectedHour)) {
      setErrorMessage('Lịch này đã được đặt. Vui lòng chọn lịch khác.');
      return;
    }

    try {
      alert('Đặt lịch thành công!');
      
      setSelectedHospitalId('');
      setSelectedDoctorId('');
      setSelectedDay(0);
      setSelectedHour(0);
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

  useEffect(() => {
    const user = getUser();
    if (user) {
      setFormData({
        name: user.fullName || '',
        email: user.email || '',
      });
    }
  }, []);

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7-21

  return (
    <div className={`${bgColor} text-center rounded p-5`}>
      <h1 className="mb-4">Book An Appointment</h1>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Hospital Selection */}
          <div className="col-12">
            <select
              className={`form-select ${textColor} border-0`}
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

          {/* Doctor Selection */}
          <div className="col-12">
            <select
              className={`form-select ${textColor} border-0`}
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

          {/* Name and Email */}
          <div className="col-12 col-sm-6">
            <input
              type="text"
              className={`form-control ${textColor} border-0`}
              placeholder="Your Name"
              style={{ height: '55px' }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="col-12 col-sm-6">
            <input
              type="email"
              className={`form-control ${textColor} border-0`}
              placeholder="Your Email"
              style={{ height: '55px' }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Date and Time Selection */}
          {selectedDoctorId && (
            <>
              {/* Year and Month Selection */}
              <div className="col-12 col-sm-6">
                <select
                  className={`form-select ${textColor} border-0`}
                  style={{ height: '55px' }}
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setSelectedDay(0);
                    setSelectedHour(0);
                  }}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                    <option key={year} value={year}>
                      Năm {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <select
                  className={`form-select ${textColor} border-0`}
                  style={{ height: '55px' }}
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(Number(e.target.value));
                    setSelectedDay(0);
                    setSelectedHour(0);
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      Tháng {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calendar */}
              <div className="col-12">
                <div className={`${textColor} rounded p-3`}>
                  <h6 className="mb-3">Chọn ngày:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {Array.from({ length: firstDay }, (_, i) => (
                      <div key={`empty-${i}`} style={{ width: '40px', height: '40px' }}></div>
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const hasBooked = hasBookedSlotsOnDay(day);
                      const isSelected = selectedDay === day;
                      const isPastDate = new Date(selectedYear, selectedMonth - 1, day) < new Date(new Date().setHours(0, 0, 0, 0));
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`btn ${isSelected ? 'btn-primary' : hasBooked ? 'btn-danger' : isPastDate ? 'btn-secondary' : 'btn-outline-primary'}`}
                          style={{ width: '40px', height: '40px' }}
                          onClick={() => handleDateSelection(day)}
                          disabled={isPastDate}
                          title={hasBooked ? 'Có lịch đã đặt' : isPastDate ? 'Ngày đã qua' : ''}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              {selectedDay > 0 && (
                <div className="col-12">
                  <div className={`${textColor} rounded p-3`}>
                    <h6 className="mb-3">Chọn giờ:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {hours.map((hour) => {
                        const isBooked = isSlotBooked(selectedDay, hour);
                        const isSelected = selectedHour === hour;
                        return (
                          <button
                            key={hour}
                            type="button"
                            className={`btn ${isSelected ? 'btn-primary' : isBooked ? 'btn-danger' : 'btn-outline-primary'}`}
                            style={{ minWidth: '60px' }}
                            onClick={() => handleTimeSelection(hour)}
                            disabled={isBooked && !isSelected}
                            title={isBooked ? 'Đã trùng lịch' : `${hour}:00`}
                          >
                            {hour}:00
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Date and Time Display */}
              {(selectedDate || selectedTime) && (
                <div className="col-12">
                  <div className="alert alert-info mb-0">
                    <strong>Lịch đã chọn:</strong> {selectedDate} {selectedTime && `- ${selectedTime}`}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="col-12">
              <div className="alert alert-danger mb-0">
                {errorMessage}
              </div>
            </div>
          )}

          <div className="col-12">
            <button
              className="btn btn-primary w-100 py-3"
              type="submit"
              disabled={!selectedHospitalId || !selectedDoctorId || !selectedDay || !selectedHour}
            >
              Make An Appointment
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

