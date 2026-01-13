import { DraftItem } from './types';

const STORAGE_KEY = 'doctor_pharmacy_draft';

export const saveDraftToLocalStorage = (draft: DraftItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving draft to localStorage:', error);
  }
};

export const loadDraftFromLocalStorage = (): DraftItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading draft from localStorage:', error);
  }
  return [];
};

export const clearDraftFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing draft from localStorage:', error);
  }
};
