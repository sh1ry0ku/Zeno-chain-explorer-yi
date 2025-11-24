"use client"

import type React from "react"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Info, ExternalLink, CheckCircle2, XCircle } from "lucide-react"
import { getBlockchainInfo, getLatestTransactions, getLatestBlocks, searchBlockchain } from "@/lib/blockchain-api"
import Image from "next/image"

type BlockchainInfo = {
  totalSupply: string
  circulatingSupply: string
  currentEpoch: number
  currentSlot: number
  blockHeight: number
  isHealthy: boolean
}

type Transaction = {
  signature: string
  slot: number
  timestamp: number
  success: boolean
  fee: number
  instructions: string
}

type Block = {
  slot: number
  hash: string
  timestamp: number
  transactions: number
  parentSlot: number
}

type Address = {
  address: string
  balance: number
}

type SearchResult = {
  type: "transaction" | "block" | "address"
  data: Transaction | Block | Address
}

type BlockchainExplorerProps = {
  activeTab: "blockchain" | "validators"
  onTabChange: (tab: "blockchain" | "validators") => void
}

export const BlockchainExplorer = forwardRef<{ handleSearch: (query: string) => void }, BlockchainExplorerProps>(
  ({ activeTab, onTabChange }, ref) => {
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
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [blocks, setBlocks] = useState<Block[]>([])
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [info, txs, blks] = await Promise.all([
            getBlockchainInfo(),
            getLatestTransactions(20),
            getLatestBlocks(20),
          ])

          setBlockchainInfo(info)
          setTransactions(txs)
          setBlocks(blks)

          console.log("[v0] Fetched data:", { info, txCount: txs.length, blockCount: blks.length })
        } catch (error) {
          console.error("Failed to fetch blockchain data:", error)
        }
      }

      fetchData()
      const interval = setInterval(fetchData, 5000)
      return () => clearInterval(interval)
    }, [])

    const handleSearch = async (query: string) => {
      if (!query || query.trim().length === 0) {
        setSearchResult(null)
        return
      }

      setIsSearching(true)
      console.log("[v0] Searching for:", query)

      try {
        const result = await searchBlockchain(query)
        setSearchResult(result)

        if (!result) {
          console.log("[v0] No results found")
        } else {
          console.log("[v0] Search result:", result)
        }
      } catch (error) {
        console.error("[v0] Search error:", error)
        setSearchResult(null)
      } finally {
        setIsSearching(false)
      }
    }

    const handleHeroSearch = (e: React.FormEvent) => {
      e.preventDefault()
      handleSearch(searchQuery)
    }

    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp * 1000)
      const now = Date.now()
      const diff = now - date.getTime()

      if (diff < 60000) return "Just now"
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
      return date.toLocaleDateString()
    }

    const truncateHash = (hash: string) => {
      if (hash.length <= 16) return hash
      return `${hash.slice(0, 8)}...${hash.slice(-8)}`
    }

    useImperativeHandle(ref, () => ({
      handleSearch,
    }))

    return (
      <div className="min-h-screen bg-background">
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

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
            <Info className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Note:</span> Only unshielded transactions are shown on this explorer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Supply</h3>
                <p className="text-3xl font-bold text-primary mb-1">{blockchainInfo.totalSupply}</p>
                <p className="text-xs text-muted-foreground">Circulating: {blockchainInfo.circulatingSupply}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Epoch</h3>
                <p className="text-3xl font-bold text-foreground mb-1">{blockchainInfo.currentEpoch}</p>
                <p className="text-xs text-muted-foreground">Slot: {blockchainInfo.currentSlot}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Block Height</h3>
                <p className="text-3xl font-bold text-foreground mb-1">{blockchainInfo.blockHeight}</p>
                <p className="text-xs text-muted-foreground">Latest block confirmed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${blockchainInfo.isHealthy ? "bg-success" : "bg-destructive"}`}
                  />
                  <p className="text-3xl font-bold text-foreground">
                    {blockchainInfo.isHealthy ? "Active" : "Offline"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {blockchainInfo.isHealthy ? "Network is healthy" : "Network is offline"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="border-b border-border mb-6">
            <div className="flex gap-1">
              <button
                onClick={() => setTransactionTab("transactions")}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  transactionTab === "transactions" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Latest Transactions ({transactions.length})
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
                Blocks ({blocks.length})
                {transactionTab === "blocks" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(127,0,255,0.6)]" />
                )}
              </button>
            </div>
          </div>

          <div className="min-h-[400px]">
            {searchResult ? (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <button onClick={() => setSearchResult(null)} className="text-sm text-primary hover:underline">
                      ← Back to latest {transactionTab}
                    </button>
                  </div>

                  {searchResult.type === "transaction" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Transaction Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Signature:</span>
                          <span className="font-mono text-sm break-all">{searchResult.data.signature}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Status:</span>
                          <span className="flex items-center gap-2">
                            {searchResult.data.success ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span className="text-success">Success</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-destructive" />
                                <span className="text-destructive">Failed</span>
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Slot:</span>
                          <span className="text-sm">{searchResult.data.slot}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Time:</span>
                          <span className="text-sm">{formatTime(searchResult.data.timestamp)}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Fee:</span>
                          <span className="text-sm">{(searchResult.data.fee / 1e9).toFixed(9)} ZNO</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Instructions:</span>
                          <span className="text-sm">{searchResult.data.instructions}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {searchResult.type === "block" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Block Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Block Number:</span>
                          <span className="text-sm font-semibold">{searchResult.data.slot}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Hash:</span>
                          <span className="font-mono text-sm break-all">{searchResult.data.hash}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Transactions:</span>
                          <span className="text-sm">{searchResult.data.transactions}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Time:</span>
                          <span className="text-sm">{formatTime(searchResult.data.timestamp)}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Parent Slot:</span>
                          <span className="text-sm">{searchResult.data.parentSlot}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {searchResult.type === "address" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Address Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Address:</span>
                          <span className="font-mono text-sm break-all">{searchResult.data.address}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-muted-foreground min-w-32">Balance:</span>
                          <span className="text-sm font-semibold">{searchResult.data.balance.toFixed(9)} ZNO</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : isSearching ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Searching...</p>
                </CardContent>
              </Card>
            ) : transactionTab === "transactions" ? (
              <Card>
                <CardContent className="p-0">
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {transactions.map((tx, index) => (
                        <div key={`${tx.signature}-${index}`} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-medium text-foreground">
                                  {truncateHash(tx.signature)}
                                </span>
                                {tx.success ? (
                                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Slot {tx.slot} • {formatTime(tx.timestamp)}
                              </p>
                            </div>
                            <button className="text-primary hover:text-primary/80 transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  {blocks.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">No blocks yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {blocks.map((block, index) => (
                        <div key={`${block.slot}-${index}`} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">Block #{block.slot}</span>
                                <span className="font-mono text-sm text-muted-foreground">
                                  {truncateHash(block.hash)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {block.transactions} transactions • {formatTime(block.timestamp)}
                              </p>
                            </div>
                            <button className="text-primary hover:text-primary/80 transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    )
  },
)

BlockchainExplorer.displayName = "BlockchainExplorer"
