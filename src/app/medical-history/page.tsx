'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { isAuthenticated, getToken } from '@/utils/auth';

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsAuth(auth);
      if (!auth) {
        router.push('/login');
        return;
      }

      // Fetch medical history
      const fetchMedicalHistory = async () => {
        try {
          const token = getToken();
          if (!token) {
            setIsLoading(false);
            return;
          }
          // TODO: Replace with your actual API endpoint
          const response = await fetch('/api/medical-history', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setMedicalHistory(data.history || []);
          } else {
            console.error('Failed to fetch medical history');
          }
        } catch (error) {
          console.error('Error fetching medical history:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMedicalHistory();
    };

    checkAuth();
  }, [router]);

  if (!isAuth) {
    return null;
  }

  return (
    <>
      <Topbar />
      <Navbar />
      <div className="container-fluid py-5">
        <div className="container">
          <div className="text-center mx-auto mb-5" style={{ maxWidth: '500px' }}>
            <h5 className="d-inline-block text-primary text-uppercase border-bottom border-5">
              Medical History
            </h5>
            <h1 className="display-4">Your Medical History</h1>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : medicalHistory.length === 0 ? (
            <div className="card shadow">
              <div className="card-body text-center py-5">
                <i className="fa fa-clipboard-list fa-3x text-muted mb-3"></i>
                <h4>No Medical History</h4>
                <p className="text-muted">You don't have any medical history records yet.</p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {medicalHistory.map((record, index) => (
                <div key={index} className="col-lg-6">
                  <div className="card shadow h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="card-title text-primary">
                            <i className="fa fa-calendar-check me-2"></i>
                            {record.date || 'N/A'}
                          </h5>
                          <p className="text-muted mb-0">
                            <i className="fa fa-user-md me-2"></i>
                            {record.doctor || 'Doctor Name'}
                          </p>
                        </div>
                        <span className="badge bg-primary">{record.department || 'General'}</span>
                      </div>
                      <div className="mb-3">
                        <h6 className="text-dark">Diagnosis:</h6>
                        <p className="mb-0">{record.diagnosis || 'No diagnosis recorded'}</p>
                      </div>
                      {record.prescription && (
                        <div className="mb-3">
                          <h6 className="text-dark">Prescription:</h6>
                          <p className="mb-0">{record.prescription}</p>
                        </div>
                      )}
                      {record.notes && (
                        <div>
                          <h6 className="text-dark">Notes:</h6>
                          <p className="mb-0 text-muted">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <BackToTop />
    </>
  );
}

