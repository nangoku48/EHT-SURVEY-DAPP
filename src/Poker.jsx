import React, { useState } from 'react'

const SUITS = [
  { s: '♠', color: 'black' },
  { s: '♥', color: 'red' },
  { s: '♦', color: 'red' },
  { s: '♣', color: 'black' },
]
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

function makeDeck(){
  const deck = []
  for(const suit of SUITS){
    for(const rank of RANKS){
      deck.push({ rank, suit: suit.s, color: suit.color })
    }
  }
  return deck
}

function shuffle(array){
  const a = array.slice()
  for(let i = a.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Poker(){
  const [hand, setHand] = useState([])
  const [flipped, setFlipped] = useState([])
  const [audioCtx, setAudioCtx] = useState(null)
  const [showDesc, setShowDesc] = useState(true)

  function deal(){
    const deck = makeDeck()
    const shuffled = shuffle(deck)
    const five = shuffled.slice(0,5)
    setHand(five)
    // reset flips
    setFlipped([false, false, false, false, false])

    // respect reduced-motion
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setFlipped([true, true, true, true, true])
      // evaluate quickly
      setTimeout(() => {
        if (hasPokerHand(five)) playCheer()
      }, 50)
      return
    }

    // sequential flip with click sounds
    five.forEach((_, i) => {
      setTimeout(() => {
        setFlipped(prev => {
          const copy = prev.slice()
          copy[i] = true
          return copy
        })
        playClick()
        // after last flip, evaluate
        if (i === 4) {
          setTimeout(() => {
            if (hasPokerHand(five)) playCheer()
          }, 300)
        }
      }, 300 + i * 220)
    })
  }

  // WebAudio helpers
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
    o.type = 'square'
    o.frequency.value = 720
    g.gain.value = 0.0001
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime + when
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.09, now + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
    o.start(now)
    o.stop(now + 0.14)
  }

  const playCheer = () => {
    const ctx = ensureAudio()
    if (!ctx) return
    const now = ctx.currentTime
    const freqs = [440, 550, 660, 880]
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sawtooth'
      o.frequency.value = f
      g.gain.value = 0.0001
      o.connect(g)
      g.connect(ctx.destination)
      const t = now + i * 0.09
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
      o.start(t)
      o.stop(t + 0.28)
    })
  }

  // simple poker hand detection: returns true if pair or better
  function hasPokerHand(cards) {
    if (!cards || cards.length < 5) return false
    const ranks = cards.map(c => rankToNum(c.rank)).sort((a,b)=>a-b)
    const suits = cards.map(c => c.suit)
    const counts = {}
    ranks.forEach(r => counts[r] = (counts[r]||0)+1)
    const freq = Object.values(counts).sort((a,b)=>b-a)
    const isFlush = suits.every(s => s === suits[0])
    const uniqueRanks = [...new Set(ranks)]
    let isStraight = false
    if (uniqueRanks.length === 5) {
      // normal straight
      const first = uniqueRanks[0]
      isStraight = uniqueRanks.every((v,i)=> v === first + i)
      // check A2345 (wheel)
      if (!isStraight) {
        const aceLow = ranks.map(r => r===14?1:r).sort((a,b)=>a-b)
        isStraight = aceLow.every((v,i)=> v === aceLow[0] + i)
      }
    }
    if (isStraight && isFlush) return true
    if (freq[0] >= 4) return true // four of a kind
    if (freq[0] === 3 && freq[1] === 2) return true // full house
    if (isFlush) return true
    if (isStraight) return true
    if (freq[0] === 3) return true // three of a kind
    if (freq[0] === 2 && freq[1] === 2) return true // two pair
    if (freq[0] === 2) return true // one pair
    return false
  }

  function rankToNum(r) {
    if (r === 'A') return 14
    if (r === 'J') return 11
    if (r === 'Q') return 12
    if (r === 'K') return 13
    return parseInt(r,10)
  }

  return (
    <div className="poker-container" role="region" aria-label="Poker - Deal five cards">
      <h2 className="game-title">貧乏ポーカー</h2>

      {showDesc ? (
        <div className="game-area glass-panel" style={{maxWidth:480, margin:'40px auto'}}>
          <div className="start-desc" role="note">
            <p>貧乏ポーカーとは、お金がないから見るだけで遊ぶゲームです。</p>
            <p>賭けや払う操作はありません。カードを見て、組み合わせを楽しみましょう。</p>
          </div>
          <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:18}}>
            <button className="neon-button" onClick={() => setShowDesc(false)} aria-label="Start poker">見るだけで遊ぶ</button>
            <button className="neon-button small" onClick={() => setShowDesc(false)} aria-label="Skip">SKIP</button>
          </div>
        </div>
      ) : (
        <>
          <div className="poker-controls" role="toolbar" aria-label="Poker controls">
            <button className="neon-button small" onClick={deal} aria-label="Deal five cards">カードをめくる</button>
            {hand.length>0 && (
              <button className="neon-button small" onClick={()=>{ setHand([]); setFlipped([]); }} aria-label="Clear hand">クリア</button>
            )}
          </div>

          <div className="poker-hand" aria-live="polite">
            {hand.length === 0 ? (
              <div className="start-desc">「カードをめくる」を押すとランダムに5枚が配られます。見て楽しんでください。</div>
            ) : (
              hand.map((c, idx) => (
                <div key={idx} className={`poker-card ${flipped[idx] ? 'flipped' : ''}`} tabIndex="0" aria-label={`Card ${idx+1}: ${c.rank} ${c.suit}`}>
                  {!flipped[idx] ? (
                    <div className="card-face">?
                    </div>
                  ) : (
                    <div className={`card-face ${c.color === 'red' ? 'red' : 'black'}`}>
                      <div className="card-rank">{c.rank}</div>
                      <div className="card-suit">{c.suit}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
