import React, { useState } from 'react'

const categories = {
  savings: {
    question: "現在の資産",
    options: [
      { label: "100ペリカ", value: 100 },
      { label: "0円", value: 0 },
      { label: "10万", value: 100000 },
      { label: "100万", value: 1000000 },
      { label: "1000万", value: 10000000 },
      { label: "1億", value: 100000000 },
      { label: "孫正義", value: 1000000000 }
    ]
  },
  skills: {
    question: "保有スキル",
    options: [
      { label: "無銭飲食", value: -50000 },
      { label: "リファ", value: 20000 },
      { label: "クレクレ", value: -30000 },
      { label: "リサーチ", value: 80000 },
      { label: "節約貯金", value: 150000 },
      { label: "風俗", value: 100000 }
    ]
  },
  hobbies: {
    question: "趣味・投資",
    options: [
      { label: "アムウェイ", value: -100000 },
      { label: "無銭飲食", value: -80000 },
      { label: "ポイ活", value: 50000 },
      { label: "パパ活", value: 200000 },
      { label: "ギャンブル", value: -200000 },
      { label: "風俗", value: -150000 }
    ]
  }
}

export default function Game() {
  const [gameState, setGameState] = useState('start')
  const [cards, setCards] = useState([])
  const [result, setResult] = useState(null)
  const [flipped, setFlipped] = useState([false, false, false])
  const [audioCtx, setAudioCtx] = useState(null)

  // WebAudio helpers (synth click and cheer)
  const ensureAudio = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      setAudioCtx(ctx)
      return ctx
    }
    return audioCtx
  }

  const playClick = (when = 0) => {
    const ctx = ensureAudio()
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 800
    g.gain.value = 0.0001
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime + when
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
    o.start(now)
    o.stop(now + 0.15)
  }

  const playCheer = () => {
    const ctx = ensureAudio()
    if (!ctx) return
    // simple short rising arpeggio
    const now = ctx.currentTime
    const notes = [440, 660, 880]
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sawtooth'
      o.frequency.value = freq
      g.gain.value = 0.0001
      o.connect(g)
      g.connect(ctx.destination)
      const t = now + i * 0.08
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
      o.start(t)
      o.stop(t + 0.25)
    })
  }

  const startGame = () => {
    setGameState('playing')
    const newCards = []

    Object.keys(categories).forEach(key => {
      const category = categories[key]
      const randomOption = category.options[Math.floor(Math.random() * category.options.length)]
      newCards.push({ ...randomOption, category: category.question, key })
    })

    setCards(newCards)
    setFlipped([false, false, false])
    // respect prefers-reduced-motion
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      // instantly reveal and no sounds
      setFlipped([true, true, true])
      calculateResult(newCards)
      return
    }

    // sequential flip with sound
    newCards.forEach((_, i) => {
      setTimeout(() => {
        setFlipped(prev => {
          const copy = [...prev]
          copy[i] = true
          return copy
        })
        playClick()
      }, 400 + i * 400)
    })

    // calculate result after flips
    setTimeout(() => {
      calculateResult(newCards)
      playCheer()
    }, 400 + newCards.length * 400 + 500)
  }

  const calculateResult = (selectedCards) => {
    let total = 0
    selectedCards.forEach(c => total += c.value)
    const futureAmount = Math.max(0, total * 10)

    setResult({
      amount: futureAmount,
      cards: selectedCards,
      analysis: generateAnalysis(futureAmount)
    })
    setGameState('result')
  }

  const generateAnalysis = (amount) => {
    if (amount >= 10000000000) return '🎉 素晴らしい！あなたは孫正義レベルの大富豪になる可能性があります！リサーチ力と節約スキルを活かし、さらに収入を増やしているようですね。'
    if (amount >= 1000000000) return '💎 素晴らしい結果です！10年後には億万長者の仲間入りです。堅実な貯金スキルと賢い選択が功を奏しています。'
    if (amount >= 100000000) return '🏆 すごい！1億円以上の貯金が見込めます。リサーチ力を活かして賢く資産を増やしていますね。'
    if (amount >= 10000000) return '✨ かなり良い結果です！1000万円以上の貯金ができそうです。ポイ活やリファで着実に収入を増やしていますね。'
    if (amount >= 1000000) return '👍 まずまずの結果です。100万円以上の貯金が見込めます。節約を続ければさらに増えるでしょう。'
    if (amount >= 100000) return '😊 悪くない結果です。10万円以上は貯められそうです。無駄遣いを減らせばもっと増やせます。'
    if (amount > 0) return '🤔 少し厳しい結果ですね。ギャンブルや無銭飲食は控えめにして、節約を心がけましょう。'
    return '😅 かなり厳しい結果です...。アムウェイやギャンブルからは距離を置き、リサーチスキルを磨いて収入を増やしましょう！'
  }

  return (
    <div className="game-container">
      {/* 背景のエフェクト */}
      <div className="glow-effect" aria-hidden="true"></div>

      <h1 className="game-title">FUTURE WEALTH</h1>
      <div className="game-subtitle">将来金持ち？診断ゲーム</div>

      <div className="game-area glass-panel">
        {gameState === 'start' && (
           <div className="start-screen">
             <div className="icon-3d" aria-hidden="true">💎</div>
             <div className="start-desc" role="note">
               <p>この診断では、ランダムに3枚のカードを配り、あなたの10年後の資産を予想します。</p>
               <p>カードは「現在の資産」「保有スキル」「趣味・投資」から選ばれ、引いたカードの組み合わせで診断結果が決まります。</p>
             </div>
             <button className="neon-button" onClick={startGame} aria-label="Start diagnosis">
               DIAGNOSIS START
             </button>
           </div>
        )}

        {gameState === 'playing' && (
          <div className="cards-container" role="region" aria-live="polite" aria-label="Card draws">
            {[0, 1, 2].map(i => (
              <div key={i} className={`cyber-card ${flipped[i] ? 'flipped' : ''}`} aria-hidden={flipped[i] ? 'false' : 'true'}>
                <div className="card-inner">
                  <div className="card-front">
                    <div className="card-icon">⚡</div>
                    <div className="card-title">SYNTH</div>
                  </div>
                  <div className="card-back">
                    <div className="back-label">{cards[i] ? cards[i].label : '...'}</div>
                    <div className="back-value">{cards[i] ? `+${cards[i].value.toLocaleString()}` : ''}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="loading-text" aria-live="polite">Analyzing Blockchain...</div>
          </div>
        )}

        {gameState === 'result' && result && (
          <div className="result-section" role="status" aria-live="polite">
            <div className="result-label">ESTIMATED ASSETS</div>
            <div className="result-amount">
              <span className="currency">¥</span>
              {result.amount.toLocaleString()}
            </div>

            <div className="result-grid">
              {result.cards.map((card, index) => (
                <div key={index} className="result-item">
                  <div className="item-label">{card.category}</div>
                  <div className="item-value">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="analysis-box">
              {result.analysis}
            </div>

            <button className="neon-button small" onClick={startGame} aria-label="Retry diagnosis">
              RETRY
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
