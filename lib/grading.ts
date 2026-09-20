import type { FoodProduct, Grade, Nutriments } from './types';

function num(v: number | null | undefined): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

export function computeGrade(n: Nutriments, nutriscore?: string): { grade: Grade; source: 'nutriscore' | 'computed' } {
  const ns = (nutriscore || '').toUpperCase();
  if (ns === 'A' || ns === 'B' || ns === 'C' || ns === 'D' || ns === 'E') {
    return { grade: ns === 'E' ? 'F' : (ns as Grade), source: 'nutriscore' };
  }

  let score = 70;
  const sugars = num(n.sugars);
  const sat = num(n.satFat);
  const salt = num(n.salt) || num(n.sodium) * 2.5;
  const kcal = num(n.kcal);
  const fiber = num(n.fiber);
  const protein = num(n.protein);

  if (sugars > 22) score -= 28;
  else if (sugars > 12) score -= 16;
  else if (sugars > 5) score -= 8;

  if (sat > 10) score -= 22;
  else if (sat > 5) score -= 12;
  else if (sat > 1.5) score -= 5;

  if (salt > 1.5) score -= 18;
  else if (salt > 0.9) score -= 10;
  else if (salt > 0.3) score -= 4;

  if (kcal > 500) score -= 10;
  else if (kcal > 350) score -= 5;

  if (fiber >= 6) score += 10;
  else if (fiber >= 3) score += 5;

  if (protein >= 12) score += 8;
  else if (protein >= 6) score += 4;

  let grade: Grade = 'C';
  if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';
  else grade = 'F';

  return { grade, source: 'computed' };
}

export function buildHighlights(product: Omit<FoodProduct, 'highlights'>): string[] {
  const n = product.nutriments;
  const out: string[] = [];
  const sugars = num(n.sugars);
  const sat = num(n.satFat);
  const salt = num(n.salt) || num(n.sodium) * 2.5;
  const fiber = num(n.fiber);
  const protein = num(n.protein);
  const kcal = num(n.kcal);

  if (product.grade === 'A') out.push('Nutrient-dense choice that fits most balanced diets.');
  if (product.grade === 'F') out.push('High in less-healthy nutrients — enjoy rarely, if at all.');
  if (sugars > 12) out.push(`High sugars (${sugars.toFixed(1)}g / 100g) can spike blood glucose.`);
  else if (sugars > 0 && sugars < 5) out.push('Low sugar — a plus for metabolic health.');
  if (sat > 5) out.push(`Saturated fat is elevated at ${sat.toFixed(1)}g / 100g.`);
  if (salt > 1.2) out.push(`Salty profile (${salt.toFixed(2)}g salt / 100g) — watch sodium.`);
  if (fiber >= 6) out.push(`Excellent fibre (${fiber.toFixed(1)}g) supports gut health.`);
  else if (fiber >= 3) out.push('Decent fibre content.');
  if (protein >= 10) out.push(`Solid protein (${protein.toFixed(1)}g / 100g) for satiety.`);
  if (kcal > 0 && kcal < 120) out.push('Light calorie density per 100g.');
  if (product.novaGroup === 4) out.push('Ultra-processed (NOVA 4) — ingredients are heavily refined.');
  else if (product.novaGroup === 1) out.push('Minimally processed whole food (NOVA 1).');
  if (product.additives.length > 4) out.push(`${product.additives.length} additives listed — prefer simpler recipes.`);
  if (!out.length) out.push('Scan more products to compare grades and find cleaner swaps.');
  return out.slice(0, 5);
}

export function dailyValue(amount: number | null, dv: number): number {
  if (amount == null || !dv) return 0;
  return Math.min(100, Math.round((amount / dv) * 100));
}

export const DV = {
  kcal: 2000,
  fat: 78,
  satFat: 20,
  carbs: 275,
  sugars: 50,
  fiber: 28,
  protein: 50,
  salt: 6,
  sodium: 2300,
};
