"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { getBlockchainInfo } from "@/lib/blockchain-api"
import Image from "next/image"

type BlockchainInfo = {
  totalSupply: string
  circulatingSupply: string
  currentEpoch: number
  currentSlot: number
  blockHeight: number
  isHealthy: boolean
}

type BlockchainExplorerProps = {
  activeTab: "blockchain" | "validators"
  onTabChange: (tab: "blockchain" | "validators") => void
}

export function BlockchainExplorer({ activeTab, onTabChange }: BlockchainExplorerProps) {
  const [transactionTab, setTransactionTab] = useState<"transactions" | "blocks">("transactions")
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo>({
    totalSupply: "0.00B",
    circulatingSupply: "0.00B",
    currentEpoch: 0,
    currentSlot: 0,
    blockHeight: 0,
    isHealthy: false,
  })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await getBlockchainInfo()
        setBlockchainInfo(info)
      } catch (error) {
        console.error("Failed to fetch blockchain info:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (query: string) => {
    console.log("[v0] Search query:", query)
  }

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Adding purple gradient background to header */}
      <header className="border-b border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/zeno-purple.jpg"
                alt="Zeno Chain Logo"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <div>
                {/* Making title text purple */}
                <h1 className="text-2xl font-bold text-primary">Explore Zeno Chain</h1>
                <p className="text-sm text-muted-foreground">Search transactions, blocks, wallets, and addresses</p>
              </div>
            </div>

            <form onSubmit={handleHeroSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Adding purple accent to total supply card */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Supply</h3>
              <p className="text-3xl font-bold text-primary mb-1">{blockchainInfo.totalSupply}</p>
              <p className="text-xs text-muted-foreground">Circulating: {blockchainInfo.circulatingSupply}</p>
            </CardContent>
          </Card>

          {/* Current Epoch */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Epoch</h3>
              <p className="text-3xl font-bold text-foreground mb-1">{blockchainInfo.currentEpoch}</p>
              <p className="text-xs text-muted-foreground">Slot: {blockchainInfo.currentSlot}</p>
            </CardContent>
          </Card>

          {/* Block Height */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Block Height</h3>
              <p className="text-3xl font-bold text-foreground mb-1">{blockchainInfo.blockHeight}</p>
              <p className="text-xs text-muted-foreground">Latest block confirmed</p>
            </CardContent>
          </Card>

          {/* Adding purple accent to status card */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${blockchainInfo.isHealthy ? "bg-success" : "bg-destructive"}`}
                />
                <p className="text-3xl font-bold text-foreground">{blockchainInfo.isHealthy ? "Active" : "Offline"}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {blockchainInfo.isHealthy ? "Network is healthy" : "Network is offline"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setTransactionTab("transactions")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                transactionTab === "transactions" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Latest Transactions (0)
              {/* Making active tab indicator purple with glow effect */}
              {transactionTab === "transactions" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(127,0,255,0.6)]" />
              )}
            </button>
            <button
              onClick={() => setTransactionTab("blocks")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                transactionTab === "blocks" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Blocks (0)
              {transactionTab === "blocks" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(127,0,255,0.6)]" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {transactionTab === "transactions" ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No transactions yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No blocks yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
