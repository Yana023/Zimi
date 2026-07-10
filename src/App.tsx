import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Expand,
  Eye,
  Grid3X3,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
  Type,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  DEFAULT_STATE,
  FONT_OPTIONS,
  buildShareUrl,
  countCharacters,
  fontFamily,
  readStoredState,
  segmentGraphemes,
  stateFromSearch,
  type Direction,
  type GuideStyle,
  type PreviewMode,
  type ViewerState,
} from './model'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const examples = ['字', '𰻞𰻞麺', '春夏秋冬']

function initialState(): ViewerState {
  const stored = readStoredState(window.localStorage)
  const params = new URLSearchParams(window.location.search)
  const sharedKeys = ['s', 'f', 'size', 'spacing', 'font', 'mode', 'direction', 'guide', 'mirror']
  const hasSharedState = sharedKeys.some((key) => params.has(key))
  return hasSharedState ? stateFromSearch(window.location.search, stored) : stored
}

function App() {
  const [viewer, setViewer] = useState<ViewerState>(initialState)
  const [notice, setNotice] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(() => window.matchMedia('(min-width: 981px)').matches)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const previewRef = useRef<HTMLElement>(null)
  const noticeTimer = useRef<number | undefined>(undefined)

  const update = <Key extends keyof ViewerState>(key: Key, value: ViewerState[Key]) => {
    setViewer((current) => ({ ...current, [key]: value }))
  }

  const showNotice = useCallback((message: string) => {
    window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2400)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('zimi:viewer-state', JSON.stringify(viewer))
  }, [viewer])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    const onInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    window.addEventListener('beforeinstallprompt', onInstallPrompt)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      window.removeEventListener('beforeinstallprompt', onInstallPrompt)
      window.clearTimeout(noticeTimer.current)
    }
  }, [])

  useEffect(() => {
    const wideScreen = window.matchMedia('(min-width: 981px)')
    const syncOptionsVisibility = () => setOptionsOpen(wideScreen.matches)
    wideScreen.addEventListener('change', syncOptionsVisibility)
    return () => wideScreen.removeEventListener('change', syncOptionsVisibility)
  }, [])

  const copyShareLink = async () => {
    try {
      const url = buildShareUrl(viewer, window.location.href)
      await navigator.clipboard.writeText(url)
      showNotice('表示設定を含むリンクをコピーしました')
    } catch {
      showNotice('コピーできませんでした。ブラウザの権限をご確認ください')
    }
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await previewRef.current?.requestFullscreen()
      }
    } catch {
      showNotice('この環境では全画面表示を利用できません')
    }
  }

  const installApp = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') showNotice('Zimiをインストールしました')
    setInstallPrompt(null)
  }

  const reset = () => {
    setViewer(DEFAULT_STATE)
    showNotice('表示設定を初期状態に戻しました')
  }

  const count = useMemo(() => countCharacters(viewer.text), [viewer.text])

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="./" aria-label="Zimi ホーム">
          <img
            className="brand-mark"
            src={`${import.meta.env.BASE_URL}zimi-192.png`}
            alt=""
            aria-hidden="true"
          />
          <span>
            <strong>Zimi</strong>
            <small>文字を、よく見る。</small>
          </span>
        </a>
        <div className="topbar-actions">
          {installPrompt && (
            <button className="button button-quiet install-button" type="button" onClick={installApp}>
              <Download size={17} />
              アプリとして使う
            </button>
          )}
          <button className="button button-primary" type="button" onClick={copyShareLink}>
            <Copy size={17} />
            リンクをコピー
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="control-panel" aria-label="表示設定">
          <section className="control-section input-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">INPUT</p>
                <h1>見たい文字</h1>
              </div>
              <span className="count">{count} / 240</span>
            </div>
            <div className="textarea-wrap">
              <textarea
                value={viewer.text}
                maxLength={240}
                rows={3}
                aria-label="拡大して見たい文字"
                placeholder="文字を入力してください"
                autoFocus
                onChange={(event) => update('text', event.target.value)}
              />
              {viewer.text && (
                <button
                  className="icon-button clear-button"
                  type="button"
                  aria-label="入力を消去"
                  title="入力を消去"
                  onClick={() => update('text', '')}
                >
                  <X size={17} />
                </button>
              )}
            </div>
            <div className="examples" aria-label="入力例">
              <span>例</span>
              {examples.map((example) => (
                <button type="button" key={example} onClick={() => update('text', example)}>
                  {example}
                </button>
              ))}
            </div>
          </section>

          <details
            className="options-disclosure"
            open={optionsOpen}
            onToggle={(event) => setOptionsOpen(event.currentTarget.open)}
          >
            <summary>
              <span className="options-summary-title">
                <SlidersHorizontal size={17} />
                表示オプション
              </span>
              <span className="options-summary-value">
                {viewer.size}px · {FONT_OPTIONS.find((font) => font.id === viewer.font)?.label}
              </span>
              <ChevronDown className="options-chevron" size={18} aria-hidden="true" />
            </summary>

            <div className="options-content">
              <section className="control-section">
                <div className="control-label-row">
                  <label htmlFor="size">文字の大きさ</label>
                  <output htmlFor="size">{viewer.size}px</output>
                </div>
                <input
                  id="size"
                  className="range"
                  type="range"
                  min="64"
                  max="280"
                  step="4"
                  value={viewer.size}
                  onChange={(event) => update('size', Number(event.target.value))}
                />
                <div className="range-labels" aria-hidden="true">
                  <span>小さく</span>
                  <span>大きく</span>
                </div>

                <div className="control-label-row control-label-spaced">
                  <label htmlFor="spacing">字間</label>
                  <output htmlFor="spacing">{viewer.spacing}px</output>
                </div>
                <input
                  id="spacing"
                  className="range"
                  type="range"
                  min="0"
                  max="32"
                  step="2"
                  value={viewer.spacing}
                  onChange={(event) => update('spacing', Number(event.target.value))}
                />
              </section>

              <section className="control-section settings-grid">
                <label className="select-field">
                  <span>書体</span>
                  <select
                    value={viewer.font}
                    onChange={(event) => update('font', event.target.value as ViewerState['font'])}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option value={font.id} key={font.id}>{font.label}</option>
                    ))}
                  </select>
                </label>

                <SegmentedControl<PreviewMode>
                  label="表示"
                  value={viewer.mode}
                  options={[['grid', '一字ずつ'], ['flow', '文章']]}
                  onChange={(value) => update('mode', value)}
                />
                <SegmentedControl<Direction>
                  label="方向"
                  value={viewer.direction}
                  options={[['horizontal', '横書き'], ['vertical', '縦書き']]}
                  onChange={(value) => update('direction', value)}
                />
                <SegmentedControl<GuideStyle>
                  label="補助線"
                  value={viewer.guide}
                  options={[['full', '方眼'], ['cross', '十字'], ['none', 'なし']]}
                  onChange={(value) => update('guide', value)}
                />

                <label className="switch-row">
                  <span>
                    <strong>左右反転</strong>
                    <small>裏側から見た形を確認</small>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={viewer.mirrored}
                    onChange={(event) => update('mirrored', event.target.checked)}
                  />
                </label>
              </section>

              <button className="reset-button" type="button" onClick={reset}>
                <RotateCcw size={15} />
                設定を初期化
              </button>
            </div>
          </details>
        </aside>

        <Preview
          viewer={viewer}
          count={count}
          previewRef={previewRef}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </main>

      <footer>
        <span>Zimi v3 · Yana023 &amp; gpt5.6sol</span>
        <span>入力内容はこの端末内に保存されます</span>
      </footer>
      <div className={`toast ${notice ? 'toast-visible' : ''}`} role="status" aria-live="polite">
        {notice && <><Check size={16} />{notice}</>}
      </div>
    </div>
  )
}

