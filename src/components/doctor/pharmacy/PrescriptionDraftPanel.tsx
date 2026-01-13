'use client';

import { useState, useRef, useEffect } from 'react';
import { DraftItem, PatientInfo } from './types';
import DraftItemRow from './DraftItemRow';
import { saveDraftToLocalStorage, clearDraftFromLocalStorage } from './utils';
import { generatePrescriptionWord } from './wordGenerator';
import PatientInfoForm from './PatientInfoForm';

interface PrescriptionDraftPanelProps {
  draftItems: DraftItem[];
  onUpdateItem: (index: number, item: DraftItem) => void;
  onRemoveItem: (index: number) => void;
  onClearDraft: () => void;
}

export default function PrescriptionDraftPanel({
  draftItems,
  onUpdateItem,
  onRemoveItem,
  onClearDraft
}: PrescriptionDraftPanelProps) {
  const [showPatientFormModal, setShowPatientFormModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to focused item
  useEffect(() => {
    if (focusedIndex !== null && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [focusedIndex]);

  const handleSaveDraft = () => {
    saveDraftToLocalStorage(draftItems);
    alert('Prescription draft saved to localStorage!');
  };

  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear the entire prescription?')) {
      clearDraftFromLocalStorage();
      onClearDraft();
    }
  };

  const handleExportWord = () => {
    setShowPatientFormModal(true);
  };

  const handleGenerateWord = async (patientInfo: PatientInfo) => {
    if (draftItems.length === 0) {
      alert('Prescription is empty!');
      return;
    }

    setIsGenerating(true);
    setShowPatientFormModal(false);

    try {
      await generatePrescriptionWord(draftItems, patientInfo);
      alert('Word document created successfully!');
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('An error occurred while creating the Word document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="card shadow-lg border-primary h-100" style={{ position: 'sticky', top: '20px' }}>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="fa fa-prescription-bottle-alt me-2"></i>
            Prescription Draft
            {draftItems.length > 0 && (
              <span className="badge bg-light text-primary ms-2">
                {draftItems.length}
              </span>
            )}
          </h5>
        </div>
        <div className="card-body" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
          {draftItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="fa fa-clipboard-list fa-3x text-muted mb-3"></i>
              <p className="text-muted">No drugs in prescription</p>
              <p className="text-muted small">Add drugs from the list on the left</p>
            </div>
          ) : (
            <div>
              {draftItems.map((item, index) => (
                <div
                  key={`${item.drugId}-${index}`}
                  ref={(el) => (itemRefs.current[index] = el)}
                >
                  <DraftItemRow
                    item={item}
                    onUpdate={(updated) => onUpdateItem(index, updated)}
                    onRemove={() => onRemoveItem(index)}
                    onFocus={() => setFocusedIndex(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {draftItems.length > 0 && (
          <div className="card-footer bg-light">
            <div className="d-grid gap-2">
              <button
                className="btn btn-success"
                onClick={handleSaveDraft}
              >
                <i className="fa fa-save me-2"></i>Save Draft
              </button>
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary"
                  onClick={handleExportWord}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-file-word me-2"></i>Export Word
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleClearDraft}
                  disabled={isGenerating}
                >
                  <i className="fa fa-trash me-2"></i>Clear Prescription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Info Form Modal */}
      {showPatientFormModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPatientFormModal(false);
            }
          }}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fa fa-file-word me-2"></i>Patient Information for Prescription Export
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPatientFormModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <PatientInfoForm
                  onConfirm={handleGenerateWord}
                  onCancel={() => setShowPatientFormModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
