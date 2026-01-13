'use client';

import { Drug, DrugFilters as DrugFiltersType } from './types';

interface DrugFiltersProps {
  drugs: Drug[];
  filters: DrugFiltersType;
  onFiltersChange: (filters: DrugFiltersType) => void;
}

export default function DrugFilters({ 
  drugs, 
  filters, 
  onFiltersChange 
}: DrugFiltersProps) {
  // Get unique values for filter options
  const categories = Array.from(new Set(drugs.map(d => d.therapeuticCategory))).sort();
  const dosageForms = Array.from(new Set(drugs.map(d => d.dosageForm))).sort();
  const routes = Array.from(new Set(drugs.map(d => d.route))).sort();

  const handleFilterChange = (key: keyof DrugFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h6 className="card-title mb-3">
          <i className="fa fa-filter me-2"></i>Filter Drugs
        </h6>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small">Therapeutic Category</label>
            <select
              className="form-select form-select-sm"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small">Dosage Form</label>
            <select
              className="form-select form-select-sm"
              value={filters.dosageForm}
              onChange={(e) => handleFilterChange('dosageForm', e.target.value)}
            >
              <option value="">All</option>
              {dosageForms.map(form => (
                <option key={form} value={form}>{form}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small">Route</label>
            <select
              className="form-select form-select-sm"
              value={filters.route}
              onChange={(e) => handleFilterChange('route', e.target.value)}
            >
              <option value="">All</option>
              {routes.map(route => (
                <option key={route} value={route}>{route}</option>
              ))}
            </select>
          </div>
        </div>
        {(filters.category || filters.dosageForm || filters.route) && (
          <div className="mt-3">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onFiltersChange({ category: '', dosageForm: '', route: '' })}
            >
              <i className="fa fa-times me-1"></i>Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
