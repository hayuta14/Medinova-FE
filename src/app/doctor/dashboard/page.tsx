'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getUser } from '@/utils/auth';
import { getDoctorManagement } from '@/generated/api/endpoints/doctor-management/doctor-management';
import { getDashboard } from '@/generated/api/endpoints/dashboard/dashboard';
import { getAppointmentManagement } from '@/generated/api/endpoints/appointment-management/appointment-management';
import { getEmergencyManagement } from '@/generated/api/endpoints/emergency-management/emergency-management';

// Danh sách chuyên khoa (Department enum)
const DEPARTMENT_LIST = [
  { value: 'GENERAL_MEDICINE', label: 'Nội tổng quát', icon: 'fa-stethoscope', color: 'primary' },
  { value: 'PEDIATRICS', label: 'Nhi', icon: 'fa-child', color: 'info' },
  { value: 'OBSTETRICS_GYNECOLOGY', label: 'Sản – Phụ', icon: 'fa-female', color: 'danger' },
  { value: 'SURGERY', label: 'Ngoại tổng quát', icon: 'fa-cut', color: 'warning' },
  { value: 'CARDIOLOGY', label: 'Tim mạch', icon: 'fa-heartbeat', color: 'danger' },
  { value: 'NEUROLOGY', label: 'Thần kinh', icon: 'fa-brain', color: 'primary' },
  { value: 'ORTHOPEDICS', label: 'Chấn thương chỉnh hình', icon: 'fa-bone', color: 'secondary' },
  { value: 'ONCOLOGY', label: 'Ung bướu', icon: 'fa-ribbon', color: 'warning' },
  { value: 'GASTROENTEROLOGY', label: 'Tiêu hóa', icon: 'fa-stomach', color: 'success' },
  { value: 'RESPIRATORY', label: 'Hô hấp', icon: 'fa-lungs', color: 'info' },
  { value: 'NEPHROLOGY', label: 'Thận', icon: 'fa-kidneys', color: 'primary' },
  { value: 'ENDOCRINOLOGY', label: 'Nội tiết', icon: 'fa-flask', color: 'success' },
  { value: 'HEMATOLOGY', label: 'Huyết học', icon: 'fa-tint', color: 'danger' },
  { value: 'RHEUMATOLOGY', label: 'Cơ xương khớp', icon: 'fa-dumbbell', color: 'secondary' },
  { value: 'DERMATOLOGY', label: 'Da liễu', icon: 'fa-hand-sparkles', color: 'warning' },
  { value: 'INFECTIOUS_DISEASE', label: 'Truyền nhiễm', icon: 'fa-virus', color: 'danger' },
];

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [activeEmergencies, setActiveEmergencies] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingEmergencies, setIsLoadingEmergencies] = useState(true);

  const [updateFormData, setUpdateFormData] = useState({
    department: '',
    experienceYears: '',
    licenseNumber: '',
    certificateFile: null as File | null,
    bio: '',
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    if (userData) {
      loadDoctorProfile();
      checkPendingRequests();
      loadDashboardStats();
      loadTodayAppointments();
      loadActiveEmergencies();
    }
  }, []);

  const loadDashboardStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const dashboardApi = getDashboard();
      const response = await dashboardApi.getDoctorDashboardStats();
      const statsData = (response as any)?.data || response;
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const loadTodayAppointments = useCallback(async () => {
    try {
      setIsLoadingAppointments(true);
      const appointmentApi = getAppointmentManagement();
      const response = await appointmentApi.getTodayAppointments();
      const data = (response as any)?.data || response;
      setTodayAppointments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading today appointments:', error);
      setTodayAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, []);

  const loadActiveEmergencies = useCallback(async () => {
    try {
      setIsLoadingEmergencies(true);
      const emergencyApi = getEmergencyManagement();
      const response = await emergencyApi.getMyEmergencies('PENDING');
      const data = (response as any)?.data || response;
      const allEmergencies = Array.isArray(data) ? data : [];
      // Filter active emergencies (not completed or cancelled)
      const active = allEmergencies.filter((e: any) => 
        e.status !== 'COMPLETED' && e.status !== 'CANCELLED'
      );
      setActiveEmergencies(active);
    } catch (error: any) {
      console.error('Error loading active emergencies:', error);
      setActiveEmergencies([]);
    } finally {
      setIsLoadingEmergencies(false);
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
        // Kiểm tra xem có avatar trong localStorage không (từ lần upload trước)
        const userData = getUser();
        // Ưu tiên lấy từ doctor_avatar key, nếu không có thì lấy từ user.avatar
        const savedAvatar = (typeof window !== 'undefined' && localStorage.getItem('doctor_avatar')) 
          || userData?.avatar 
          || null;
        
        // Merge avatar từ localStorage vào doctor profile nếu có
        if (savedAvatar) {
          currentDoctor = {
            ...currentDoctor,
            user: {
              ...currentDoctor.user,
              avatar: savedAvatar
            },
            avatar: savedAvatar
          };
        }
        
        setDoctorProfile(currentDoctor);
        
        // Set avatar preview nếu có
        if (savedAvatar) {
          setAvatarPreview(savedAvatar);
        }
        
        // Pre-fill form với dữ liệu hiện tại
        setUpdateFormData({
          department: currentDoctor.department || currentDoctor.specialization || '',
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Auto upload
      handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploadingAvatar(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('avatar', file);
      
      // TODO: Call API to upload avatar
      // const doctorApi = getDoctorManagement();
      // const response = await doctorApi.uploadAvatar(doctorProfile.id, formData);
      
      // For now, update local state immediately
      // In production, this should be replaced with actual API call
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarUrl = reader.result as string;
        
        // Update doctor profile state
        setDoctorProfile((prev: any) => ({
          ...prev,
          user: {
            ...prev?.user,
            avatar: avatarUrl
          },
          avatar: avatarUrl
        }));
        
        // Update user in localStorage
        const userData = getUser();
        if (userData) {
          const updatedUser = {
            ...userData,
            avatar: avatarUrl
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Lưu avatar riêng vào localStorage để đảm bảo không bị mất
          if (typeof window !== 'undefined') {
            localStorage.setItem('doctor_avatar', avatarUrl);
          }
          
          setUser(updatedUser);
          
          // Dispatch event to notify other components (like Navbar)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('avatar-updated'));
            window.dispatchEvent(new Event('auth-change'));
          }
        }
        
        alert('Cập nhật ảnh đại diện thành công!');
      };
      reader.readAsDataURL(file);
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert('Có lỗi xảy ra khi cập nhật ảnh đại diện. Vui lòng thử lại!');
      setAvatarFile(null);
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: any = {};
    
    if (!updateFormData.department) {
      errors.department = 'Chuyên khoa là bắt buộc';
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
      
      if (!doctorProfile?.id) {
        alert('Không tìm thấy thông tin bác sĩ. Vui lòng thử lại!');
        return;
      }

      // Call API to update doctor profile
      const doctorApi = getDoctorManagement();
      
      const updateRequest: any = {
        department: updateFormData.department,
        experienceYears: parseInt(updateFormData.experienceYears) || 0,
        bio: updateFormData.bio || '',
      };

      // Update doctor profile
      const updatedDoctor = await doctorApi.updateDoctor(doctorProfile.id, updateRequest);
      
      // Reload doctor profile to get updated data
      await loadDoctorProfile();
      
      setShowUpdateForm(false);
      alert('Cập nhật thông tin thành công!');
      
      // Reset form
      setUpdateFormData({
        department: updatedDoctor.department || doctorProfile?.department || '',
        experienceYears: updatedDoctor.experienceYears?.toString() || doctorProfile?.experienceYears?.toString() || '',
        licenseNumber: doctorProfile?.licenseNumber || '',
        certificateFile: null,
        bio: updatedDoctor.bio || doctorProfile?.bio || '',
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
            👨‍⚕️ {user?.fullName || 'Bác sĩ'} - {doctorProfile?.departmentDisplayName || 
              DEPARTMENT_LIST.find(d => d.value === doctorProfile?.department)?.label || 
              doctorProfile?.department || 
              doctorProfile?.specialization || 
              'Chuyên khoa'}
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
                        <div className="mb-3 position-relative d-inline-block">
                          {avatarPreview || doctorProfile?.user?.avatar || doctorProfile?.avatar ? (
                            <img 
                              src={avatarPreview || doctorProfile.user?.avatar || doctorProfile.avatar} 
                              alt="Ảnh đại diện" 
                              className="img-fluid rounded-circle"
                              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                              style={{ width: '150px', height: '150px' }}
                            >
                              <i className="fa fa-user fa-4x text-white"></i>
                            </div>
                          )}
                          {/* Upload button overlay */}
                          <div className="position-absolute bottom-0 end-0">
                            <label 
                              className="btn btn-primary btn-sm rounded-circle"
                              style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                              title="Đổi ảnh đại diện"
                            >
                              <i className="fa fa-camera"></i>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                                disabled={isUploadingAvatar}
                              />
                            </label>
                          </div>
                          {isUploadingAvatar && (
                            <div className="position-absolute top-50 start-50 translate-middle">
                              <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                              </div>
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
                        <small className="text-muted d-block mt-2">
                          <i className="fa fa-info-circle me-1"></i>
                          Click icon camera để đổi ảnh
                        </small>
                      </div>
                      <div className="col-md-9">
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="text-muted small">Họ tên</label>
                            <p className="fw-bold mb-0">{doctorProfile?.user?.fullName || user?.fullName || 'N/A'}</p>
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small">Chuyên khoa</label>
                            <p className="fw-bold mb-0">
                              {doctorProfile?.departmentDisplayName || 
                               DEPARTMENT_LIST.find(d => d.value === doctorProfile?.department)?.label || 
                               doctorProfile?.department || 
                               doctorProfile?.specialization || 
                               'N/A'}
                            </p>
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
                    <strong>Lưu ý:</strong> Bạn có thể cập nhật thông tin chuyên khoa, kinh nghiệm và mô tả. Thay đổi sẽ được áp dụng ngay lập tức.
                  </div>
                  
                  <form onSubmit={handleSubmitUpdateRequest}>
                    <div className="row">
                      <div className="col-12 mb-4">
                        <label className="form-label">
                          Chuyên khoa <span className="text-danger">*</span>
                        </label>
                        {formErrors.department && (
                          <div className="text-danger small mb-2">
                            <i className="fa fa-exclamation-circle me-1"></i>
                            {formErrors.department}
                          </div>
                        )}
                        <div className="row g-3">
                          {DEPARTMENT_LIST.map((dept) => {
                            const isSelected = updateFormData.department === dept.value;
                            return (
                              <div key={dept.value} className="col-md-6 col-lg-4">
                                <button
                                  type="button"
                                  className={`btn w-100 p-3 text-start h-100 border-2 ${
                                    isSelected
                                      ? `btn-${dept.color} border-${dept.color} shadow`
                                      : 'btn-outline-light border-light'
                                  }`}
                                  onClick={() => {
                                    if (!pendingRequest?.status && !isSubmitting) {
                                      setUpdateFormData(prev => ({ ...prev, department: dept.value }));
                                      // Clear error
                                      if (formErrors.department) {
                                        setFormErrors((prev: any) => {
                                          const newErrors = { ...prev };
                                          delete newErrors.department;
                                          return newErrors;
                                        });
                                      }
                                    }
                                  }}
                                  disabled={pendingRequest?.status === 'PENDING' || isSubmitting}
                                  style={{
                                    transition: 'all 0.3s ease',
                                    borderRadius: '12px',
                                    backgroundColor: isSelected ? undefined : 'white'
                                  }}
                                >
                                  <div className="d-flex align-items-center">
                                    <i className={`fa ${dept.icon} fa-2x me-3 ${
                                      isSelected ? 'text-white' : `text-${dept.color}`
                                    }`}></i>
                                    <div className="flex-grow-1">
                                      <h6 className={`mb-0 ${isSelected ? 'text-white' : ''}`}>
                                        {dept.label}
                                      </h6>
                                      {isSelected && (
                                        <small className="text-white-50">
                                          <i className="fa fa-check-circle me-1"></i>
                                          Đã chọn
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        {!updateFormData.department && (
                          <small className="text-muted d-block mt-2">
                            <i className="fa fa-info-circle me-1"></i>
                            Vui lòng chọn một chuyên khoa
                          </small>
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
                            department: doctorProfile?.department || doctorProfile?.specialization || '',
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
                  <h3 className="mb-0 text-primary">
                    {isLoadingStats ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      stats?.todayAppointments || 0
                    )}
                  </h3>
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
                  <h3 className="mb-0 text-danger">
                    {isLoadingStats ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      stats?.activeEmergencies || 0
                    )}
                  </h3>
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
                  <h6 className="text-muted mb-2">Tổng lịch hẹn</h6>
                  <h3 className="mb-0 text-warning">
                    {isLoadingStats ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      stats?.totalAppointments || 0
                    )}
                  </h3>
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
                  <h6 className="text-muted mb-2">Lịch hẹn sắp tới</h6>
                  <h3 className="mb-0 text-info">
                    {isLoadingStats ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      stats?.upcomingAppointments || 0
                    )}
                  </h3>
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
              {isLoadingAppointments ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fa fa-calendar-times fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Không có lịch hẹn nào hôm nay</p>
                </div>
              ) : (
                <>
                  <div className="list-group list-group-flush">
                    {todayAppointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{apt.patientName || `Patient #${apt.patientId}`}</h6>
                          <small className="text-muted">
                            {apt.appointmentTime
                              ? new Date(apt.appointmentTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}{' '}
                            - {apt.clinicName || 'Clinic'}
                          </small>
                        </div>
                        <span className={`badge rounded-pill ${
                          apt.status === 'CONFIRMED' ? 'bg-primary' :
                          apt.status === 'PENDING' ? 'bg-warning' :
                          apt.status === 'COMPLETED' ? 'bg-success' :
                          'bg-secondary'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href="/doctor/outdoor-checkup" className="btn btn-primary mt-3 w-100">
                    Xem tất cả lịch khám
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">🚨 Ca cấp cứu đang xử lý</h5>
            </div>
            <div className="card-body">
              {isLoadingEmergencies ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : activeEmergencies.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fa fa-ambulance fa-3x text-muted mb-3"></i>
                  <p className="text-muted">Không có ca cấp cứu đang xử lý</p>
                </div>
              ) : (
                <>
                  {activeEmergencies.slice(0, 3).map((emergency) => (
                    <div key={emergency.id} className="alert alert-danger mb-3">
                      <h6 className="alert-heading">Ca cấp cứu #{emergency.id}</h6>
                      <p className="mb-2">
                        <strong>Bệnh nhân:</strong> {emergency.patientName || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Thời gian:</strong>{' '}
                        {emergency.createdAt
                          ? new Date(emergency.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Ưu tiên:</strong>{' '}
                        <span className={`badge ${
                          emergency.priority === 'CRITICAL' ? 'bg-danger' :
                          emergency.priority === 'HIGH' ? 'bg-warning' :
                          'bg-info'
                        }`}>
                          {emergency.priority || 'MEDIUM'}
                        </span>
                      </p>
                      <small>
                        <strong>Trạng thái:</strong>{' '}
                        <span className={`badge ${
                          emergency.status === 'PENDING' ? 'bg-warning' :
                          emergency.status === 'DISPATCHED' ? 'bg-primary' :
                          emergency.status === 'IN_TRANSIT' ? 'bg-info' :
                          'bg-secondary'
                        }`}>
                          {emergency.status}
                        </span>
                      </small>
                    </div>
                  ))}
                  <Link href="/doctor/emergency" className="btn btn-danger w-100">
                    Xem tất cả ca cấp cứu
                  </Link>
                </>
              )}
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