interface SegmentedControlProps<Value extends string> {
  label: string
  value: Value
  options: readonly (readonly [Value, string])[]
  onChange: (value: Value) => void
}

function SegmentedControl<Value extends string>({ label, value, options, onChange }: SegmentedControlProps<Value>) {
  return (
    <fieldset className="segmented-field">
      <legend>{label}</legend>
      <div className="segmented-control">
        {options.map(([optionValue, optionLabel]) => (
          <button
            type="button"
            key={optionValue}
            aria-pressed={value === optionValue}
            onClick={() => onChange(optionValue)}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

interface PreviewProps {
  viewer: ViewerState
  count: number
  previewRef: React.RefObject<HTMLElement | null>
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

function Preview({ viewer, count, previewRef, isFullscreen, onToggleFullscreen }: PreviewProps) {
  const family = fontFamily(viewer.font)
  const stageStyle = {
    '--character-size': `${viewer.size}px`,
    '--character-gap': `${viewer.spacing}px`,
    '--preview-font': family,
  } as CSSProperties

  return (
    <section className="preview-panel" ref={previewRef} aria-labelledby="preview-title">
      <div className="preview-toolbar">
        <div>
          <p className="eyebrow">PREVIEW</p>
          <h2 id="preview-title"><Eye size={19} />文字のかたち</h2>
        </div>
        <div className="preview-actions">
          <span>{count}文字</span>
          <span>{viewer.size}px</span>
          <button
            className="icon-button fullscreen-button"
            type="button"
            aria-label={isFullscreen ? '全画面を終了' : '全画面で表示'}
            title={isFullscreen ? '全画面を終了' : '全画面で表示'}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={19} /> : <Expand size={19} />}
          </button>
        </div>
      </div>

      <div
        className={`preview-stage mode-${viewer.mode} direction-${viewer.direction}`}
        style={stageStyle}
        role="img"
        aria-label={viewer.text ? `「${viewer.text}」の拡大表示` : '文字が未入力です'}
      >
        {viewer.text ? (
          viewer.mode === 'grid'
            ? <GridPreview viewer={viewer} />
            : <FlowPreview viewer={viewer} />
        ) : (
          <div className="empty-preview">
            <Type size={34} strokeWidth={1.5} />
            <strong>左の欄に文字を入力してください</strong>
            <span>入力した文字がここに大きく表示されます</span>
          </div>
        )}
      </div>
      <div className="preview-hint">
        <Grid3X3 size={15} />
        方眼の交点を基準に、文字の中心・余白・傾きを確認できます
      </div>
    </section>
  )
}

function GridPreview({ viewer }: { viewer: ViewerState }) {
  const lines = viewer.text.replace(/\r/g, '').split('\n')
  const LineTag = viewer.direction === 'vertical' ? 'div' : 'div'
  return (
    <div className={`character-lines ${viewer.direction}`}>
      {lines.map((line, lineIndex) => (
        <LineTag className="character-line" key={`${lineIndex}-${line}`}>
          {segmentGraphemes(line).map((character, characterIndex) => (
            <span
              className={`character-cell guide-${viewer.guide}`}
              key={`${characterIndex}-${character}`}
              aria-hidden="true"
            >
              <span className={viewer.mirrored ? 'glyph mirrored' : 'glyph'}>{character}</span>
            </span>
          ))}
          {line.length === 0 && <span className="empty-line" aria-hidden="true" />}
        </LineTag>
      ))}
    </div>
  )
}

function FlowPreview({ viewer }: { viewer: ViewerState }) {
  return (
    <div
      className={`flow-preview ${viewer.mirrored ? 'mirrored' : ''} guide-${viewer.guide}`}
      dir="auto"
    >
      {viewer.text}
    </div>
  )
}

export default App
