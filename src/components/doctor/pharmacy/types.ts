// Types for Doctor Pharmacy page

export type RegulationLevel = "OTC" | "Rx" | "Antibiotic" | "Controlled";

export interface Drug {
  id: number;
  therapeuticCategory: string;
  activeIngredient: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  route: string;
  manufacturer?: string;
  regulationLevel?: RegulationLevel;
  imageUrl?: string;
}

export interface DraftItem {
  drugId: number;
  brandName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  route: string;
  dose: string;
  frequencyPerDay: number;
  days: number;
  quantity: number;
  note?: string;
  imageUrl?: string;
}

export interface PatientInfo {
  name: string;
  age: number;
  address: string;
  diagnosis: string;
  doctorName?: string;
  clinicName?: string;
}

export interface DrugFilters {
  category: string;
  dosageForm: string;
  route: string;
}
