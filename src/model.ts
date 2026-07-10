export const FONT_OPTIONS = [
  {
    id: 'gothic',
    label: 'ゴシック体',
    family: '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif',
  },
  {
    id: 'mincho',
    label: '明朝体',
    family: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
  },
  {
    id: 'rounded',
    label: '丸ゴシック',
    family: '"Hiragino Maru Gothic ProN", "BIZ UDPGothic", "Yu Gothic", sans-serif',
  },
  {
    id: 'sans',
    label: '端末の標準',
    family: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
] as const

export type FontId = (typeof FONT_OPTIONS)[number]['id']
export type PreviewMode = 'grid' | 'flow'
export type Direction = 'horizontal' | 'vertical'
export type GuideStyle = 'full' | 'cross' | 'none'

export const MAX_CHARACTERS = 240

export interface ViewerState {
  text: string
  size: number
  spacing: number
  font: FontId
  mode: PreviewMode
  direction: Direction
  guide: GuideStyle
  mirrored: boolean
}

export const DEFAULT_STATE: ViewerState = {
  text: '字',
  size: 168,
  spacing: 8,
  font: 'sans',
  mode: 'grid',
  direction: 'horizontal',
  guide: 'full',
  mirrored: false,
}

const FONT_IDS = new Set(FONT_OPTIONS.map((font) => font.id))
const MODES = new Set<PreviewMode>(['grid', 'flow'])
const DIRECTIONS = new Set<Direction>(['horizontal', 'vertical'])
const GUIDES = new Set<GuideStyle>(['full', 'cross', 'none'])

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const finiteNumber = (value: string | null, fallback: number) => {
  if (value === null || value.trim() === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function segmentGraphemes(text: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

export function countCharacters(text: string): number {
  return segmentGraphemes(text.replace(/\r\n?|\n/g, '')).length
}

export function limitText(text: string, maxCharacters = MAX_CHARACTERS): string {
  const normalized = text.replace(/\r\n?/g, '\n')
  let characters = 0
  let lineBreaks = 0
  let limited = ''

  for (const grapheme of segmentGraphemes(normalized)) {
    if (grapheme === '\n') {
      if (lineBreaks < maxCharacters) {
        limited += grapheme
        lineBreaks += 1
      }
      continue
    }
    if (characters >= maxCharacters) break
    limited += grapheme
    characters += 1
  }

  return limited
}

export function resetViewerSettings(current: ViewerState): ViewerState {
  return { ...DEFAULT_STATE, text: current.text }
}

export function stateFromSearch(
  search: string,
  fallback: ViewerState = DEFAULT_STATE,
): ViewerState {
  const params = new URLSearchParams(search)
  const mode = params.get('mode') as PreviewMode | null
  const direction = params.get('direction') as Direction | null
  const guide = params.get('guide') as GuideStyle | null
  const font = params.get('font') as FontId | null

  return {
    text: limitText(params.get('s') ?? fallback.text),
    // `f` is kept for links created by Zimi v2.
    size: clamp(Math.round(finiteNumber(params.get('size') ?? params.get('f'), fallback.size)), 64, 280),
    spacing: clamp(Math.round(finiteNumber(params.get('spacing'), fallback.spacing)), 0, 32),
    font: font && FONT_IDS.has(font) ? font : fallback.font,
    mode: mode && MODES.has(mode) ? mode : fallback.mode,
    direction: direction && DIRECTIONS.has(direction) ? direction : fallback.direction,
    guide: guide && GUIDES.has(guide) ? guide : fallback.guide,
    mirrored: params.get('mirror') === '1' || (params.get('mirror') === null && fallback.mirrored),
  }
}

export function buildShareUrl(state: ViewerState, currentUrl: string): string {
  const url = new URL(currentUrl)
  url.search = ''
  url.hash = ''
  url.searchParams.set('s', state.text)
  url.searchParams.set('size', String(state.size))
  url.searchParams.set('spacing', String(state.spacing))
  url.searchParams.set('font', state.font)
  url.searchParams.set('mode', state.mode)
  url.searchParams.set('direction', state.direction)
  url.searchParams.set('guide', state.guide)
  if (state.mirrored) url.searchParams.set('mirror', '1')
  return url.toString()
}

export function readStoredState(storage: Pick<Storage, 'getItem'>): ViewerState {
  try {
    const stored = storage.getItem('zimi:viewer-state')
    if (!stored) return DEFAULT_STATE
    const parsed = JSON.parse(stored) as Partial<ViewerState>
    const search = new URLSearchParams()
    if (typeof parsed.text === 'string') search.set('s', parsed.text)
    if (typeof parsed.size === 'number') search.set('size', String(parsed.size))
    if (typeof parsed.spacing === 'number') search.set('spacing', String(parsed.spacing))
    if (typeof parsed.font === 'string') search.set('font', parsed.font)
    if (typeof parsed.mode === 'string') search.set('mode', parsed.mode)
    if (typeof parsed.direction === 'string') search.set('direction', parsed.direction)
    if (typeof parsed.guide === 'string') search.set('guide', parsed.guide)
    if (parsed.mirrored === true) search.set('mirror', '1')
    return stateFromSearch(`?${search.toString()}`)
  } catch {
    return DEFAULT_STATE
  }
}

export function fontFamily(fontId: FontId): string {
  return FONT_OPTIONS.find((font) => font.id === fontId)?.family ?? FONT_OPTIONS[0].family
}
