'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { getUser, isAuthenticated } from '@/utils/auth';
import { getAmbulanceBookingManagement } from '@/generated/api/endpoints/ambulance-booking-management/ambulance-booking-management';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import LoginModal from '@/components/LoginModal';
import SignupModal from '@/components/SignupModal';

export default function AmbulancePage() {
  const router = useRouter();
  const [step, setStep] = useState<'pickup' | 'confirm' | 'tracking'>('pickup');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [pickupMapCenter, setPickupMapCenter] = useState<{ lat: number; lng: number }>({ lat: 21.0285, lng: 105.8542 }); // Default to Hanoi
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [ambulanceId, setAmbulanceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      const authenticated = isAuthenticated();
      setIsCheckingAuth(false);
      if (!authenticated) {
        setShowLoginModal(true);
      } else {
        loadClinics();
        // Auto-detect pickup location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              setPickupCoords({ lat, lng });
              setPickupLocation(`${lat}, ${lng}`);
              // Reverse geocoding
              fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                  if (data.display_name) {
                    setPickupAddress(data.display_name);
                  }
                })
                .catch(() => {});
            },
            () => {
              setPickupLocation('');
            }
          );
        }
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

  const handlePickupConfirm = () => {
    if (!pickupCoords) {
      setErrorMessage('Vui lòng chọn vị trí đón.');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedClinicId) {
      setErrorMessage('Vui lòng chọn phòng khám.');
      return;
    }

    if (!pickupCoords) {
      setErrorMessage('Vui lòng chọn vị trí đón.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const ambulanceApi = getAmbulanceBookingManagement();
      const user = getUser();

      const response = await ambulanceApi.createAmbulanceBooking({
        clinicId: selectedClinicId,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        pickupAddress: pickupAddress || undefined,
        patientName: user?.fullName || undefined,
        patientPhone: user?.phone || undefined,
        notes: '',
      });

      const booking = (response as any)?.data || response;
      if (booking && booking.id) {
        setAmbulanceId(booking.id);
        setBookingData(booking);
        setStep('tracking');
        // Start polling for updates
        startPolling(booking.id);
      } else {
        throw new Error('Failed to create ambulance booking');
      }
    } catch (error: any) {
      console.error('Error creating ambulance booking:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = useCallback((bookingId: number) => {
    const interval = setInterval(async () => {
      try {
        const ambulanceApi = getAmbulanceBookingManagement();
        const response = await ambulanceApi.getAmbulanceBookingById(bookingId);
        const booking = (response as any)?.data || response;
        setBookingData(booking);
        if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling booking status:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
              {step === 'pickup' && (
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">🚑 Pickup Location</h3>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      {/* Bản đồ */}
                      <div className="col-lg-8">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            <i className="fa fa-map me-2 text-primary"></i>
                            Select Pickup Location on Map
                          </label>
                          <div 
                            style={{ 
                              height: '500px', 
                              width: '100%', 
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '2px solid #0d6efd',
                              position: 'relative'
                            }}
                            className="position-relative"
                          >
                            <iframe
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(pickupCoords ? pickupCoords.lng : pickupMapCenter.lng) - 0.01},${(pickupCoords ? pickupCoords.lat : pickupMapCenter.lat) - 0.01},${(pickupCoords ? pickupCoords.lng : pickupMapCenter.lng) + 0.01},${(pickupCoords ? pickupCoords.lat : pickupMapCenter.lat) + 0.01}&layer=mapnik&marker=${pickupCoords ? `${pickupCoords.lat},${pickupCoords.lng}` : `${pickupMapCenter.lat},${pickupMapCenter.lng}`}`}
                              allowFullScreen
                            ></iframe>
                            
                            <div className="position-absolute top-0 start-0 p-2 bg-white rounded m-2 shadow-sm" style={{ zIndex: 10 }}>
                              <small className="text-muted d-flex align-items-center">
                                <i className="fa fa-info-circle me-1 text-primary"></i>
                                <span>Use controls below to set location</span>
                              </small>
                            </div>

                            {pickupCoords && (
                              <div 
                                className="position-absolute"
                                style={{
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  zIndex: 5,
                                  pointerEvents: 'none'
                                }}
                              >
                                <i className="fa fa-map-marker-alt text-primary" style={{ fontSize: '40px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}></i>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 d-flex gap-2 flex-wrap">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                      const lat = position.coords.latitude;
                                      const lng = position.coords.longitude;
                                      setPickupCoords({ lat, lng });
                                      setPickupMapCenter({ lat, lng });
                                      setPickupLocation(`${lat}, ${lng}`);
                                      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                                        .then(res => res.json())
                                        .then(data => {
                                          if (data.display_name) {
                                            setPickupAddress(data.display_name);
                                          }
                                        })
                                        .catch(() => {});
                                    }
                                  );
                                }
                              }}
                            >
                              <i className="fa fa-crosshairs me-1"></i>
                              Use My Current Location
                            </button>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${pickupCoords ? `${pickupCoords.lat},${pickupCoords.lng}` : `${pickupMapCenter.lat},${pickupMapCenter.lng}`}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fa fa-external-link-alt me-1"></i>
                              Open in Google Maps
                            </a>
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${pickupCoords ? pickupCoords.lat : pickupMapCenter.lat}&mlon=${pickupCoords ? pickupCoords.lng : pickupMapCenter.lng}&zoom=15`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <i className="fa fa-map me-1"></i>
                              Open in OpenStreetMap
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Form thông tin */}
                      <div className="col-lg-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            <i className="fa fa-search me-2 text-primary"></i>
                            Search Address
                          </label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              value={pickupAddress}
                              onChange={(e) => setPickupAddress(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  if (pickupAddress) {
                                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupAddress)}`)
                                      .then(res => res.json())
                                      .then(data => {
                                        if (data && data.length > 0) {
                                          const lat = parseFloat(data[0].lat);
                                          const lng = parseFloat(data[0].lon);
                                          setPickupCoords({ lat, lng });
                                          setPickupMapCenter({ lat, lng });
                                          setPickupLocation(`${lat}, ${lng}`);
                                        }
                                      })
                                      .catch(() => {});
                                  }
                                }
                              }}
                              placeholder="Enter address..."
                            />
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                if (pickupAddress) {
                                  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupAddress)}`)
                                    .then(res => res.json())
                                    .then(data => {
                                      if (data && data.length > 0) {
                                        const lat = parseFloat(data[0].lat);
                                        const lng = parseFloat(data[0].lon);
                                        setPickupCoords({ lat, lng });
                                        setPickupMapCenter({ lat, lng });
                                        setPickupLocation(`${lat}, ${lng}`);
                                      }
                                    })
                                    .catch(() => {});
                                }
                              }}
                            >
                              <i className="fa fa-search"></i>
                            </button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            <i className="fa fa-map-pin me-2 text-primary"></i>
                            Coordinates
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            placeholder="Latitude, Longitude"
                            readOnly
                          />
                          <small className="text-muted">
                            Auto-detected or selected from map
                          </small>
                        </div>

                        {pickupAddress && (
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              <i className="fa fa-location-arrow me-2 text-success"></i>
                              Address
                            </label>
                            <div className="alert alert-info mb-0">
                              <small>{pickupAddress}</small>
                            </div>
                          </div>
                        )}

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

                        {errorMessage && (
                          <div className="alert alert-danger mb-3" role="alert">
                            <i className="fa fa-exclamation-circle me-2"></i>
                            {errorMessage}
                          </div>
                        )}

                        <div className="d-grid gap-2 mt-4">
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={handlePickupConfirm}
                            disabled={!pickupLocation || !selectedClinicId}
                          >
                            <i className="fa fa-check-circle me-2"></i>
                            Confirm Pickup Location
                          </button>
                        </div>

                        <div className="mt-3 p-3 bg-light rounded">
                          <small className="text-muted">
                            <i className="fa fa-info-circle me-1"></i>
                            <strong>Tip:</strong> Search for an address or use your current location to set the pickup point accurately.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {step === 'confirm' && (
                <div className="card shadow">
                  <div className="card-header bg-success text-white">
                    <h3 className="mb-0">✅ Confirm Ambulance Request</h3>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-info">
                      <h5>Request Summary</h5>
                      <p><strong>Pickup Location:</strong> {pickupAddress || pickupLocation}</p>
                      {pickupCoords && (
                        <p><strong>Coordinates:</strong> {pickupCoords.lat}, {pickupCoords.lng}</p>
                      )}
                      {clinics.find(c => c.id === selectedClinicId) && (
                        <p><strong>Clinic:</strong> {clinics.find(c => c.id === selectedClinicId)?.name}</p>
                      )}
                      <p><strong>Estimated Time:</strong> 15-20 minutes</p>
                    </div>
                    {errorMessage && (
                      <div className="alert alert-danger mb-3" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {errorMessage}
                      </div>
                    )}
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
                            <i className="fa fa-check me-2"></i>Confirm Request
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setStep('pickup')}
                        disabled={isLoading}
                      >
                        <i className="fa fa-arrow-left me-2"></i>Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'tracking' && (
                <div className="card shadow">
                  <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">📊 Live Tracking</h3>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-success">
                      <strong>Booking ID:</strong> {ambulanceId}
                      {bookingData?.ambulanceLicensePlate && (
                        <>
                          <br />
                          <strong>Ambulance:</strong> {bookingData.ambulanceLicensePlate}
                        </>
                      )}
                      {bookingData?.status && (
                        <>
                          <br />
                          <strong>Status:</strong> {bookingData.status}
                        </>
                      )}
                      {bookingData?.estimatedTime && (
                        <>
                          <br />
                          <strong>Estimated Time:</strong> {bookingData.estimatedTime} minutes
                        </>
                      )}
                    </div>
                    <div className="timeline">
                      <div className="d-flex align-items-center mb-3">
                        <div className="badge bg-success rounded-circle p-3 me-3">
                          <i className="fa fa-check"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">Request Confirmed</h5>
                          <small className="text-muted">Your request has been received</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className={`badge rounded-circle p-3 me-3 ${
                          bookingData?.status === 'ASSIGNED' || bookingData?.status === 'IN_TRANSIT' 
                            ? 'bg-warning' 
                            : 'bg-secondary'
                        }`}>
                          <i className={`fa ${
                            bookingData?.status === 'ASSIGNED' || bookingData?.status === 'IN_TRANSIT'
                              ? 'fa-spinner fa-spin'
                              : 'fa-clock'
                          }`}></i>
                        </div>
                        <div>
                          <h5 className="mb-0">Ambulance On The Way</h5>
                          <small className="text-muted">
                            {bookingData?.estimatedTime 
                              ? `ETA: ${bookingData.estimatedTime} minutes`
                              : 'Waiting for assignment...'}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="badge bg-secondary rounded-circle p-3 me-3">
                          <i className="fa fa-clock"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">Arrived at Pickup</h5>
                          <small className="text-muted">Waiting...</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="badge bg-secondary rounded-circle p-3 me-3">
                          <i className="fa fa-clock"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">En Route to Destination</h5>
                          <small className="text-muted">Waiting...</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="badge bg-secondary rounded-circle p-3 me-3">
                          <i className="fa fa-clock"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">Arrived at Destination</h5>
                          <small className="text-muted">Waiting...</small>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6>Map View</h6>
                          <div className="bg-secondary text-white text-center p-5 rounded">
                            <i className="fa fa-map fa-3x mb-3"></i>
                            <p>Live map tracking will be displayed here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => router.push('/dashboard')}
                        >
                          Go to Dashboard
                        </button>
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => {
                            setStep('pickup');
                            setPickupLocation('');
                            setPickupCoords(null);
                            setPickupAddress('');
                            setAmbulanceId(null);
                            setBookingData(null);
                            setSelectedClinicId(null);
                            setErrorMessage('');
                          }}
                        >
                          New Request
                        </button>
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

