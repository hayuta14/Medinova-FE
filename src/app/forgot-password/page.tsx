'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'verify' | 'code' | 'reset' | 'success'>('verify');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // TODO: Gọi API để gửi mã xác thực
        // const authApi = getAuthentication();
        // await authApi.sendVerificationCode({ email, phone });
        
        // Tạm thời simulate việc gửi mã thành công
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert('Mã xác thực đã được gửi đến email và số điện thoại của bạn!');
        setStep('code');
        setCountdown(60); // 60 giây countdown
        
        // Start countdown
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Có lỗi xảy ra. Vui lòng thử lại!';
        setErrors({ email: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!verificationCode) {
      newErrors.code = 'Mã xác thực là bắt buộc';
    } else if (verificationCode.length !== 6) {
      newErrors.code = 'Mã xác thực phải có 6 chữ số';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // TODO: Gọi API để xác thực mã
        // const authApi = getAuthentication();
        // await authApi.verifyCode({ email, phone, code: verificationCode });
        
        // Tạm thời simulate việc xác thực thành công (mã mặc định: 123456)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (verificationCode === '123456') {
          setStep('reset');
        } else {
          setErrors({ code: 'Mã xác thực không đúng. Vui lòng thử lại!' });
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Mã xác thực không đúng. Vui lòng thử lại!';
        setErrors({ code: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // TODO: Gọi API để đặt lại mật khẩu
        // const authApi = getAuthentication();
        // await authApi.resetPassword({ email, phone, code: verificationCode, newPassword });
        
        // Tạm thời simulate việc đặt lại mật khẩu thành công
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStep('success');
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại!';
        setErrors({ newPassword: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      // TODO: Gọi API để gửi lại mã
      // const authApi = getAuthentication();
      // await authApi.sendVerificationCode({ email, phone });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Mã xác thực mới đã được gửi!');
      setCountdown(60);
      setVerificationCode('');
      
      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      alert('Có lỗi xảy ra khi gửi lại mã. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Topbar />
      <Navbar />
      <div className="container-fluid py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="card shadow">
                <div className="card-body p-5">
                  <h2 className="text-center mb-4">Quên Mật Khẩu</h2>
                  
                  {/* Progress Steps */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-center flex-fill">
                        <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                          step === 'verify' ? 'bg-primary text-white' : step === 'code' || step === 'reset' || step === 'success' ? 'bg-success text-white' : 'bg-secondary text-white'
                        }`} style={{ width: '30px', height: '30px' }}>
                          1
                        </div>
                        <div className="mt-2 small">Xác thực</div>
                      </div>
                      <div className="flex-fill text-center">
                        <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                          step === 'code' ? 'bg-primary text-white' : step === 'reset' || step === 'success' ? 'bg-success text-white' : 'bg-secondary text-white'
                        }`} style={{ width: '30px', height: '30px' }}>
                          2
                        </div>
                        <div className="mt-2 small">Mã xác thực</div>
                      </div>
                      <div className="text-center flex-fill">
                        <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                          step === 'reset' ? 'bg-primary text-white' : step === 'success' ? 'bg-success text-white' : 'bg-secondary text-white'
                        }`} style={{ width: '30px', height: '30px' }}>
                          3
                        </div>
                        <div className="mt-2 small">Đặt lại</div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Verify Email and Phone */}
                  {step === 'verify' && (
                    <form onSubmit={handleSendCode}>
                      <p className="text-muted mb-4 text-center">
                        Vui lòng nhập email và số điện thoại đã đăng ký để nhận mã xác thực
                      </p>
                      
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Nhập email của bạn"
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">
                          Số Điện Thoại <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Nhập số điện thoại (10-11 chữ số)"
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      </div>

                      <div className="d-grid gap-2 mb-3">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                          {isLoading ? 'Đang gửi...' : 'Gửi Mã Xác Thực'}
                        </button>
                      </div>
                      
                      <div className="text-center">
                        <Link href="/login" className="text-primary text-decoration-none">
                          <i className="fa fa-arrow-left me-2"></i>Quay lại đăng nhập
                        </Link>
                      </div>
                    </form>
                  )}

                  {/* Step 2: Enter Verification Code */}
                  {step === 'code' && (
                    <form onSubmit={handleVerifyCode}>
                      <p className="text-muted mb-4 text-center">
                        Mã xác thực đã được gửi đến email và số điện thoại của bạn. Vui lòng nhập mã để tiếp tục.
                      </p>
                      
                      <div className="mb-3">
                        <label htmlFor="verificationCode" className="form-label">
                          Mã Xác Thực <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control text-center ${errors.code ? 'is-invalid' : ''}`}
                          id="verificationCode"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Nhập mã 6 chữ số"
                          maxLength={6}
                          style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 'bold' }}
                        />
                        {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                        <small className="text-muted d-block mt-2 text-center">
                          Mã mặc định để test: <strong>123456</strong>
                        </small>
                      </div>

                      <div className="d-grid gap-2 mb-3">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                          {isLoading ? 'Đang xác thực...' : 'Xác Thực Mã'}
                        </button>
                      </div>

                      <div className="text-center mb-3">
                        {countdown > 0 ? (
                          <span className="text-muted">
                            Gửi lại mã sau {countdown} giây
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-link p-0 text-primary"
                            onClick={handleResendCode}
                            disabled={isLoading}
                          >
                            Gửi lại mã xác thực
                          </button>
                        )}
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-muted"
                          onClick={() => setStep('verify')}
                        >
                          <i className="fa fa-arrow-left me-2"></i>Quay lại
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Reset Password */}
                  {step === 'reset' && (
                    <form onSubmit={handleResetPassword}>
                      <p className="text-muted mb-4 text-center">
                        Vui lòng nhập mật khẩu mới của bạn
                      </p>
                      
                      <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">
                          Mật Khẩu Mới <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        />
                        {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                          Xác Nhận Mật Khẩu <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                      </div>

                      <div className="d-grid gap-2 mb-3">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                          {isLoading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-muted"
                          onClick={() => setStep('code')}
                        >
                          <i className="fa fa-arrow-left me-2"></i>Quay lại
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 4: Success */}
                  {step === 'success' && (
                    <div className="text-center">
                      <div className="mb-4">
                        <i className="fa fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <h4 className="text-success mb-3">Đặt Lại Mật Khẩu Thành Công!</h4>
                      <p className="text-muted mb-4">
                        Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.
                      </p>
                      <div className="d-grid gap-2">
                        <Link href="/login" className="btn btn-primary">
                          Đăng Nhập Ngay
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  );
}

