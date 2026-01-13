'use client';

import { Drug } from './types';

interface DrugListProps {
  drugs: Drug[];
  isLoading?: boolean;
  onAddToDraft: (drug: Drug) => void;
  draftDrugIds: number[];
}

export default function DrugList({ 
  drugs, 
  isLoading = false,
  onAddToDraft,
  draftDrugIds 
}: DrugListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-2">Loading drug list...</p>
      </div>
    );
  }

  if (drugs.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fa fa-pills fa-3x text-muted mb-3"></i>
        <h6 className="text-muted">No drugs found</h6>
        <p className="text-muted small">Try changing your search keywords or filters</p>
      </div>
    );
  }

  const getRegulationBadgeClass = (level?: string) => {
    switch (level) {
      case 'OTC':
        return 'bg-success';
      case 'Rx':
        return 'bg-primary';
      case 'Antibiotic':
        return 'bg-warning text-dark';
      case 'Controlled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="list-group">
      {drugs.map((drug) => {
        const isInDraft = draftDrugIds.includes(drug.id);
        
        return (
          <div
            key={drug.id}
            className={`list-group-item list-group-item-action ${
              isInDraft ? 'bg-light' : ''
            }`}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex flex-grow-1">
                <div className="me-3 position-relative" style={{ minWidth: '100px' }}>
                  {drug.imageUrl ? (
                    <img
                      src={drug.imageUrl}
                      alt={drug.brandName}
                      className="rounded border"
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover',
                        backgroundColor: '#f0f0f0',
                        display: 'block'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.image-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="image-fallback rounded border d-flex align-items-center justify-content-center bg-light"
                    style={{ 
                      width: '100px', 
                      height: '100px',
                      display: drug.imageUrl ? 'none' : 'flex'
                    }}
                  >
                    <i className="fa fa-pills fa-3x text-primary"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <h6 className="mb-0 me-2">{drug.brandName}</h6>
                    {drug.regulationLevel && (
                      <span className={`badge ${getRegulationBadgeClass(drug.regulationLevel)}`}>
                        {drug.regulationLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-1">
                    <strong>Active Ingredient:</strong> {drug.activeIngredient}
                  </p>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    <span className="badge bg-info text-dark">
                      <i className="fa fa-tag me-1"></i>{drug.therapeuticCategory}
                    </span>
                    <span className="badge bg-secondary">
                      {drug.strength}
                    </span>
                    <span className="badge bg-secondary">
                      {drug.dosageForm}
                    </span>
                    <span className="badge bg-secondary">
                      {drug.route}
                    </span>
                  </div>
                  {drug.manufacturer && (
                    <p className="text-muted small mb-0">
                      <i className="fa fa-industry me-1"></i>{drug.manufacturer}
                    </p>
                  )}
                </div>
              </div>
              <div className="ms-3">
                <button
                  className={`btn btn-sm ${
                    isInDraft ? 'btn-success' : 'btn-primary'
                  }`}
                  onClick={() => onAddToDraft(drug)}
                  title={isInDraft ? 'Already in prescription' : 'Add to prescription'}
                >
                  {isInDraft ? (
                    <>
                      <i className="fa fa-check me-1"></i>Added
                    </>
                  ) : (
                    <>
                      <i className="fa fa-plus me-1"></i>Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
