export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export type Nutriments = {
  kcal: number | null;
  fat: number | null;
  satFat: number | null;
  carbs: number | null;
  sugars: number | null;
  fiber: number | null;
  protein: number | null;
  salt: number | null;
  sodium: number | null;
};

export type FoodProduct = {
  barcode: string;
  name: string;
  brand: string;
  quantity: string;
  servingSize: string;
  image?: string;
  ingredients: string;
  allergensTags: string[];
  allergensText: string;
  traces: string;
  nutriments: Nutriments;
  nutriscore?: string;
  novaGroup?: number;
  categories: string;
  labels: string[];
  additives: string[];
  countries: string;
  grade: Grade;
  gradeSource: 'nutriscore' | 'computed';
  highlights: string[];
};

export type HistoryItem = {
  barcode: string;
  name: string;
  brand: string;
  image?: string;
  grade: Grade;
  scannedAt: number;
  calories: number | null;
};

export type AllergenOption = {
  id: string;
  label: string;
  icon: string;
  hint: string;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Product: { barcode: string; fromHistory?: boolean };
  Paywall: { reason?: string };
  Allergens: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  History: undefined;
  Search: undefined;
  Profile: undefined;
};
