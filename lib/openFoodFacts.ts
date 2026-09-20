import { buildHighlights, computeGrade } from './grading';
import type { FoodProduct, Nutriments } from './types';

const USER_AGENT = 'FoodLens/1.0 (nutrition-scanner; expo)';

function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
}

function pickNutriments(raw: Record<string, unknown> | undefined): Nutriments {
  const n = raw || {};
  const kcal =
    toNum(n['energy-kcal_100g']) ??
    toNum(n['energy-kcal']) ??
    (toNum(n['energy_100g']) != null ? Math.round((toNum(n['energy_100g']) as number) / 4.184) : null);
  return {
    kcal,
    fat: toNum(n.fat_100g) ?? toNum(n.fat),
    satFat: toNum(n['saturated-fat_100g']) ?? toNum(n['saturated-fat']),
    carbs: toNum(n.carbohydrates_100g) ?? toNum(n.carbohydrates),
    sugars: toNum(n.sugars_100g) ?? toNum(n.sugars),
    fiber: toNum(n.fiber_100g) ?? toNum(n.fiber),
    protein: toNum(n.proteins_100g) ?? toNum(n.proteins),
    salt: toNum(n.salt_100g) ?? toNum(n.salt),
    sodium: toNum(n.sodium_100g) ?? toNum(n.sodium),
  };
}

export function mapOffProduct(p: Record<string, unknown>, barcode: string): FoodProduct {
  const nutriments = pickNutriments(p.nutriments as Record<string, unknown> | undefined);
  const nutriscore = String(p.nutriscore_grade || p.nutrition_grade_fr || '').toLowerCase();
  const { grade, source } = computeGrade(nutriments, nutriscore);
  const allergensTags = asArray(p.allergens_tags);
  const product: Omit<FoodProduct, 'highlights'> = {
    barcode: String(p.code || barcode),
    name: String(p.product_name || p.product_name_en || p.generic_name || 'Unknown product'),
    brand: String(p.brands || 'Unknown brand'),
    quantity: String(p.quantity || ''),
    servingSize: String(p.serving_size || ''),
    image: (p.image_front_url || p.image_url || p.image_small_url) as string | undefined,
    ingredients: String(p.ingredients_text || p.ingredients_text_en || ''),
    allergensTags,
    allergensText: String(p.allergens || ''),
    traces: String(p.traces || ''),
    nutriments,
    nutriscore: nutriscore || undefined,
    novaGroup: typeof p.nova_group === 'number' ? p.nova_group : undefined,
    categories: String(p.categories || ''),
    labels: asArray(p.labels_tags),
    additives: asArray(p.additives_tags),
    countries: String(p.countries || ''),
    grade,
    gradeSource: source,
  };
  return { ...product, highlights: buildHighlights(product) };
}

export async function fetchByBarcode(barcode: string): Promise<FoodProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Open Food Facts error (${res.status})`);
  const json = await res.json();
  if (!json || json.status !== 1 || !json.product) return null;
  return mapOffProduct(json.product, barcode);
}

export async function searchProducts(query: string): Promise<FoodProduct[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}` +
    `&search_simple=1&action=process&json=1&page_size=24`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const json = await res.json();
  const products: Record<string, unknown>[] = Array.isArray(json.products) ? json.products : [];
  return products
    .filter((p) => p && (p.product_name || p.product_name_en) && p.code)
    .map((p) => mapOffProduct(p, String(p.code || '')))
    .slice(0, 24);
}

export const FEATURED_BARCODES = [
  '3017620422003',
  '5449000000996',
  '5000159407236',
  '7622210449283',
  '0049000057045',
  '0737628064502',
  '0078742237051',
  '0041570054523',
];
