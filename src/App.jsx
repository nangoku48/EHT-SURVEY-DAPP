import React, { useState, useEffect } from 'react'
import { useSignMessage, useAccount } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
// 作ったゲームを読み込みます
import Game from './Game'
import Poker from './Poker'

function App() {
  const { open } = useWeb3Modal()
  const { isConnected } = useAccount()
  const { signMessage } = useSignMessage()
  const [signature, setSignature] = useState(null)
  
  // ゲーム画面を表示するかどうかのスイッチ
  const [showGame, setShowGame] = useState(false)
  // どのゲームを開くか
  const [activeGame, setActiveGame] = useState(null)
  // show description for wealth game when entering it
  const [showWealthDesc, setShowWealthDesc] = useState(true)

  const handleSign = () => {
    signMessage({ 
      message: `南国といいます。
アプリをつくってみたくて色々チャレンジしてます。
ここにきてくれてありがとうございます。
私はクリーニング屋出身なので悪い事はしません。
みんな捨てアドレスで繋いであそんでくださいね。
ありがとう。オリゴ糖(^^)/` 
    }, {
      onSuccess: (data) => {
        setSignature(data)
        // 署名成功の2秒後にゲーム選択画面へ
        setTimeout(() => {
          setShowGame(true)
        }, 2000)
      }
    })
  }

  // 自動署名
  useEffect(() => {
    if (isConnected && !signature) {
      handleSign()
    }
  }, [isConnected, signature])

  const handleBtnClick = () => {
    if (isConnected && !signature) {
      handleSign()
    } else {
      open()
    }
  }

  // ゲームモード：メニューでゲームを選ぶ or 選ばれたゲームを表示
  if (showGame) {
    if (!activeGame) {
      return (
        <div className="game-select-bg">
          <div className="game-select-overlay">
            <div className="top-left-area">
              <button className="green-button" onClick={() => setShowGame(false)}>← BACK</button>
            </div>
              <div className="game-select-buttons">
              <button className="neon-button large btn-wealth" onClick={() => { setActiveGame('wealth'); setShowWealthDesc(true); }}>金持ちゲーム</button>
              <button className="neon-button large btn-poor" onClick={() => { setActiveGame('poor'); }}>貧乏ゲーム</button>
            </div>
          </div>
        </div>
      )
    }

    // 金持ちゲーム：説明→診断
    if (activeGame === 'wealth') {
      if (showWealthDesc) {
        return (
          <div className="game-container">
            <div className="top-left-area">
              <button className="green-button" onClick={() => setActiveGame(null)}>← Menu</button>
            </div>
            <div className="game-area glass-panel" style={{ maxWidth: 380, margin: '60px auto' }}>
              <div className="game-title">金持ちゲーム</div>
              <div className="start-desc">
                <p>3枚のカードがランダムに選ばれ、あなたの未来の資産を診断します。</p>
                <p>カードは「職業」「住まい」「趣味」の3カテゴリから1枚ずつ。<br />診断結果は10年後の資産予測と分析コメントが表示されます。</p>
              </div>
              <button className="neon-button" onClick={() => setShowWealthDesc(false)}>診断スタート</button>
            </div>
          </div>
        )
      }
      return (
        <>
          <div className="top-left-area">
            <button className="green-button" onClick={() => setActiveGame(null)}>← Menu</button>
          </div>
          <Game />
        </>
      )
    }

    // 貧乏ゲーム（仮：ポーカーそのまま）
    if (activeGame === 'poor') {
      return (
        <>
          <div className="top-left-area">
            <button className="green-button" onClick={() => setActiveGame(null)}>← Menu</button>
          </div>
          <Poker />
        </>
      )
    }

    return (
      <>
        <div className="top-left-area">
          <button className="green-button" onClick={() => setActiveGame(null)}>← Menu</button>
        </div>
        {activeGame === 'diagnosis' ? <Game /> : <Poker />}
      </>
    )
  }

  // --- 通常のサンタさん画面 ---
  return (
    <>
      <div className="video-background">
        <video autoPlay muted loop playsInline>
          {/* Use relative path so GitHub Pages serves the file from the repo root */}
          <source src="./santa.mp4" type="video/mp4" />
        </video>
      </div>
      
      <div className="top-left-area">
        <button className="green-button" onClick={handleBtnClick}>
          {signature ? 'Thanks! Oligoto!' : 'Connect Wallet'}
        </button>
      </div>

      {signature && (
        <div className="center-toast">
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}></div>
          <div className="toast-title">SUCCESS!</div>
          <div className="toast-message">Signature Verified.</div>
          <div className="toast-footer">Thanks, Oligoto!</div>
          {/* ゲームへ行くことを伝えるメッセージ */}
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#2e7d32' }}>
            Starting Diagnosis Game...
          </div>
        </div>
      )}
    </>
  )
}

export default App
