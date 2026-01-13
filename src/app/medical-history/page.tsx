"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import RequireAuth from "@/components/RequireAuth";
import { getUserProfile } from "@/generated/api/endpoints/user-profile/user-profile";

export default function MedicalHistoryPage() {
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch medical history từ API
    const fetchMedicalHistory = async () => {
      try {
        const profileApi = getUserProfile();
        const response = await profileApi.getMedicalHistory();

        // API function already extracts response.data, so response is the data itself
        const historyData = (response as any)?.data || response;

        // Nếu là object có field medicalHistory hoặc history
        if (historyData.medicalHistory) {
          setMedicalHistory(
            Array.isArray(historyData.medicalHistory)
              ? historyData.medicalHistory
              : []
          );
        } else if (historyData.history) {
          setMedicalHistory(
            Array.isArray(historyData.history) ? historyData.history : []
          );
        } else if (Array.isArray(historyData)) {
          setMedicalHistory(historyData);
        } else {
          setMedicalHistory([]);
        }
      } catch (error: any) {
        console.error("Error fetching medical history:", error);
        setMedicalHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalHistory();
  }, []);

  return (
    <RequireAuth>
      <>
        <Topbar />
        <Navbar />
        <div className="container-fluid py-5">
          <div className="container">
            <div
              className="text-center mx-auto mb-5"
              style={{ maxWidth: "500px" }}
            >
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
                  <p className="text-muted">
                    You don't have any medical history records yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {medicalHistory.map((record: any, index: number) => (
                  <div key={record.id || index} className="col-lg-6">
                    <div className="card shadow h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="card-title text-primary">
                              <i className="fa fa-calendar-check me-2"></i>
                              {record.diagnosisDate || record.date || "N/A"}
                            </h5>
                            {record.medicalCondition && (
                              <p className="text-muted mb-0">
                                <i className="fa fa-stethoscope me-2"></i>
                                {record.medicalCondition}
                              </p>
                            )}
                          </div>
                        </div>
                        {record.treatmentDescription && (
                          <div className="mb-3">
                            <h6 className="text-dark">Treatment:</h6>
                            <p className="mb-0">
                              {record.treatmentDescription}
                            </p>
                          </div>
                        )}
                        {record.medications && (
                          <div className="mb-3">
                            <h6 className="text-dark">Medications:</h6>
                            <p className="mb-0">{record.medications}</p>
                          </div>
                        )}
                        {record.allergies && (
                          <div className="mb-3">
                            <h6 className="text-dark">Allergies:</h6>
                            <p className="mb-0 text-warning">
                              {record.allergies}
                            </p>
                          </div>
                        )}
                        {record.chronicDiseases && (
                          <div className="mb-3">
                            <h6 className="text-dark">Chronic Diseases:</h6>
                            <p className="mb-0">{record.chronicDiseases}</p>
                          </div>
                        )}
                        {record.previousSurgeries && (
                          <div className="mb-3">
                            <h6 className="text-dark">Previous Surgeries:</h6>
                            <p className="mb-0">{record.previousSurgeries}</p>
                          </div>
                        )}
                        {record.familyHistory && (
                          <div className="mb-3">
                            <h6 className="text-dark">Family History:</h6>
                            <p className="mb-0">{record.familyHistory}</p>
                          </div>
                        )}
                        {record.notes && (
                          <div>
                            <h6 className="text-dark">Notes:</h6>
                            <p className="mb-0 text-muted">{record.notes}</p>
                          </div>
                        )}
                        {record.createdAt && (
                          <small className="text-muted d-block mt-2">
                            <i className="fa fa-clock me-1"></i>
                            Created:{" "}
                            {new Date(record.createdAt).toLocaleDateString()}
                          </small>
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
    </RequireAuth>
  );
}
