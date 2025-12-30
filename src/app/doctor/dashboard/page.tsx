'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUser } from '@/utils/auth';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';

// Danh sách chuyên khoa
const SPECIALIZATIONS = [
  { value: 'Emergency Care', label: 'Cấp cứu' },
  { value: 'Operation & Surgery', label: 'Phẫu thuật' },
  { value: 'Outdoor Checkup', label: 'Khám ngoại trú' },
  { value: 'Ambulance Service', label: 'Dịch vụ xe cứu thương' },
  { value: 'Medicine & Pharmacy', label: 'Thuốc & Dược phẩm' },
  { value: 'Blood Testing', label: 'Xét nghiệm máu' },
];

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 8,
    activeEmergencies: 1,
    pendingLabResults: 2,
    upcomingSurgeries: 1,
  });

  const [updateFormData, setUpdateFormData] = useState({
    specialization: '',
    experienceYears: '',
    licenseNumber: '',
    certificateFile: null as File | null,
    bio: '',
  });

  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    if (userData) {
      loadDoctorProfile();
      checkPendingRequests();
    }
  }, []);

  const loadDoctorProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const userData = getUser();
      
      if (!userData) {
        console.warn('User data not found');
        return;
      }

      // Lấy user ID từ các trường có thể có
      const userId = userData.id || userData.userId || userData.user?.id;
      const userEmail = userData.email;

      if (!userId && !userEmail) {
        console.warn('User ID and email not found in user data:', userData);
        return;
      }

      const doctorApi = getDoctorManagement();
      const response = await doctorApi.getAllDoctors();
      // API có thể trả về data trực tiếp hoặc trong response.data
      const doctorsData = (response as any)?.data || response;
      const allDoctors = Array.isArray(doctorsData) ? doctorsData : [];
      
      // Tìm doctor theo user ID hoặc email
      let currentDoctor = null;
      
      if (userId) {
        currentDoctor = allDoctors.find((doc: any) => 
          doc.user?.id === userId || 
          doc.userId === userId ||
          doc.user?.userId === userId
        );
      }
      
      // Nếu không tìm thấy theo ID, thử tìm theo email
      if (!currentDoctor && userEmail) {
        currentDoctor = allDoctors.find((doc: any) => 
          doc.user?.email === userEmail || 
          doc.email === userEmail
        );
      }
      
      if (currentDoctor) {
        setDoctorProfile(currentDoctor);
        // Pre-fill form với dữ liệu hiện tại
        setUpdateFormData({
          specialization: currentDoctor.specialization || '',
          experienceYears: currentDoctor.experienceYears?.toString() || '',
          licenseNumber: currentDoctor.licenseNumber || '',
          certificateFile: null,
          bio: currentDoctor.bio || '',
        });
      } else {
        console.warn('Doctor profile not found for user:', { userId, userEmail });
      }
    } catch (error: any) {
      console.error('Error loading doctor profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const checkPendingRequests = async () => {
    try {
      // TODO: Implement API call to check for pending update requests
      // For now, we'll check if there's a pending request status
      // This should be replaced with actual API call when backend is ready
      const userData = getUser();
      if (userData?.updateRequestStatus === 'PENDING') {
        setPendingRequest({ status: 'PENDING' });
      }
    } catch (error: any) {
      console.error('Error checking pending requests:', error);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUpdateFormData(prev => ({
        ...prev,
        certificateFile: e.target.files![0]
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: any = {};
    
    if (!updateFormData.specialization) {
      errors.specialization = 'Chuyên khoa là bắt buộc';
    }
    
    if (!updateFormData.experienceYears) {
      errors.experienceYears = 'Số năm kinh nghiệm là bắt buộc';
    } else if (isNaN(Number(updateFormData.experienceYears)) || Number(updateFormData.experienceYears) < 0) {
      errors.experienceYears = 'Số năm kinh nghiệm phải là số hợp lệ';
    }
    
    if (!updateFormData.licenseNumber) {
      errors.licenseNumber = 'Số giấy phép là bắt buộc';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (pendingRequest?.status === 'PENDING') {
      alert('Bạn đã có yêu cầu cập nhật đang chờ duyệt. Vui lòng đợi admin xử lý!');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // TODO: Implement API call to submit update request
      // This should create a new update request that needs admin approval
      // For now, we'll simulate the API call
      
      const formDataToSend = new FormData();
      formDataToSend.append('specialization', updateFormData.specialization);
      formDataToSend.append('experienceYears', updateFormData.experienceYears);
      formDataToSend.append('licenseNumber', updateFormData.licenseNumber);
      formDataToSend.append('bio', updateFormData.bio);
      if (updateFormData.certificateFile) {
        formDataToSend.append('certificate', updateFormData.certificateFile);
      }

      // Simulate API call - Replace with actual API endpoint when ready
      // const doctorApi = getDoctorManagement();
      // await doctorApi.submitUpdateRequest(formDataToSend);
      
      // For now, set pending request locally
      setPendingRequest({ status: 'PENDING' });
      setShowUpdateForm(false);
      alert('Yêu cầu cập nhật thông tin đã được gửi. Vui lòng đợi admin duyệt!');
      
      // Reset form
      setUpdateFormData({
        specialization: doctorProfile?.specialization || '',
        experienceYears: doctorProfile?.experienceYears?.toString() || '',
        licenseNumber: doctorProfile?.licenseNumber || '',
        certificateFile: null,
        bio: doctorProfile?.bio || '',
      });
    } catch (error: any) {
      console.error('Error submitting update request:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">
            👨‍⚕️ {user?.fullName || 'Bác sĩ'} - {user?.specialization || 'Chuyên khoa'}
          </h2>
          <p className="text-muted mb-0">
            📅 {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 Thông tin cá nhân</h5>
              {!showUpdateForm && (
                <button 
                  className="btn btn-sm btn-light"
                  onClick={() => setShowUpdateForm(true)}
                  disabled={pendingRequest?.status === 'PENDING'}
                >
                  <i className="fa fa-edit me-1"></i>
                  Gửi yêu cầu chỉnh sửa
                </button>
              )}
            </div>
            <div className="card-body">
              {/* Alert for pending request */}
              {pendingRequest?.status === 'PENDING' && (
                <div className="alert alert-warning mb-4">
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  <strong>Thông báo:</strong> Bạn đã có yêu cầu cập nhật thông tin đang chờ duyệt. 
                  Vui lòng đợi admin xử lý trước khi gửi yêu cầu mới.
                </div>
              )}

              {!showUpdateForm ? (
                /* Current Profile (Read-only) */
                <div>
                  {isLoadingProfile ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-md-3 text-center mb-4">
                        <div className="mb-3">
                          {doctorProfile?.user?.avatar || doctorProfile?.avatar ? (
                            <img 
                              src={doctorProfile.user?.avatar || doctorProfile.avatar} 
                              alt="Ảnh đại diện" 
                              className="img-fluid rounded-circle"
                              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
                              style={{ width: '150px', height: '150px' }}
                            >
                              <i className="fa fa-user fa-4x text-white"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          {doctorProfile?.user?.status === 'APPROVED' || doctorProfile?.status === 'APPROVED' ? (
                            <span className="badge bg-success">
                              <i className="fa fa-check-circle me-1"></i>
                              Đã duyệt
                            </span>
                          ) : (
                            <span className="badge bg-warning">
                              <i className="fa fa-clock me-1"></i>
                              Chờ duyệt
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-9">
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="text-muted small">Họ tên</label>
                            <p className="fw-bold mb-0">{doctorProfile?.user?.fullName || user?.fullName || 'N/A'}</p>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">Chuyên khoa</label>
                            <p className="fw-bold mb-0">{doctorProfile?.specialization || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="text-muted small">Số giấy phép</label>
                            <p className="fw-bold mb-0">{doctorProfile?.licenseNumber || 'N/A'}</p>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">Số năm kinh nghiệm</label>
                            <p className="fw-bold mb-0">{doctorProfile?.experienceYears ? `${doctorProfile.experienceYears} năm` : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="text-muted small">Cơ sở công tác</label>
                            <p className="fw-bold mb-0">{doctorProfile?.clinic?.name || 'N/A'}</p>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">Bằng cấp / Chứng chỉ</label>
                            <p className="fw-bold mb-0">
                              {doctorProfile?.certificates && doctorProfile.certificates.length > 0 
                                ? doctorProfile.certificates.join(', ') 
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {doctorProfile?.bio && (
                          <div className="row mb-3">
                            <div className="col-12">
                              <label className="text-muted small">Mô tả</label>
                              <p className="mb-0">{doctorProfile.bio}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Update Request Form */
                <div>
                  <div className="alert alert-info mb-4">
                    <i className="fa fa-info-circle me-2"></i>
                    <strong>Lưu ý:</strong> Thông tin bạn chỉnh sửa sẽ cần được admin duyệt trước khi được cập nhật vào hồ sơ.
                  </div>
                  
                  <form onSubmit={handleSubmitUpdateRequest}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="specialization" className="form-label">
                          Chuyên khoa <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${formErrors.specialization ? 'is-invalid' : ''}`}
                          id="specialization"
                          name="specialization"
                          value={updateFormData.specialization}
                          onChange={handleFormChange}
                          disabled={pendingRequest?.status === 'PENDING' || isSubmitting}
                          required
                        >
                          <option value="">-- Chọn chuyên khoa --</option>
                          {SPECIALIZATIONS.map((spec) => (
                            <option key={spec.value} value={spec.value}>
                              {spec.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.specialization && (
                          <div className="invalid-feedback">{formErrors.specialization}</div>
                        )}
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="experienceYears" className="form-label">
                          Số năm kinh nghiệm <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${formErrors.experienceYears ? 'is-invalid' : ''}`}
                          id="experienceYears"
                          name="experienceYears"
                          value={updateFormData.experienceYears}
                          onChange={handleFormChange}
                          disabled={pendingRequest?.status === 'PENDING' || isSubmitting}
                          min="0"
                          required
                        />
                        {formErrors.experienceYears && (
                          <div className="invalid-feedback">{formErrors.experienceYears}</div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="licenseNumber" className="form-label">
                          Số giấy phép <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${formErrors.licenseNumber ? 'is-invalid' : ''}`}
                          id="licenseNumber"
                          name="licenseNumber"
                          value={updateFormData.licenseNumber}
                          onChange={handleFormChange}
                          disabled={pendingRequest?.status === 'PENDING' || isSubmitting}
                          required
                        />
                        {formErrors.licenseNumber && (
                          <div className="invalid-feedback">{formErrors.licenseNumber}</div>
                        )}
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="certificateFile" className="form-label">
                          Upload chứng chỉ
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="certificateFile"
                          name="certificateFile"
                          onChange={handleFileChange}
                          disabled={pendingRequest?.status === 'PENDING' || isSubmitting}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <small className="text-muted">Chấp nhận file: PDF, JPG, PNG</small>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="bio" className="form-label">
                        Mô tả (Bio)
                      </label>
                      <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        rows={4}
                        value={updateFormData.bio}
                        onChange={handleFormChange}
                        disabled={pendingRequest?.status === 'PENDING' || isSubmitting}
                        placeholder="Nhập mô tả về bản thân, kinh nghiệm, chuyên môn..."
                      />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowUpdateForm(false);
                          setFormErrors({});
                          // Reset form to current profile data
                          setUpdateFormData({
                            specialization: doctorProfile?.specialization || '',
                            experienceYears: doctorProfile?.experienceYears?.toString() || '',
                            licenseNumber: doctorProfile?.licenseNumber || '',
                            certificateFile: null,
                            bio: doctorProfile?.bio || '',
                          });
                        }}
                        disabled={isSubmitting}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={pendingRequest?.status === 'PENDING' || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-paper-plane me-2"></i>
                            Gửi yêu cầu duyệt
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-start border-primary border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Lịch khám hôm nay</h6>
                  <h3 className="mb-0 text-primary">{stats.todayAppointments}</h3>
                </div>
                <i className="fa fa-calendar-check fa-2x text-primary"></i>
              </div>
              <Link href="/doctor/outdoor-checkup" className="btn btn-sm btn-outline-primary mt-3 w-100">
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-start border-danger border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Ca cấp cứu</h6>
                  <h3 className="mb-0 text-danger">{stats.activeEmergencies}</h3>
                </div>
                <i className="fa fa-ambulance fa-2x text-danger"></i>
              </div>
              <Link href="/doctor/emergency" className="btn btn-sm btn-outline-danger mt-3 w-100">
                Xử lý ngay
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-start border-warning border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Xét nghiệm chờ kết quả</h6>
                  <h3 className="mb-0 text-warning">{stats.pendingLabResults}</h3>
                </div>
                <i className="fa fa-vial fa-2x text-warning"></i>
              </div>
              <Link href="/doctor/blood-testing" className="btn btn-sm btn-outline-warning mt-3 w-100">
                Xem kết quả
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-start border-info border-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Ca phẫu thuật sắp tới</h6>
                  <h3 className="mb-0 text-info">{stats.upcomingSurgeries}</h3>
                </div>
                <i className="fa fa-procedures fa-2x text-info"></i>
              </div>
              <Link href="/doctor/surgery" className="btn btn-sm btn-outline-info mt-3 w-100">
                Xem lịch
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">⏳ Lịch sắp tới hôm nay</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Bệnh nhân {item}</h6>
                      <small className="text-muted">08:00 - Khám ngoại trú</small>
                    </div>
                    <span className="badge bg-primary rounded-pill">Sắp tới</span>
                  </div>
                ))}
              </div>
              <Link href="/doctor/outdoor-checkup" className="btn btn-primary mt-3 w-100">
                Xem tất cả lịch khám
              </Link>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">🚨 Ca cấp cứu đang xử lý</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-danger mb-3">
                <h6 className="alert-heading">Ca cấp cứu #001</h6>
                <p className="mb-2">Bệnh nhân: Nguyễn Văn A</p>
                <p className="mb-2">Thời gian: 07:30</p>
                <small>Trạng thái: Đang xử lý</small>
              </div>
              <Link href="/doctor/emergency" className="btn btn-danger w-100">
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4 mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">Thao tác nhanh</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <Link href="/doctor/outdoor-checkup" className="btn btn-outline-primary w-100">
                    <i className="fa fa-stethoscope me-2"></i>
                    Khám bệnh
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link href="/doctor/pharmacy" className="btn btn-outline-success w-100">
                    <i className="fa fa-pills me-2"></i>
                    Kê đơn thuốc
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link href="/doctor/blood-testing" className="btn btn-outline-warning w-100">
                    <i className="fa fa-vial me-2"></i>
                    Yêu cầu xét nghiệm
                  </Link>
                </div>
                <div className="col-md-3">
                  <Link href="/doctor/schedule" className="btn btn-outline-info w-100">
                    <i className="fa fa-calendar-alt me-2"></i>
                    Quản lý lịch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

