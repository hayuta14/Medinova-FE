'use client';

import { useState, useEffect, useRef } from 'react';

interface DrugSearchBarProps {
  onSearchChange: (searchTerm: string) => void;
  debounceMs?: number;
}

export default function DrugSearchBar({ 
  onSearchChange, 
  debounceMs = 400 
}: DrugSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(searchTerm);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, onSearchChange, debounceMs]);

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">
        <i className="fa fa-search me-2"></i>Search Drugs
      </label>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Search by drug name or active ingredient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setSearchTerm('')}
          >
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
}
