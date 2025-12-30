'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';

const SPECIALIZATIONS = [
  { value: 'Emergency Care', label: 'Cấp cứu' },
  { value: 'Operation & Surgery', label: 'Phẫu thuật' },
  { value: 'Outdoor Checkup', label: 'Khám ngoại trú' },
  { value: 'Ambulance Service', label: 'Dịch vụ xe cứu thương' },
  { value: 'Medicine & Pharmacy', label: 'Thuốc & Dược phẩm' },
  { value: 'Blood Testing', label: 'Xét nghiệm máu' },
];

export default function Search() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [showDoctorDetail, setShowDoctorDetail] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    reason: '',
  });

  useEffect(() => {
    loadClinics();
    loadAllDoctors();
  }, []);

  const loadClinics = async () => {
    try {
      const clinicApi = getClinicManagement();
      const response = await clinicApi.getAllClinics();
      const clinicsData = Array.isArray(response) ? response : [];
      setClinics(clinicsData);
    } catch (error: any) {
      console.error('Error loading clinics:', error);
      setClinics([]);
    }
  };

  const loadAllDoctors = async () => {
    try {
      setIsLoading(true);
      const doctorApi = getDoctorManagement();
      const response = await doctorApi.getAllDoctors();
      const doctorsData = response.data || response;
      const allDoctors = Array.isArray(doctorsData) ? doctorsData : [];
      setDoctors(allDoctors);
      setFilteredDoctors(allDoctors);
    } catch (error: any) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const doctorApi = getDoctorManagement();
      
      let doctorsData: any[] = [];
      
      if (selectedClinicId) {
        // Nếu chọn clinic, lấy doctors theo clinic
        const response = await doctorApi.getDoctorsByClinic(Number(selectedClinicId));
        doctorsData = Array.isArray(response) ? response : (Array.isArray(response.data) ? response.data : []);
      } else {
        // Nếu không chọn clinic, lấy tất cả doctors
        const response = await doctorApi.getAllDoctors();
        doctorsData = response.data || response;
        doctorsData = Array.isArray(doctorsData) ? doctorsData : [];
      }
      
      // Filter theo chuyên khoa
      if (selectedSpecialization) {
        doctorsData = doctorsData.filter((doctor) => 
          doctor.specialization === selectedSpecialization
        );
      }
      
      // Filter theo keyword nếu có
      if (keyword.trim()) {
        const keywordLower = keyword.toLowerCase().trim();
        doctorsData = doctorsData.filter((doctor) => {
          const fullName = doctor.user?.fullName?.toLowerCase() || '';
          const specialization = doctor.specialization?.toLowerCase() || '';
          const email = doctor.user?.email?.toLowerCase() || '';
          const bio = doctor.bio?.toLowerCase() || '';
          
          return fullName.includes(keywordLower) || 
                 specialization.includes(keywordLower) ||
                 email.includes(keywordLower) ||
                 bio.includes(keywordLower);
        });
      }
      
      // Chỉ hiển thị bác sĩ đã được duyệt
      doctorsData = doctorsData.filter((doctor) => 
        doctor.user?.status === 'APPROVED' || doctor.status === 'APPROVED'
      );
      
      setFilteredDoctors(doctorsData);
    } catch (error: any) {
      console.error('Error searching doctors:', error);
      setFilteredDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowDoctorDetail(true);
  };

  const handleBookAppointment = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
    setShowDoctorDetail(false);
  };

  const getAvailableTimeSlots = () => {
    // Tạo danh sách giờ khám từ 8h đến 17h
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getAvailableDates = () => {
    // Tạo danh sách 14 ngày tiếp theo
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        fullLabel: date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      });
    }
    return dates;
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.phone) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      // TODO: Call API to create appointment
      // const appointmentApi = getAppointmentManagement();
      // await appointmentApi.createAppointment({
      //   doctorId: selectedDoctor.id,
      //   appointmentDate: `${selectedDate}T${selectedTime}:00`,
      //   patientName: bookingForm.name,
      //   patientPhone: bookingForm.phone,
      //   patientEmail: bookingForm.email,
      //   reason: bookingForm.reason,
      // });

      alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      setShowBookingModal(false);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setBookingForm({ name: '', phone: '', email: '', reason: '' });
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại!');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Topbar />
      <Navbar />

      {/* Search Start */}
      <div className="container-fluid pt-5">
        <div className="container">
          <div className="text-center mx-auto mb-5" style={{ maxWidth: '500px' }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
              Find A Doctor
            </h5>
            <h1 className="display-4 mb-4">Find A Healthcare Professionals</h1>
            <h5 className="fw-normal">
              Duo ipsum erat stet dolor sea ut nonumy tempor. Tempor duo lorem eos sit sed ipsum
              takimata ipsum sit est. Ipsum ea voluptua ipsum sit justo
            </h5>
          </div>
          <div className="mx-auto" style={{ width: '100%', maxWidth: '800px' }}>
            <div className="row g-2">
              <div className="col-md-3">
                <select 
                  className="form-select border-primary" 
                  style={{ height: '60px' }}
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                >
                  <option value="">Tất cả cơ sở</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select border-primary" 
                  style={{ height: '60px' }}
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <input 
                  type="text" 
                  className="form-control border-primary h-100" 
                  style={{ height: '60px' }}
                  placeholder="Tìm theo tên, email..." 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="col-md-2">
                <button 
                  className="btn btn-dark border-0 w-100 h-100"
                  style={{ height: '60px' }}
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <>
                      <i className="fa fa-search me-1"></i>
                      Tìm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Search End */}

      {/* Search Result Start */}
      <div className="container-fluid py-5">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Đang tìm kiếm bác sĩ...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-user-md fa-3x text-muted mb-3"></i>
              <p className="text-muted">Không tìm thấy bác sĩ nào</p>
              <p className="text-muted">Vui lòng thử lại với từ khóa hoặc cơ sở khác</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="col-lg-6">
                    <div className="card shadow-sm h-100">
                      <div className="row g-0">
                        <div className="col-md-4">
                          <Image
                            src={`/img/team-${((doctor.id || 0) % 3) + 1}.jpg`}
                            alt={doctor.user?.fullName || 'Doctor'}
                            width={200}
                            height={250}
                            className="img-fluid w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="col-md-8">
                          <div className="card-body d-flex flex-column h-100">
                            <div>
                              <h5 className="card-title mb-1">{doctor.user?.fullName || 'N/A'}</h5>
                              <h6 className="text-primary mb-2">
                                <i className="fa fa-stethoscope me-1"></i>
                                {doctor.specialization || 'Chưa có chuyên khoa'}
                              </h6>
                              {doctor.clinic && (
                                <p className="text-muted small mb-1">
                                  <i className="fa fa-hospital me-1"></i>
                                  {doctor.clinic.name}
                                </p>
                              )}
                              {doctor.experienceYears && (
                                <p className="text-muted small mb-1">
                                  <i className="fa fa-calendar me-1"></i>
                                  {doctor.experienceYears} năm kinh nghiệm
                                </p>
                              )}
                              {doctor.bio && (
                                <p className="card-text small text-muted mt-2" style={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {doctor.bio}
                                </p>
                              )}
                            </div>
                            <div className="mt-auto pt-3 d-flex gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm flex-fill"
                                onClick={() => handleViewDetail(doctor)}
                              >
                                <i className="fa fa-info-circle me-1"></i>
                                Chi tiết
                              </button>
                              <button
                                className="btn btn-primary btn-sm flex-fill"
                                onClick={() => handleBookAppointment(doctor)}
                              >
                                <i className="fa fa-calendar-check me-1"></i>
                                Đặt lịch
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredDoctors.length > 0 && (
                <div className="col-12 text-center mt-4">
                  <p className="text-muted">Tìm thấy {filteredDoctors.length} bác sĩ</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Search Result End */}

      {/* Doctor Detail Modal */}
      {showDoctorDetail && selectedDoctor && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fa fa-user-md me-2"></i>
                  Chi tiết bác sĩ
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDoctorDetail(false);
                    setSelectedDoctor(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <Image
                      src={`/img/team-${((selectedDoctor.id || 0) % 3) + 1}.jpg`}
                      alt={selectedDoctor.user?.fullName || 'Doctor'}
                      width={200}
                      height={250}
                      className="img-fluid rounded mb-3"
                      style={{ objectFit: 'cover' }}
                    />
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleBookAppointment(selectedDoctor)}
                    >
                      <i className="fa fa-calendar-check me-2"></i>
                      Đặt lịch khám
                    </button>
                  </div>
                  <div className="col-md-8">
                    <h4>{selectedDoctor.user?.fullName || 'N/A'}</h4>
                    <h6 className="text-primary mb-3">
                      <i className="fa fa-stethoscope me-2"></i>
                      {selectedDoctor.specialization || 'Chưa có chuyên khoa'}
                    </h6>
                    
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">Thông tin</h6>
                      {selectedDoctor.clinic && (
                        <p className="mb-2">
                          <i className="fa fa-hospital me-2 text-primary"></i>
                          <strong>Cơ sở:</strong> {selectedDoctor.clinic.name}
                        </p>
                      )}
                      {selectedDoctor.experienceYears && (
                        <p className="mb-2">
                          <i className="fa fa-calendar me-2 text-primary"></i>
                          <strong>Kinh nghiệm:</strong> {selectedDoctor.experienceYears} năm
                        </p>
                      )}
                      {selectedDoctor.licenseNumber && (
                        <p className="mb-2">
                          <i className="fa fa-certificate me-2 text-primary"></i>
                          <strong>Số giấy phép:</strong> {selectedDoctor.licenseNumber}
                        </p>
                      )}
                      {selectedDoctor.user?.email && (
                        <p className="mb-2">
                          <i className="fa fa-envelope me-2 text-primary"></i>
                          <strong>Email:</strong> {selectedDoctor.user.email}
                        </p>
                      )}
                      {selectedDoctor.user?.phone && (
                        <p className="mb-2">
                          <i className="fa fa-phone me-2 text-primary"></i>
                          <strong>Điện thoại:</strong> {selectedDoctor.user.phone}
                        </p>
                      )}
                    </div>

                    {selectedDoctor.bio && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">Giới thiệu</h6>
                        <p>{selectedDoctor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDoctorDetail(false);
                    setSelectedDoctor(null);
                  }}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleBookAppointment(selectedDoctor)}
                >
                  <i className="fa fa-calendar-check me-2"></i>
                  Đặt lịch khám
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fa fa-calendar-check me-2"></i>
                  Đặt lịch khám với {selectedDoctor.user?.fullName}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedDoctor(null);
                    setSelectedDate('');
                    setSelectedTime('');
                    setBookingForm({ name: '', phone: '', email: '', reason: '' });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="fa fa-info-circle me-2"></i>
                  <strong>Bác sĩ:</strong> {selectedDoctor.user?.fullName} - {selectedDoctor.specialization}
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fa fa-calendar me-2 text-primary"></i>
                      Chọn ngày <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                    >
                      <option value="">-- Chọn ngày --</option>
                      {getAvailableDates().map((date) => (
                        <option key={date.value} value={date.value}>
                          {date.label} - {date.fullLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fa fa-clock me-2 text-primary"></i>
                      Chọn giờ <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      disabled={!selectedDate}
                    >
                      <option value="">-- Chọn giờ --</option>
                      {selectedDate && getAvailableTimeSlots().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fa fa-user me-2 text-primary"></i>
                      Họ và tên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fa fa-phone me-2 text-primary"></i>
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fa fa-envelope me-2 text-primary"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="Nhập email (tùy chọn)"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      <i className="fa fa-file-medical me-2 text-primary"></i>
                      Lý do khám
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bookingForm.reason}
                      onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                      placeholder="Nhập lý do khám (tùy chọn)"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedDoctor(null);
                    setSelectedDate('');
                    setSelectedTime('');
                    setBookingForm({ name: '', phone: '', email: '', reason: '' });
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleBookingSubmit}
                >
                  <i className="fa fa-check me-2"></i>
                  Xác nhận đặt lịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <BackToTop />
    </>
  );
}

