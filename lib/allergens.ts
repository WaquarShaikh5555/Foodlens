import type { AllergenOption } from './types';

export const ALLERGEN_OPTIONS: AllergenOption[] = [
  { id: 'en:gluten', label: 'Gluten', icon: 'nutrition-outline', hint: 'Wheat, barley, rye, oats' },
  { id: 'en:milk', label: 'Milk / Dairy', icon: 'water-outline', hint: 'Lactose, casein, whey' },
  { id: 'en:eggs', label: 'Eggs', icon: 'egg-outline', hint: 'Albumin, mayonnaise' },
  { id: 'en:peanuts', label: 'Peanuts', icon: 'leaf-outline', hint: 'Groundnuts, arachis' },
  { id: 'en:nuts', label: 'Tree Nuts', icon: 'git-branch-outline', hint: 'Almonds, cashews, walnuts' },
  { id: 'en:soybeans', label: 'Soy', icon: 'flower-outline', hint: 'Tofu, lecithin, edamame' },
  { id: 'en:fish', label: 'Fish', icon: 'fish-outline', hint: 'Anchovy, tuna, surimi' },
  { id: 'en:crustaceans', label: 'Shellfish', icon: 'restaurant-outline', hint: 'Shrimp, crab, lobster' },
  { id: 'en:molluscs', label: 'Molluscs', icon: 'ellipse-outline', hint: 'Mussels, squid, clams' },
  { id: 'en:sesame-seeds', label: 'Sesame', icon: 'sunny-outline', hint: 'Tahini, sesame oil' },
  { id: 'en:celery', label: 'Celery', icon: 'leaf-outline', hint: 'Celeriac, celery salt' },
  { id: 'en:mustard', label: 'Mustard', icon: 'flame-outline', hint: 'Dijon, mustard seed' },
  { id: 'en:sulphur-dioxide-and-sulphites', label: 'Sulphites', icon: 'flask-outline', hint: 'Wine, dried fruit' },
  { id: 'en:lupin', label: 'Lupin', icon: 'flower-outline', hint: 'Lupini beans, flour' },
];

export const ALLERGEN_LABELS: Record<string, string> = {
  'en:gluten': 'Gluten',
  'en:milk': 'Milk',
  'en:eggs': 'Eggs',
  'en:peanuts': 'Peanuts',
  'en:nuts': 'Tree nuts',
  'en:soybeans': 'Soy',
  'en:fish': 'Fish',
  'en:crustaceans': 'Crustaceans',
  'en:molluscs': 'Molluscs',
  'en:sesame-seeds': 'Sesame',
  'en:celery': 'Celery',
  'en:mustard': 'Mustard',
  'en:sulphur-dioxide-and-sulphites': 'Sulphites',
  'en:lupin': 'Lupin',
};

export function prettyAllergen(tag: string): string {
  if (ALLERGEN_LABELS[tag]) return ALLERGEN_LABELS[tag];
  return tag
    .replace(/^en:/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function matchesUserAllergen(productTags: string[], userAllergens: string[]): string[] {
  const hits: string[] = [];
  for (const ua of userAllergens) {
    const found = productTags.some((t) => t === ua || t.includes(ua.replace('en:', '')));
    if (found) hits.push(ua);
  }
  return hits;
}
