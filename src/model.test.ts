import { describe, expect, it } from 'vitest'
import {
  DEFAULT_STATE,
  buildShareUrl,
  countCharacters,
  segmentGraphemes,
  stateFromSearch,
} from './model'

describe('segmentGraphemes', () => {
  it('counts joined emoji and Japanese characters as visible characters', () => {
    expect(segmentGraphemes('永👨‍👩‍👧‍👦あ')).toEqual(['永', '👨‍👩‍👧‍👦', 'あ'])
    expect(countCharacters('永\nあ')).toBe(2)
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
})
