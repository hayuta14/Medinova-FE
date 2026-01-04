'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { getEmergencyManagement } from '@/generated/api/endpoints/emergency-management/emergency-management';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';
import { getUser } from '@/utils/auth';
import type { EmergencyResponse } from '@/generated/api/models';
import type { CreateEmergencyRequestPriority } from '@/generated/api/models';

export default function EmergencyPage() {
  const [step, setStep] = useState<'initial' | 'location' | 'symptoms' | 'confirm' | 'status'>('initial');
  const [location, setLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 21.0285, lng: 105.8542 }); // Default to Hanoi
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [emergencyId, setEmergencyId] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [emergencyData, setEmergencyData] = useState<EmergencyResponse | null>(null);
  const [isLoadingEmergency, setIsLoadingEmergency] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);

  const symptoms = [
    'Chest Pain',
    'Difficulty Breathing',
    'Severe Bleeding',
    'Unconscious',
    'Severe Pain',
    'Accident',
    'Other',
  ];

  // Load clinics on mount
  useEffect(() => {
    loadClinics();
  }, []);

  // Load clinics
  const loadClinics = useCallback(async () => {
    try {
      setIsLoadingClinics(true);
      const clinicApi = getClinicManagement();
      const response = await clinicApi.getAllClinics();
      const clinicsData = Array.isArray(response) ? response : [];
      setClinics(clinicsData);
    } catch (error) {
      console.error('Error loading clinics:', error);
      setClinics([]);
    } finally {
      setIsLoadingClinics(false);
    }
  }, []);


  // Load emergency data when emergencyId is available
  useEffect(() => {
    if (emergencyId && step === 'status') {
      loadEmergencyData(emergencyId);
      // Poll for updates every 5 seconds
      const interval = setInterval(() => {
        loadEmergencyData(emergencyId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [emergencyId, step]);

  // Load emergency data by ID
  const loadEmergencyData = useCallback(async (id: number) => {
    try {
      setIsLoadingEmergency(true);
      const emergencyApi = getEmergencyManagement();
      const response = await emergencyApi.getEmergencyById(id);
      const emergency = (response as any)?.data || response;
      setEmergencyData(emergency);
    } catch (error) {
      console.error('Error loading emergency data:', error);
    } finally {
      setIsLoadingEmergency(false);
    }
  }, []);

  useEffect(() => {
    // Auto-detect location
    if (step === 'location' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ lat, lng });
          setMapCenter({ lat, lng });
          setLocation(`${lat}, ${lng}`);
          // Reverse geocoding to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (data.display_name) {
                setAddress(data.display_name);
              }
            })
            .catch(() => {});
        },
        () => {
          setLocation('Location not available');
        }
      );
    }
  }, [step]);

  const handleMapClick = (e: any) => {
    if (e.latlng) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setCoordinates({ lat, lng });
      setLocation(`${lat}, ${lng}`);
      // Reverse geocoding
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            setAddress(data.display_name);
          }
        })
        .catch(() => {});
    }
  };

  const handleSearchAddress = () => {
    if (address) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setCoordinates({ lat, lng });
            setMapCenter({ lat, lng });
            setLocation(`${lat}, ${lng}`);
          }
        })
        .catch(() => {});
    }
  };

  const handleGetHelp = () => {
    setStep('location');
  };

  const handleLocationConfirm = () => {
    setStep('symptoms');
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Determine priority based on selected symptoms
  const getPriority = (): CreateEmergencyRequestPriority => {
    const criticalSymptoms = ['Chest Pain', 'Difficulty Breathing', 'Unconscious', 'Severe Bleeding'];
    const highSymptoms = ['Severe Pain', 'Accident'];
    
    if (selectedSymptoms.some(s => criticalSymptoms.includes(s))) {
      return 'CRITICAL';
    } else if (selectedSymptoms.some(s => highSymptoms.includes(s))) {
      return 'HIGH';
    } else if (selectedSymptoms.length > 0) {
      return 'MEDIUM';
    }
    return 'LOW';
  };

  const handleConfirm = async () => {
    // Validate required fields
    if (!coordinates) {
      setErrorMessage('Vui lòng chọn vị trí của bạn.');
      return;
    }

    if (selectedSymptoms.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một triệu chứng.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      // Get user info
      const user = getUser();
      const description = selectedSymptoms.join(', ');

      // Create emergency request
      // If clinicId is selected, use it; otherwise API will automatically find nearest clinic
      const emergencyApi = getEmergencyManagement();
      const requestBody: any = {
        patientLat: coordinates.lat,
        patientLng: coordinates.lng,
        patientAddress: address || undefined,
        patientName: user?.fullName || user?.name || undefined,
        patientPhone: user?.phone || undefined,
        description: description || undefined,
        priority: getPriority(),
      };

      // Add clinicId only if selected (optional - API will auto-select if not provided)
      if (selectedClinicId) {
        requestBody.clinicId = selectedClinicId;
      }

      const response = await emergencyApi.createEmergency(requestBody);

      // Handle response
      const emergency = (response as any)?.data || response;
      
      if (emergency && emergency.id) {
        setEmergencyId(emergency.id);
        setEmergencyData(emergency);
        setStep('status');
      } else {
        throw new Error('Failed to create emergency request: No emergency ID returned');
      }
    } catch (error: any) {
      console.error('Error creating emergency request:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo yêu cầu cấp cứu. Vui lòng thử lại.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Topbar />
      <Navbar />

      <div className="container-fluid py-5" style={{ minHeight: '80vh' }}>
        <div className="container">
          {step === 'initial' && (
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="card shadow-lg border-danger border-4">
                  <div className="card-body p-5">
                    <i className="fa fa-ambulance fa-5x text-danger mb-4"></i>
                    <h1 className="display-4 text-danger mb-4">🚨 I NEED HELP NOW</h1>
                    <p className="lead mb-4">
                      Emergency medical assistance is available 24/7. Click the button below to request immediate help.
                    </p>
                    <button
                      className="btn btn-danger btn-lg px-5 py-3"
                      onClick={handleGetHelp}
                      style={{ fontSize: '1.5rem' }}
                    >
                      <i className="fa fa-phone me-2"></i>
                      REQUEST EMERGENCY HELP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'location' && (
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="card shadow">
                  <div className="card-header bg-danger text-white">
                    <h3 className="mb-0">
                      <i className="fa fa-map-marker-alt me-2"></i>
                      Your Location
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      {/* Bản đồ */}
                      <div className="col-lg-8">
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            <i className="fa fa-map me-2 text-danger"></i>
                            Select Location on Map
                          </label>
                          <div 
                            style={{ 
                              height: '500px', 
                              width: '100%', 
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '2px solid #dc3545',
                              position: 'relative'
                            }}
                            className="position-relative"
                          >
                            {/* OpenStreetMap với Leaflet-like interface */}
                            <iframe
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(coordinates ? coordinates.lng : mapCenter.lng) - 0.01},${(coordinates ? coordinates.lat : mapCenter.lat) - 0.01},${(coordinates ? coordinates.lng : mapCenter.lng) + 0.01},${(coordinates ? coordinates.lat : mapCenter.lat) + 0.01}&layer=mapnik&marker=${coordinates ? `${coordinates.lat},${coordinates.lng}` : `${mapCenter.lat},${mapCenter.lng}`}`}
                              allowFullScreen
                            ></iframe>
                            
                            {/* Overlay với instructions */}
                            <div className="position-absolute top-0 start-0 p-2 bg-white rounded m-2 shadow-sm" style={{ zIndex: 10 }}>
                              <small className="text-muted d-flex align-items-center">
                                <i className="fa fa-info-circle me-1 text-primary"></i>
                                <span>Use controls below to set location</span>
                              </small>
                            </div>

                            {/* Marker indicator */}
                            {coordinates && (
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
                                <i className="fa fa-map-marker-alt text-danger" style={{ fontSize: '40px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}></i>
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
                                      setCoordinates({ lat, lng });
                                      setMapCenter({ lat, lng });
                                      setLocation(`${lat}, ${lng}`);
                                      // Reverse geocoding
                                      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                                        .then(res => res.json())
                                        .then(data => {
                                          if (data.display_name) {
                                            setAddress(data.display_name);
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
                              href={`https://www.google.com/maps/search/?api=1&query=${coordinates ? `${coordinates.lat},${coordinates.lng}` : `${mapCenter.lat},${mapCenter.lng}`}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-danger"
                            >
                              <i className="fa fa-external-link-alt me-1"></i>
                              Open in Google Maps
                            </a>
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${coordinates ? coordinates.lat : mapCenter.lat}&mlon=${coordinates ? coordinates.lng : mapCenter.lng}&zoom=15`}
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
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSearchAddress();
                                }
                              }}
                              placeholder="Enter address..."
                            />
                            <button
                              className="btn btn-primary"
                              onClick={handleSearchAddress}
                            >
                              <i className="fa fa-search"></i>
                            </button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            <i className="fa fa-map-pin me-2 text-danger"></i>
                            Coordinates
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Latitude, Longitude"
                            readOnly
                          />
                          <small className="text-muted">
                            Auto-detected or selected from map
                          </small>
                        </div>

                        {address && (
                          <div className="mb-3">
                            <label className="form-label fw-bold">
                              <i className="fa fa-location-arrow me-2 text-success"></i>
                              Address
                            </label>
                            <div className="alert alert-info mb-0">
                              <small>{address}</small>
                            </div>
                          </div>
                        )}

                        <div className="d-grid gap-2 mt-4">
                          <button
                            className="btn btn-danger btn-lg"
                            onClick={handleLocationConfirm}
                            disabled={!location || location === 'Location not available'}
                          >
                            <i className="fa fa-check-circle me-2"></i>
                            Confirm Location
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setStep('initial')}
                          >
                            <i className="fa fa-arrow-left me-2"></i>
                            Back
                          </button>
                        </div>

                        <div className="mt-3 p-3 bg-light rounded">
                          <small className="text-muted">
                            <i className="fa fa-info-circle me-1"></i>
                            <strong>Tip:</strong> Click on the map or search for an address to set your emergency location accurately.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'symptoms' && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card shadow">
                  <div className="card-header bg-danger text-white">
                    <h3 className="mb-0">⚡ Quick Symptom Select</h3>
                  </div>
                  <div className="card-body">
                    {errorMessage && (
                      <div className="alert alert-danger" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {errorMessage}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        <i className="fa fa-hospital me-2 text-primary"></i>
                        Chọn phòng khám (Tùy chọn)
                      </label>
                      {isLoadingClinics ? (
                        <div className="text-center py-2">
                          <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                          <small className="ms-2 text-muted">Đang tải danh sách phòng khám...</small>
                        </div>
                      ) : (
                        <>
                          <select
                            className="form-select form-select-lg"
                            value={selectedClinicId || ''}
                            onChange={(e) => setSelectedClinicId(e.target.value ? Number(e.target.value) : null)}
                          >
                            <option value="">-- Tự động chọn phòng khám gần nhất --</option>
                            {clinics.map((clinic) => (
                              <option key={clinic.id} value={clinic.id}>
                                {clinic.name || `Clinic ${clinic.id}`}
                                {clinic.address && ` - ${clinic.address}`}
                              </option>
                            ))}
                          </select>
                          <small className="text-muted">
                            Nếu không chọn, hệ thống sẽ tự động chọn phòng khám gần nhất dựa trên vị trí của bạn.
                          </small>
                        </>
                      )}
                    </div>

                    <p className="mb-4">Select all that apply:</p>
                    <div className="row g-3">
                      {symptoms.map((symptom) => (
                        <div key={symptom} className="col-md-6">
                          <button
                            className={`btn w-100 py-3 ${
                              selectedSymptoms.includes(symptom)
                                ? 'btn-danger'
                                : 'btn-outline-danger'
                            }`}
                            onClick={() => handleSymptomToggle(symptom)}
                            style={{ fontSize: '1.1rem' }}
                          >
                            {selectedSymptoms.includes(symptom) && (
                              <i className="fa fa-check-circle me-2"></i>
                            )}
                            {symptom}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 d-grid gap-2">
                      <button
                        className="btn btn-danger btn-lg"
                        onClick={handleConfirm}
                        disabled={selectedSymptoms.length === 0 || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-paper-plane me-2"></i>
                            Send Emergency Request
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setStep('location')}
                        disabled={isLoading}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="card shadow">
                  <div className="card-body text-center p-5">
                    <i className="fa fa-check-circle fa-5x text-success mb-4"></i>
                    <h2 className="mb-4">Request Submitted</h2>
                    <p className="lead">Your emergency request has been received. Help is on the way!</p>
                    <button
                      className="btn btn-primary btn-lg mt-4"
                      onClick={() => setStep('status')}
                    >
                      View Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'status' && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card shadow">
                  <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">📊 Live Status</h3>
                    {isLoadingEmergency && (
                      <span className="spinner-border spinner-border-sm text-white" role="status"></span>
                    )}
                  </div>
                  <div className="card-body">
                    {emergencyData ? (
                      <>
                        <div className="alert alert-info">
                          <strong>Emergency ID:</strong> {emergencyData.id || emergencyId}
                          {emergencyData.clinicName && (
                            <>
                              <br />
                              <strong>Clinic:</strong> {emergencyData.clinicName}
                            </>
                          )}
                          {emergencyData.status && (
                            <>
                              <br />
                              <strong>Status:</strong>{' '}
                              <span className={`badge ${
                                emergencyData.status === 'COMPLETED' ? 'bg-success' :
                                emergencyData.status === 'IN_PROGRESS' ? 'bg-warning' :
                                emergencyData.status === 'DISPATCHED' ? 'bg-info' :
                                'bg-secondary'
                              }`}>
                                {emergencyData.status}
                              </span>
                            </>
                          )}
                        </div>

                        {emergencyData.patientAddress && (
                          <div className="mb-3">
                            <strong><i className="fa fa-map-marker-alt me-2"></i>Location:</strong>
                            <p className="mb-0">{emergencyData.patientAddress}</p>
                          </div>
                        )}

                        {emergencyData.description && (
                          <div className="mb-3">
                            <strong><i className="fa fa-info-circle me-2"></i>Description:</strong>
                            <p className="mb-0">{emergencyData.description}</p>
                          </div>
                        )}

                        {emergencyData.ambulanceLicensePlate && (
                          <div className="alert alert-warning">
                            <strong><i className="fa fa-ambulance me-2"></i>Assigned Ambulance:</strong>
                            <p className="mb-0">
                              License Plate: {emergencyData.ambulanceLicensePlate}
                              {emergencyData.distanceKm && (
                                <> | Distance: {emergencyData.distanceKm.toFixed(2)} km</>
                              )}
                            </p>
                          </div>
                        )}

                        {emergencyData.doctorName && (
                          <div className="alert alert-success">
                            <strong><i className="fa fa-user-md me-2"></i>Assigned Doctor:</strong>
                            <p className="mb-0">{emergencyData.doctorName}</p>
                          </div>
                        )}

                        <div className="timeline">
                          <div className="d-flex align-items-center mb-3">
                            <div className="badge bg-success rounded-circle p-3 me-3">
                              <i className="fa fa-check"></i>
                            </div>
                            <div>
                              <h5 className="mb-0">Request Sent</h5>
                              <small className="text-muted">
                                {emergencyData.createdAt 
                                  ? new Date(emergencyData.createdAt).toLocaleString('vi-VN')
                                  : 'Your request has been received'}
                              </small>
                            </div>
                          </div>
                          
                          {emergencyData.status === 'DISPATCHED' || emergencyData.status === 'IN_PROGRESS' || emergencyData.status === 'COMPLETED' ? (
                            <div className="d-flex align-items-center mb-3">
                              <div className="badge bg-warning rounded-circle p-3 me-3">
                                <i className="fa fa-spinner fa-spin"></i>
                              </div>
                              <div>
                                <h5 className="mb-0">Ambulance On The Way</h5>
                                <small className="text-muted">
                                  {emergencyData.dispatchedAt 
                                    ? `Dispatched at: ${new Date(emergencyData.dispatchedAt).toLocaleString('vi-VN')}`
                                    : 'Ambulance has been dispatched'}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center mb-3">
                              <div className="badge bg-secondary rounded-circle p-3 me-3">
                                <i className="fa fa-clock"></i>
                              </div>
                              <div>
                                <h5 className="mb-0">Ambulance On The Way</h5>
                                <small className="text-muted">Waiting for dispatch...</small>
                              </div>
                            </div>
                          )}

                          {emergencyData.status === 'IN_PROGRESS' || emergencyData.status === 'COMPLETED' ? (
                            <div className="d-flex align-items-center mb-3">
                              <div className="badge bg-info rounded-circle p-3 me-3">
                                <i className="fa fa-heartbeat"></i>
                              </div>
                              <div>
                                <h5 className="mb-0">In Treatment</h5>
                                <small className="text-muted">Patient is being treated</small>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center mb-3">
                              <div className="badge bg-secondary rounded-circle p-3 me-3">
                                <i className="fa fa-clock"></i>
                              </div>
                              <div>
                                <h5 className="mb-0">In Treatment</h5>
                                <small className="text-muted">Waiting...</small>
                              </div>
                            </div>
                          )}

                          {emergencyData.status === 'COMPLETED' ? (
                            <div className="d-flex align-items-center">
                              <div className="badge bg-success rounded-circle p-3 me-3">
                                <i className="fa fa-check"></i>
                              </div>
                              <div>
                                <h5 className="mb-0">Completed</h5>
                                <small className="text-muted">Emergency case has been completed</small>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center">
                              <div className="badge bg-secondary rounded-circle p-3 me-3">
                                <i className="fa fa-clock"></i>
                              </div>
                              <div>
                                <h5 className="mb-0">Completed</h5>
                                <small className="text-muted">Waiting...</small>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Đang tải thông tin...</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => {
                          setStep('initial');
                          setSelectedSymptoms([]);
                          setLocation('');
                          setEmergencyId(null);
                          setEmergencyData(null);
                          setCoordinates(null);
                          setAddress('');
                          setErrorMessage('');
                          setSelectedClinicId(null);
                        }}
                      >
                        New Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <BackToTop />
    </>
  );
}

