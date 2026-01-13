'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Drug, DraftItem, DrugFilters } from '@/components/doctor/pharmacy/types';
import { mockDrugs } from '@/components/doctor/pharmacy/mockData';
import { loadDraftFromLocalStorage } from '@/components/doctor/pharmacy/utils';
import DrugSearchBar from '@/components/doctor/pharmacy/DrugSearchBar';
import DrugFiltersComponent from '@/components/doctor/pharmacy/DrugFilters';
import DrugList from '@/components/doctor/pharmacy/DrugList';
import PrescriptionDraftPanel from '@/components/doctor/pharmacy/PrescriptionDraftPanel';

export default function DoctorPharmacyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DrugFilters>({
    category: '',
    dosageForm: '',
    route: ''
  });
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'drugs' | 'draft'>('drugs');

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = loadDraftFromLocalStorage();
    if (savedDraft.length > 0) {
      setDraftItems(savedDraft);
    }
  }, []);

  // Filter drugs based on search and filters
  const filteredDrugs = useMemo(() => {
    let result = [...mockDrugs];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(drug =>
        drug.brandName.toLowerCase().includes(searchLower) ||
        drug.activeIngredient.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(drug => drug.therapeuticCategory === filters.category);
    }

    // Apply dosage form filter
    if (filters.dosageForm) {
      result = result.filter(drug => drug.dosageForm === filters.dosageForm);
    }

    // Apply route filter
    if (filters.route) {
      result = result.filter(drug => drug.route === filters.route);
    }

    return result;
  }, [searchTerm, filters]);

  // Get drug IDs in draft
  const draftDrugIds = useMemo(() => {
    return draftItems.map(item => item.drugId);
  }, [draftItems]);

  const handleAddToDraft = useCallback((drug: Drug) => {
    // Check if drug already exists in draft
    const existingIndex = draftItems.findIndex(item => item.drugId === drug.id);
    
    if (existingIndex >= 0) {
      // Focus on existing item (scroll to it)
      setActiveTab('draft');
      // You could also highlight it or show a message
      return;
    }

    // Create new draft item
    const newItem: DraftItem = {
      drugId: drug.id,
      brandName: drug.brandName,
      activeIngredient: drug.activeIngredient,
      strength: drug.strength,
      dosageForm: drug.dosageForm,
      route: drug.route,
      dose: '',
      frequencyPerDay: 1,
      days: 1,
      quantity: 1,
      note: '',
      imageUrl: drug.imageUrl
    };

    setDraftItems(prev => [...prev, newItem]);
    setActiveTab('draft');
  }, [draftItems]);

  const handleUpdateItem = useCallback((index: number, updatedItem: DraftItem) => {
    setDraftItems(prev => {
      const newItems = [...prev];
      newItems[index] = updatedItem;
      return newItems;
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setDraftItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearDraft = useCallback(() => {
    setDraftItems([]);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <div className="me-3">
          <i className="fa fa-prescription-bottle-alt fa-2x text-primary"></i>
        </div>
        <div>
          <h2 className="mb-0">💊 Doctor Pharmacy</h2>
          <p className="text-muted mb-0">Search and create prescriptions</p>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="d-md-none mb-3">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'drugs' ? 'active' : ''}`}
              onClick={() => setActiveTab('drugs')}
            >
              <i className="fa fa-pills me-2"></i>Drug List
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'draft' ? 'active' : ''}`}
              onClick={() => setActiveTab('draft')}
            >
              <i className="fa fa-clipboard-list me-2"></i>Prescription Draft
              {draftItems.length > 0 && (
                <span className="badge bg-primary ms-2">{draftItems.length}</span>
              )}
            </button>
          </li>
        </ul>
      </div>

      <div className="row g-4">
        {/* Left Column - Drug Search & List */}
        <div className={`col-md-8 ${activeTab === 'drugs' ? '' : 'd-md-block d-none'}`}>
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <DrugSearchBar onSearchChange={setSearchTerm} />
            </div>
          </div>

          <DrugFiltersComponent
            drugs={mockDrugs}
            filters={filters}
            onFiltersChange={setFilters}
          />

          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="fa fa-list me-2"></i>
                Drug List
                <span className="badge bg-primary ms-2">{filteredDrugs.length}</span>
              </h6>
            </div>
            <div className="card-body">
              <DrugList
                drugs={filteredDrugs}
                isLoading={isLoading}
                onAddToDraft={handleAddToDraft}
                draftDrugIds={draftDrugIds}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Prescription Draft */}
        <div className={`col-md-4 ${activeTab === 'draft' ? '' : 'd-md-block d-none'}`}>
          <PrescriptionDraftPanel
            draftItems={draftItems}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onClearDraft={handleClearDraft}
          />
        </div>
      </div>
    </div>
  );
}
