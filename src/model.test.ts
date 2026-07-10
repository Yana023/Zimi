import { describe, expect, it } from 'vitest'
import {
  DEFAULT_STATE,
  MAX_CHARACTERS,
  buildShareUrl,
  countCharacters,
  fontFamily,
  limitFontName,
  limitText,
  resetViewerSettings,
  segmentGraphemes,
  stateFromSearch,
} from './model'

describe('segmentGraphemes', () => {
  it('counts joined emoji and Japanese characters as visible characters', () => {
    expect(segmentGraphemes('永👨‍👩‍👧‍👦あ')).toEqual(['永', '👨‍👩‍👧‍👦', 'あ'])
    expect(countCharacters('永\nあ')).toBe(2)
  })
})

describe('default viewer state', () => {
  it('starts with 字 and cross guides', () => {
    expect(DEFAULT_STATE.text).toBe('字')
    expect(DEFAULT_STATE.guide).toBe('cross')
  })
})

describe('text input', () => {
  it('allows 240 supplementary-plane characters', () => {
    const text = limitText('𰻞'.repeat(MAX_CHARACTERS + 1))
    expect(countCharacters(text)).toBe(MAX_CHARACTERS)
    expect(text).toBe('𰻞'.repeat(MAX_CHARACTERS))
  })

  it('preserves line breaks without counting them as visible characters', () => {
    const text = limitText('春\n夏\n\n秋\n冬')
    expect(text).toBe('春\n夏\n\n秋\n冬')
    expect(countCharacters(text)).toBe(4)
  })

  it('resets display settings without clearing the entered text', () => {
    const reset = resetViewerSettings({
      ...DEFAULT_STATE,
      text: '残す文字',
      customFont: 'BIZ UDP明朝',
      font: 'custom',
      size: 280,
      mirrored: true,
    })
    expect(reset).toEqual({ ...DEFAULT_STATE, text: '残す文字' })
  })
})

describe('custom fonts', () => {
  it('limits font names and removes control characters', () => {
    expect(limitFontName(`  BIZ\nUDP明朝\u0000  `)).toBe('  BIZUDP明朝  ')
  })

  it('quotes custom family names and keeps a system fallback', () => {
    expect(fontFamily('custom', 'My "Font"')).toBe(
      '"My \\"Font\\"", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    )
    expect(fontFamily('custom', '')).toBe(
      'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    )
  })
})

describe('stateFromSearch', () => {
  it('supports legacy s and f parameters and clamps unsafe values', () => {
    const state = stateFromSearch('?s=%E5%AD%97&f=999&spacing=-8')
    expect(state.text).toBe('字')
    expect(state.size).toBe(280)
    expect(state.spacing).toBe(0)
  })

  it('ignores unknown enum values', () => {
    const state = stateFromSearch('?font=unknown&guide=rainbow')
    expect(state.font).toBe(DEFAULT_STATE.font)
    expect(state.guide).toBe(DEFAULT_STATE.guide)
  })
})

describe('share links', () => {
  it('round-trips viewer settings', () => {
    const expected = {
      ...DEFAULT_STATE,
      text: 'バランス',
      size: 212,
      spacing: 16,
      font: 'mincho' as const,
      direction: 'vertical' as const,
      mirrored: true,
    }
    const url = buildShareUrl(expected, 'https://example.com/zimi?old=yes#top')
    const parsed = stateFromSearch(new URL(url).search)
    expect(parsed).toEqual(expected)
    expect(new URL(url).hash).toBe('')
  })

  it('round-trips a user-specified font family', () => {
    const expected = {
      ...DEFAULT_STATE,
      font: 'custom' as const,
      customFont: 'BIZ UDP明朝',
    }
    const url = buildShareUrl(expected, 'https://example.com/zimi')
    expect(stateFromSearch(new URL(url).search)).toEqual(expected)
  })
})
