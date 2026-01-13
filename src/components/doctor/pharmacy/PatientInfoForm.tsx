'use client';

import { useState } from 'react';
import { PatientInfo } from './types';

interface PatientInfoFormProps {
  onConfirm: (patientInfo: PatientInfo) => void;
  onCancel: () => void;
  defaultDoctorName?: string;
  defaultClinicName?: string;
}

export default function PatientInfoForm({
  onConfirm,
  onCancel,
  defaultDoctorName = '',
  defaultClinicName = ''
}: PatientInfoFormProps) {
  const [formData, setFormData] = useState<PatientInfo>({
    name: '',
    age: 0,
    address: '',
    diagnosis: '',
    doctorName: defaultDoctorName,
    clinicName: defaultClinicName
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.diagnosis || formData.age <= 0) {
      alert('Please fill in all required patient information!');
      return;
    }
    onConfirm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">
          <i className="fa fa-user me-2"></i>Patient Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter patient name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          <i className="fa fa-birthday-cake me-2"></i>Age <span className="text-danger">*</span>
        </label>
        <input
          type="number"
          className="form-control"
          placeholder="Enter age"
          min="1"
          max="150"
          value={formData.age || ''}
          onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          <i className="fa fa-map-marker-alt me-2"></i>Address
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          <i className="fa fa-stethoscope me-2"></i>Diagnosis <span className="text-danger">*</span>
        </label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Enter diagnosis"
          value={formData.diagnosis}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          <i className="fa fa-user-md me-2"></i>Doctor Name
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter doctor name"
          value={formData.doctorName}
          onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          <i className="fa fa-hospital me-2"></i>Clinic Name
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter clinic name"
          value={formData.clinicName}
          onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
        />
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
        >
          <i className="fa fa-times me-2"></i>Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          <i className="fa fa-file-word me-2"></i>Export Word
        </button>
      </div>
    </form>
  );
}
