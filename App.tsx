import { useMemo, useState } from 'react'
import { analyzeDevice } from './lib/gemini'
import type { MineralAnalysis } from './lib/gemini'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? ''
const USD_TO_TRY = 38.5

const MARKET_PRICES_USD_PER_GRAM = {
  Au: 75,
  Ag: 0.95,
  Cu: 0.01,
} as const

type Listing = {
  id: string
  analysis: MineralAnalysis
  estimatedUsd: number
  estimatedTry: number
  recoveryRatePct: number
}

function calculateRecyclingValue(analysis: MineralAnalysis) {
  const auGram = analysis.gold_mg / 1000
  const agGram = analysis.silver_mg / 1000
  const cuGram = analysis.copper_mg / 1000

  const estimatedUsd =
    auGram * MARKET_PRICES_USD_PER_GRAM.Au +
    agGram * MARKET_PRICES_USD_PER_GRAM.Ag +
    cuGram * MARKET_PRICES_USD_PER_GRAM.Cu

  const estimatedTry = estimatedUsd * USD_TO_TRY
  return { estimatedUsd, estimatedTry }
}

function inferRecoveryRate(analysis: MineralAnalysis) {
  const weighted =
    analysis.gold_mg * 0.9 + analysis.silver_mg * 0.75 + analysis.copper_mg * 0.65
  const total = analysis.gold_mg + analysis.silver_mg + analysis.copper_mg
  if (total === 0) return 0
  return Math.max(15, Math.min(95, Number(((weighted / total) * 100).toFixed(1))))
}

function formatCurrency(value: number, currency: 'USD' | 'TRY') {
  const locale = currency === 'USD' ? 'en-US' : 'tr-TR'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function App() {
  const [deviceQuery, setDeviceQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<MineralAnalysis | null>(null)
  const [listings, setListings] = useState<Listing[]>([])

  const currentValue = useMemo(() => {
    if (!analysis) return null
    return calculateRecyclingValue(analysis)
  }, [analysis])

  const runAnalysis = async () => {
    const query = deviceQuery.trim()
    if (!query) {
      setError('Lutfen bir cihaz adi girin.')
      return
    }
    if (!apiKey) {
      setError('VITE_GEMINI_API_KEY bulunamadi. .env dosyasina anahtari ekleyin.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const data = await analyzeDevice(apiKey, query)
      setAnalysis(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analiz sirasinda hata olustu.')
    } finally {
      setLoading(false)
    }
  }

  const addListing = () => {
    if (!analysis) return
    const value = calculateRecyclingValue(analysis)
    const recoveryRatePct = inferRecoveryRate(analysis)
    const listing: Listing = {
      id: `${Date.now()}`,
      analysis,
      estimatedUsd: value.estimatedUsd,
      estimatedTry: value.estimatedTry,
      recoveryRatePct,
    }
    setListings((prev) => [listing, ...prev])
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-2xl border border-green-500/20 bg-zinc-900/70 p-6 shadow-lg shadow-green-500/5">
          <p className="text-xs uppercase tracking-[0.25em] text-green-400/80">
            E-Waste Marketplace
          </p>
          <h1 className="mt-2 text-3xl font-semibold">E-Atik Borsasi</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Gemini analizi ile cihaz icindeki Au, Ag, Cu miktarlarini hesapla; anlik
            piyasa degeriyle ilanlastir.
          </p>
        </section>

        <section className="rounded-2xl border border-green-500/20 bg-zinc-900/70 p-6 shadow-lg shadow-green-500/5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              value={deviceQuery}
              onChange={(e) => setDeviceQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
              placeholder="Orn: iPhone 13 Pro, Dell Latitude 7420"
              className="rounded-xl border border-green-500/20 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-green-400"
              disabled={loading}
            />
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="rounded-xl border border-green-500/40 bg-green-500/10 px-6 py-3 text-sm font-medium text-green-300 transition hover:shadow-lg hover:shadow-green-500/10 disabled:opacity-60"
            >
              {loading ? 'Analiz ediliyor...' : 'Gemini ile analiz et'}
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        </section>

        {analysis && currentValue ? (
          <section className="rounded-2xl border border-green-500/20 bg-zinc-900/70 p-6 shadow-lg shadow-green-500/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{analysis.device_name}</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Au: {(analysis.gold_mg / 1000).toFixed(4)} g • Ag:{' '}
                  {(analysis.silver_mg / 1000).toFixed(4)} g • Cu:{' '}
                  {(analysis.copper_mg / 1000).toFixed(4)} g
                </p>
              </div>
              <button
                onClick={addListing}
                className="rounded-xl border border-green-500/40 bg-green-500/10 px-5 py-2 text-sm font-medium text-green-300 transition hover:shadow-lg hover:shadow-green-500/10"
              >
                Aktif ilanlara ekle
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-green-500/20 bg-zinc-950 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Tahmini Geri Donusum Degeri (USD)
                </p>
                <p className="mt-1 text-2xl font-semibold text-green-300">
                  {formatCurrency(currentValue.estimatedUsd, 'USD')}
                </p>
              </div>
              <div className="rounded-xl border border-green-500/20 bg-zinc-950 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Tahmini Geri Donusum Degeri (TL)
                </p>
                <p className="mt-1 text-2xl font-semibold text-green-300">
                  {formatCurrency(currentValue.estimatedTry, 'TRY')}
                </p>
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-green-500/20 bg-zinc-950 p-3 text-sm text-zinc-300">
              Muhendislik Notu: {analysis.methodology_note} Bu cihazdan %
              {inferRecoveryRate(analysis)} oraninda mineral geri kazanimi
              hedeflenmektedir.
            </p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-green-500/20 bg-zinc-900/70 p-6 shadow-lg shadow-green-500/5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Aktif Ilanlar</h3>
            <span className="text-xs text-zinc-400">{listings.length} ilan</span>
          </div>
          {listings.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Henuz ilan yok. Analiz yapip "Aktif ilanlara ekle" butonunu kullan.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-xl border border-green-500/20 bg-zinc-950 p-4 transition hover:shadow-lg hover:shadow-green-500/10"
                >
                  <p className="text-sm font-medium text-zinc-100">
                    {listing.analysis.device_name}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                    <span className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-1">
                      Au
                    </span>
                    <span className="rounded-md border border-zinc-400/30 bg-zinc-400/10 px-2 py-1">
                      Ag
                    </span>
                    <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-1">
                      Cu
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm text-green-300">
                      {formatCurrency(listing.estimatedUsd, 'USD')}
                    </p>
                    <p className="text-sm text-green-300">
                      {formatCurrency(listing.estimatedTry, 'TRY')}
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-zinc-400">
                    Bu cihazdan %{listing.recoveryRatePct} oraninda mineral geri
                    kazanimi hedeflenmektedir.
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

