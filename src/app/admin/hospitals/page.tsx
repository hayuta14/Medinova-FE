'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClinicManagement } from '@/generated/api/endpoints/clinic-management/clinic-management';

export default function HospitalsPage() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingHospital, setEditingHospital] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    latitude: '',
    longitude: '',
  });
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 21.0285, lng: 105.8542 }); // Default to Hanoi
  const [mapZoom, setMapZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSuggestions && !target.closest('.address-search-container')) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      const clinicApi = getClinicManagement();
      const response = await clinicApi.getAllClinics();

      // API trả về Clinic[] trực tiếp
      const clinics = Array.isArray(response) ? response : [];
      setHospitals(clinics);
    } catch (error: any) {
      console.error('Error loading hospitals:', error);
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) {
      return;
    }

    try {
      const clinicApi = getClinicManagement();
      await clinicApi.deleteClinic(id);
      // Reload danh sách sau khi xóa
      await loadHospitals();
      alert('Xóa cơ sở thành công!');
    } catch (error: any) {
      console.error('Error deleting hospital:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xóa cơ sở. Vui lòng thử lại!';
      alert(errorMessage);
    }
  };

  const handleCreate = () => {
    setIsCreateMode(true);
    setEditingHospital(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      description: '',
      latitude: '',
      longitude: '',
    });
    setCoordinates(null);
    setMapCenter({ lat: 21.0285, lng: 105.8542 });
    setSearchQuery('');
    setAddressSuggestions([]);
    setShowSuggestions(false);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (hospital: any) => {
    setIsCreateMode(false);
    setEditingHospital(hospital);
    const lat = hospital.latitude || '';
    const lng = hospital.longitude || '';
    setFormData({
      name: hospital.name || '',
      address: hospital.address || '',
      phone: hospital.phone || '',
      description: hospital.description || '',
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    if (lat && lng) {
      const coord = { lat: parseFloat(lat.toString()), lng: parseFloat(lng.toString()) };
      setCoordinates(coord);
      setMapCenter(coord);
    } else {
      setCoordinates(null);
      setMapCenter({ lat: 21.0285, lng: 105.8542 });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsCreateMode(false);
    setEditingHospital(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      description: '',
      latitude: '',
      longitude: '',
    });
    setCoordinates(null);
    setMapCenter({ lat: 21.0285, lng: 105.8542 });
    setSearchQuery('');
    setAddressSuggestions([]);
    setShowSuggestions(false);
    setErrors({});
  };

  // Handle map click or location selection
  const handleMapLocationSelect = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    setMapCenter({ lat, lng });
  };

  // Handle address search with suggestions
  const handleSearchAddress = async (query?: string) => {
    const searchTerm = query || searchQuery || formData.address;
    if (!searchTerm || searchTerm.length < 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=10&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching address:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    handleMapLocationSelect(lat, lng);
    setFormData({ ...formData, address: suggestion.display_name });
    setSearchQuery('');
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  // Auto-search when search query changes (debounced)
  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearchAddress(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: any = {};
    if (!formData.name) {
      newErrors.name = 'Tên cơ sở là bắt buộc';
    }
    if (!formData.address) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }
    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    }
    if (!coordinates && !formData.latitude && !formData.longitude) {
      newErrors.location = 'Vui lòng chọn vị trí trên bản đồ';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const clinicApi = getClinicManagement();
      
      // Prepare request body with latitude and longitude
      const requestBody: any = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description || undefined,
      };

      // Add latitude and longitude if coordinates are selected
      if (coordinates) {
        requestBody.latitude = coordinates.lat;
        requestBody.longitude = coordinates.lng;
      } else if (formData.latitude && formData.longitude) {
        requestBody.latitude = parseFloat(formData.latitude);
        requestBody.longitude = parseFloat(formData.longitude);
      }

      if (isCreateMode) {
        // Create new clinic
        await clinicApi.createClinic(requestBody);
        alert('Tạo cơ sở thành công!');
      } else {
        // Update existing clinic
        await clinicApi.updateClinic(editingHospital.id, requestBody);
        alert('Cập nhật cơ sở thành công!');
      }
      
      // Reload danh sách sau khi create/update
      await loadHospitals();
      handleCloseModal();
    } catch (error: any) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} hospital:`, error);
      const errorMessage = error?.response?.data?.message || error?.message || `Có lỗi xảy ra khi ${isCreateMode ? 'tạo' : 'cập nhật'} cơ sở. Vui lòng thử lại!`;
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Add responsive styles for modal
    const style = document.createElement('style');
    style.id = 'hospital-modal-styles';
    style.textContent = `
      @media (max-width: 768px) {
        .modal-dialog.modal-xl {
          max-width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
        }
        .modal-content {
          border-radius: 0 !important;
        }
      }
      .modal-dialog.modal-xl .modal-content {
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
      }
      .modal-dialog.modal-xl .modal-body {
        flex: 1 1 auto !important;
        overflow-y: auto !important;
        min-height: 0 !important;
      }
      .modal-dialog.modal-xl .modal-footer {
        flex-shrink: 0 !important;
        border-top: 1px solid #dee2e6 !important;
      }
    `;
    if (!document.getElementById('hospital-modal-styles')) {
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.getElementById('hospital-modal-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách cơ sở</h2>
        <button 
          className="btn btn-primary"
          onClick={handleCreate}
        >
          <i className="fa fa-plus me-2"></i>Đăng ký cơ sở mới
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-hospital fa-3x text-muted mb-3"></i>
              <p className="text-muted">Chưa có cơ sở nào</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên cơ sở</th>
                    <th>Địa chỉ</th>
                    <th>Số điện thoại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((hospital) => (
                    <tr key={hospital.id}>
                      <td>{hospital.id}</td>
                      <td>{hospital.name || 'N/A'}</td>
                      <td>{hospital.address || 'N/A'}</td>
                      <td>{hospital.phone || 'N/A'}</td>
                      <td>
                        <span className="badge bg-success">Active</span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(hospital)}
                        >
                          <i className="fa fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(hospital.id!)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div 
            className="modal-dialog modal-xl modal-dialog-scrollable"
            style={{ 
              maxWidth: '95vw', 
              height: '95vh', 
              margin: '2.5vh auto',
              maxHeight: '95vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header" style={{ flexShrink: 0 }}>
                <h5 className="modal-title">
                  {isCreateMode ? 'Đăng ký cơ sở mới' : 'Chỉnh sửa cơ sở'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div className="modal-body" style={{ flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
                  <div className="mb-3">
                    <label htmlFor="edit-name" className="form-label">
                      Tên cơ sở <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="edit-address" className="form-label">
                      Địa chỉ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      id="edit-address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="edit-phone" className="form-label">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="edit-description" className="form-label">
                      Mô tả
                    </label>
                    <textarea
                      className="form-control"
                      id="edit-description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="fa fa-map-marker-alt me-2 text-danger"></i>
                      Vị trí trên bản đồ <span className="text-danger">*</span>
                    </label>
                    <div className="mb-2">
                        <div className="mb-2 position-relative address-search-container">
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tìm kiếm địa chỉ (VD: 123 Đường ABC, Quận XYZ, Hà Nội)"
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                              }}
                              onFocus={() => {
                                if (addressSuggestions.length > 0) {
                                  setShowSuggestions(true);
                                }
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (addressSuggestions.length > 0) {
                                    handleSelectSuggestion(addressSuggestions[0]);
                                  } else {
                                    handleSearchAddress();
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => handleSearchAddress()}
                              disabled={isSearching || !searchQuery}
                            >
                              {isSearching ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : (
                                <i className="fa fa-search"></i>
                              )}
                            </button>
                          </div>
                          {showSuggestions && addressSuggestions.length > 0 && (
                            <div 
                              className="list-group position-absolute w-100"
                              style={{
                                zIndex: 1000,
                                maxHeight: '300px',
                                overflowY: 'auto',
                                marginTop: '2px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                borderRadius: '4px'
                              }}
                            >
                              {addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="list-group-item list-group-item-action text-start"
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  style={{ cursor: 'pointer' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                  }}
                                >
                                  <div className="d-flex align-items-start">
                                    <i className="fa fa-map-marker-alt text-danger me-2 mt-1"></i>
                                    <div className="flex-grow-1">
                                      <div className="fw-bold small">{suggestion.display_name}</div>
                                      {suggestion.address && (
                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                          {[
                                            suggestion.address.road,
                                            suggestion.address.quarter,
                                            suggestion.address.suburb,
                                            suggestion.address.city,
                                            suggestion.address.country
                                          ].filter(Boolean).join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          {showSuggestions && addressSuggestions.length === 0 && searchQuery && searchQuery.length >= 2 && !isSearching && (
                            <div 
                              className="position-absolute w-100 bg-white border rounded p-2"
                              style={{
                                zIndex: 1000,
                                marginTop: '2px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              <div className="text-muted text-center small">
                                <i className="fa fa-info-circle me-1"></i>
                                Không tìm thấy địa chỉ. Vui lòng thử lại với từ khóa khác.
                              </div>
                            </div>
                          )}
                        </div>
                        <div 
                          style={{ 
                            height: '400px', 
                            width: '100%', 
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '2px solid #dc3545',
                            position: 'relative',
                            cursor: 'crosshair'
                          }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const width = rect.width;
                            const height = rect.height;
                            
                            // Convert click position to lat/lng using Mercator projection approximation
                            const centerLng = coordinates ? coordinates.lng : mapCenter.lng;
                            const centerLat = coordinates ? coordinates.lat : mapCenter.lat;
                            
                            // Bbox dimensions (in degrees)
                            const bboxWidth = 0.02;
                            const bboxHeight = 0.02;
                            
                            // Calculate offset from center
                            const lngOffset = ((x / width) - 0.5) * bboxWidth;
                            // Latitude is inverted (top is higher lat)
                            const latOffset = (0.5 - (y / height)) * bboxHeight;
                            
                            const newLng = centerLng + lngOffset;
                            const newLat = centerLat + latOffset;
                            
                            handleMapLocationSelect(newLat, newLng);
                          }}
                        >
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0, pointerEvents: 'none' }}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${(coordinates ? coordinates.lng : mapCenter.lng) - 0.01},${(coordinates ? coordinates.lat : mapCenter.lat) - 0.01},${(coordinates ? coordinates.lng : mapCenter.lng) + 0.01},${(coordinates ? coordinates.lat : mapCenter.lat) + 0.01}&layer=mapnik&marker=${coordinates ? `${coordinates.lat},${coordinates.lng}` : `${mapCenter.lat},${mapCenter.lng}`}`}
                          allowFullScreen
                        ></iframe>
                        <div 
                          className="position-absolute w-100 h-100"
                          style={{
                            top: 0,
                            left: 0,
                            zIndex: 10,
                            cursor: 'crosshair'
                          }}
                        ></div>
                        {coordinates && (
                          <div 
                            className="position-absolute"
                            style={{
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              zIndex: 15,
                              pointerEvents: 'none'
                            }}
                          >
                            <i className="fa fa-map-marker-alt text-danger" style={{ fontSize: '40px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}></i>
                          </div>
                        )}
                        <div 
                          className="position-absolute"
                          style={{
                            top: '10px',
                            left: '10px',
                            zIndex: 20,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            pointerEvents: 'none'
                          }}
                        >
                          <i className="fa fa-info-circle me-1 text-primary"></i>
                          Click vào bản đồ để chọn vị trí
                        </div>
                      </div>
                      <div className="mt-2 d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const lat = position.coords.latitude;
                                  const lng = position.coords.longitude;
                                  handleMapLocationSelect(lat, lng);
                                },
                                () => {
                                  alert('Không thể lấy vị trí hiện tại. Vui lòng chọn trên bản đồ.');
                                }
                              );
                            }
                          }}
                        >
                          <i className="fa fa-crosshairs me-1"></i>
                          Dùng vị trí hiện tại
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={handleSearchAddress}
                        >
                          <i className="fa fa-search me-1"></i>
                          Tìm từ địa chỉ
                        </button>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${coordinates ? `${coordinates.lat},${coordinates.lng}` : `${mapCenter.lat},${mapCenter.lng}`}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger"
                        >
                          <i className="fa fa-external-link-alt me-1"></i>
                          Mở Google Maps
                        </a>
                      </div>
                    </div>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control form-control-sm"
                          value={formData.latitude}
                          onChange={(e) => {
                            const lat = parseFloat(e.target.value);
                            if (!isNaN(lat)) {
                              handleMapLocationSelect(lat, coordinates?.lng || mapCenter.lng);
                            } else {
                              setFormData({ ...formData, latitude: e.target.value });
                            }
                          }}
                          placeholder="21.0285"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control form-control-sm"
                          value={formData.longitude}
                          onChange={(e) => {
                            const lng = parseFloat(e.target.value);
                            if (!isNaN(lng)) {
                              handleMapLocationSelect(coordinates?.lat || mapCenter.lat, lng);
                            } else {
                              setFormData({ ...formData, longitude: e.target.value });
                            }
                          }}
                          placeholder="105.8542"
                        />
                      </div>
                    </div>
                    <small className="text-muted">
                      Click vào bản đồ hoặc nhập tọa độ để chọn vị trí. Vị trí là bắt buộc để hệ thống có thể tìm phòng khám gần nhất.
                    </small>
                    {(!coordinates && !formData.latitude && !formData.longitude) && (
                      <div className="text-danger small mt-1">
                        <i className="fa fa-exclamation-circle me-1"></i>
                        Vui lòng chọn vị trí trên bản đồ
                      </div>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="alert alert-danger" role="alert">
                      {errors.submit}
                    </div>
                  )}
                </div>
                <div className="modal-footer" style={{ flexShrink: 0, borderTop: '1px solid #dee2e6', padding: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Đóng
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isCreateMode ? 'Đang tạo...' : 'Đang lưu...'}
                      </>
                    ) : (
                      isCreateMode ? 'Tạo' : 'Lưu'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

