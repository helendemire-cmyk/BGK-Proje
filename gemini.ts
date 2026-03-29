export type MineralAnalysis = {
  device_name: string
  gold_mg: number
  silver_mg: number
  copper_mg: number
  methodology_note: string
  did_you_know: string
}

/** PRD: Gemini 1.5 Flash */
const MODEL = 'gemini-1.5-flash'

const SYSTEM_INSTRUCTION = `Sen mineral işleme ve e-atık geri kazanımı konusunda konservatif tahminler yapan bir mühendis asistanısın.
Kullanıcının yazdığı cihaz (ör. akıllı telefon, tablet, dizüstü) için tipik bir ünite başına TAHMİNİ toplam içerik ver.
Değerleri geri dönüşüm literatürü ve tipik PCB/konnektör kompozisyonlarına dayalı makul aralıklarda tut; ondalıkları anlamlı yuvarla.
Yalnızca istenen JSON şemasına uygun yanıt ver; ek açıklama veya markdown yazma.`

export async function analyzeDevice(
  apiKey: string,
  deviceQuery: string,
): Promise<MineralAnalysis> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`

  const body = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Cihaz: "${deviceQuery.trim()}"

Tahmini toplam Au, Ag, Cu miktarlarını mg cinsinden ver (tek tipik cihaz için).
methodology_note: 1-2 cümle teknik özet (tahmin olduğunu belirt).
did_you_know: kentsel madencilik veya birincil maden çevresel yükü hakkında 1-2 cümle.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.35,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          device_name: { type: 'STRING' },
          gold_mg: { type: 'NUMBER' },
          silver_mg: { type: 'NUMBER' },
          copper_mg: { type: 'NUMBER' },
          methodology_note: { type: 'STRING' },
          did_you_know: { type: 'STRING' },
        },
        required: [
          'device_name',
          'gold_mg',
          'silver_mg',
          'copper_mg',
          'methodology_note',
          'did_you_know',
        ],
      },
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText || `Gemini API: ${res.status}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
    error?: { message?: string }
  }

  if (data.error?.message) {
    throw new Error(data.error.message)
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Model yanıtı boş veya engellendi (içerik filtresi).')
  }

  const parsed = JSON.parse(text) as MineralAnalysis
  return {
    device_name: String(parsed.device_name ?? deviceQuery),
    gold_mg: Number(parsed.gold_mg),
    silver_mg: Number(parsed.silver_mg),
    copper_mg: Number(parsed.copper_mg),
    methodology_note: String(parsed.methodology_note ?? ''),
    did_you_know: String(parsed.did_you_know ?? ''),
  }
}
