'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'

interface WalletContextType {
  address: string | null
  provider: BrowserProvider | null
  signer: JsonRpcSigner | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const p = new BrowserProvider((window as any).ethereum)
      setProvider(p)
      
      // Check if already connected
      p.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          setAddress(accounts[0].address)
          p.getSigner().then(setSigner)
        }
      })

      // Listen for account changes
      ;(window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          p.getSigner().then(setSigner)
        } else {
          setAddress(null)
          setSigner(null)
        }
      })
    }
  }, [])

  const connect = async () => {
    if (!provider) {
      alert("Please install MetaMask or another Web3 wallet!")
      return
    }
    try {
      const accounts = await provider.send("eth_requestAccounts", [])
      if (accounts.length > 0) {
        setAddress(accounts[0])
        const s = await provider.getSigner()
        setSigner(s)
      }
    } catch (err) {
      console.error("Connection failed:", err)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setSigner(null)
  }

  return (
    <WalletContext.Provider value={{ address, provider, signer, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
