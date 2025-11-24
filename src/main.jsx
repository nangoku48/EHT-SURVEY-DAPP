import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ------------------ Web3関連のインポート ------------------
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// -------------------------------------------------------

// 1. WalletConnectプロジェクトID
const projectId = '8f0560bef7be823af38fd0973e9576a8'

// 2. メタデータの設定
const metadata = {
  name: 'ETH Signature Survey App',
  description: 'Ethereum Signature Demo App',
  // Use the public GitHub Pages URL (or keep relative) to avoid localhost in production
  url: 'https://nangoku48.github.io/EHT-SURVEY-DAPP/',
  icons: ['/vite.svg']
}

// 3. サポートするチェーン
// ★ここを変えました！ sepolia を先に書くことで、セポリアが「主役」になります
const chains = [sepolia, mainnet]

// 4. 設定の作成
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 5. React Queryの設定
const queryClient = new QueryClient()

// 6. Web3Modalの作成
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  themeMode: 'light',
})

// アプリの表示
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)