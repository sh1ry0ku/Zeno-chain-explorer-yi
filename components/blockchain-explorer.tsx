"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { getBlockchainInfo } from "@/lib/blockchain-api"
import { NavigationHeader } from "@/components/navigation-header"

type BlockchainInfo = {
  totalSupply: string
  circulatingSupply: string
  currentEpoch: number
  currentSlot: number
  blockHeight: number
  isHealthy: boolean
}

export function BlockchainExplorer() {
  const [activeTab, setActiveTab] = useState<"transactions" | "blocks">("transactions")
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo>({
    totalSupply: "0.00B",
    circulatingSupply: "0.00B",
    currentEpoch: 0,
    currentSlot: 0,
    blockHeight: 0,
    isHealthy: true,
  })

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
    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (query: string) => {
    console.log("[v0] Search query:", query)
    // TODO: Implement search functionality
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onSearch={handleSearch} />

      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Explore Zeno Chain</h1>
              <p className="text-sm text-muted-foreground">Search transactions, blocks, wallets, and addresses</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Supply */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Supply</h3>
              <p className="text-3xl font-bold text-foreground mb-1">{blockchainInfo.totalSupply}</p>
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

          {/* Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${blockchainInfo.isHealthy ? "bg-success" : "bg-destructive"}`}
                />
                <p className="text-3xl font-bold text-foreground">{blockchainInfo.isHealthy ? "Active" : "Inactive"}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Network is {blockchainInfo.isHealthy ? "healthy" : "experiencing issues"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "transactions" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Latest Transactions (0)
              {activeTab === "transactions" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab("blocks")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "blocks" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Blocks (0)
              {activeTab === "blocks" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "transactions" ? (
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
