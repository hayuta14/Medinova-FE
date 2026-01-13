'use client';

import { DraftItem } from './types';

interface DraftItemRowProps {
  item: DraftItem;
  onUpdate: (updatedItem: DraftItem) => void;
  onRemove: () => void;
  onFocus?: () => void;
}

export default function DraftItemRow({
  item,
  onUpdate,
  onRemove,
  onFocus
}: DraftItemRowProps) {
  // Auto-calculate quantity if frequency and days are set
  const calculatedQuantity = item.frequencyPerDay * item.days;
  const displayQuantity = item.quantity || calculatedQuantity || 0;

  const handleFieldChange = (field: keyof DraftItem, value: string | number) => {
    const updated = { ...item, [field]: value };
    
    // Auto-calculate quantity when frequency or days change
    if (field === 'frequencyPerDay' || field === 'days') {
      const newFreq = field === 'frequencyPerDay' ? Number(value) : item.frequencyPerDay;
      const newDays = field === 'days' ? Number(value) : item.days;
      updated.quantity = newFreq * newDays || 0;
    }
    
    onUpdate(updated);
  };

  return (
    <div className="card mb-3 border-primary">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold">{item.brandName}</h6>
            <p className="text-muted small mb-0">
              {item.activeIngredient} - {item.strength} ({item.dosageForm}, {item.route})
            </p>
          </div>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={onRemove}
            title="Remove from prescription"
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>

        <div className="row g-2">
          <div className="col-md-3">
            <label className="form-label small">Dose</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g., 1 tablet"
              value={item.dose}
              onChange={(e) => handleFieldChange('dose', e.target.value)}
              onFocus={onFocus}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Times/Day</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min="1"
              value={item.frequencyPerDay || ''}
              onChange={(e) => handleFieldChange('frequencyPerDay', Number(e.target.value) || 0)}
              onFocus={onFocus}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Days</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min="1"
              value={item.days || ''}
              onChange={(e) => handleFieldChange('days', Number(e.target.value) || 0)}
              onFocus={onFocus}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Quantity</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min="1"
              value={displayQuantity}
              onChange={(e) => handleFieldChange('quantity', Number(e.target.value) || 0)}
              onFocus={onFocus}
              title="Auto-calculated from times/day × days (can be edited)"
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="form-label small">Note</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Note (optional)"
            value={item.note || ''}
            onChange={(e) => handleFieldChange('note', e.target.value)}
            onFocus={onFocus}
          />
        </div>
      </div>
    </div>
  );
}
