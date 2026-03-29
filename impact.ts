/**
 * Birincil madencilikten kaçınmaya yönelik gösterge değerleri (eğitim / farkındalık).
 * PRD: 1 g Au geri kazanımı ≈ 1000 L su; diğerleri literatür mertebesi.
 */
const L_WATER_PER_G_AU = 1000
const L_WATER_PER_G_AG = 200
const L_WATER_PER_G_CU = 0.2

const KG_CO2E_PER_G_AU = 11
const KG_CO2E_PER_G_AG = 0.45
const KG_CO2E_PER_G_CU = 0.004

export type MassesMg = {
  gold_mg: number
  silver_mg: number
  copper_mg: number
}

function toGrams(mg: number): number {
  return Math.max(0, mg) / 1000
}

export function computeImpact(m: MassesMg): {
  waterLiters: number
  co2Kg: number
} {
  const au = toGrams(m.gold_mg)
  const ag = toGrams(m.silver_mg)
  const cu = toGrams(m.copper_mg)

  const waterLiters =
    au * L_WATER_PER_G_AU + ag * L_WATER_PER_G_AG + cu * L_WATER_PER_G_CU

  const co2Kg =
    au * KG_CO2E_PER_G_AU + ag * KG_CO2E_PER_G_AG + cu * KG_CO2E_PER_G_CU

  return {
    waterLiters: Math.round(waterLiters * 10) / 10,
    co2Kg: Math.round(co2Kg * 1000) / 1000,
  }
}

export const IMPACT_COEFFICIENTS_TEXT =
  'Su: Au 1000 L/g, Ag 200 L/g, Cu 0,2 L/g. CO₂e: Au 11 kg/g, Ag 0,45 kg/g, Cu 0,004 kg/g (mertebe tahmini, birincil üretimden kaçınma göstergesi).'

export function formatMassMg(mg: number): string {
  if (!Number.isFinite(mg) || mg < 0) return '—'
  if (mg >= 1000) return `${(mg / 1000).toFixed(3)} g`
  if (mg >= 1) return `${mg.toFixed(2)} mg`
  return `${mg.toFixed(3)} mg`
}

export function formatMassMgAlt(mg: number): string {
  if (!Number.isFinite(mg) || mg < 0) return ''
  const g = mg / 1000
  if (mg >= 1000) return `${mg.toFixed(1)} mg eşdeğeri`
  return `${g.toFixed(4)} g`
}
