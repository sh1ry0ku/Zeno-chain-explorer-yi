"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, TrendingUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getPriceInfo } from "@/lib/blockchain-api"
import Image from "next/image"

type NavigationHeaderProps = {
  onSearch?: (query: string) => void
  activeTab?: "blockchain" | "validators"
  onTabChange?: (tab: "blockchain" | "validators") => void
}

export function NavigationHeader({ onSearch, activeTab = "blockchain", onTabChange }: NavigationHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet")
  const [priceData, setPriceData] = useState({
    price: 0,
    priceChange: 0,
    avgFee: 0,
  })

  useEffect(() => {
    const fetchPriceData = async () => {
      const data = await getPriceInfo()
      setPriceData(data)
    }

    fetchPriceData()
    const interval = setInterval(fetchPriceData, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery)
    }
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <Image src="/images/zeno-purple.jpg" alt="Zeno" width={32} height={32} className="rounded-lg" />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-foreground">Zeno Explorer</h1>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions, addresses, blocks, tokens, or domains"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background"
              />
            </div>
          </form>

          {/* Price Info & Network Selector */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Price Display */}
            <div className="hidden lg:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">${priceData.price.toFixed(6)}</span>
                <span className={priceData.priceChange >= 0 ? "text-success" : "text-destructive"}>
                  {priceData.priceChange >= 0 ? "+" : ""}
                  {priceData.priceChange.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="text-muted-foreground">
                Avg Fee: <span className="text-foreground">{priceData.avgFee.toFixed(8)}</span>
              </div>
            </div>

            {/* Network Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <span className="capitalize">{network}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setNetwork("testnet")} className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span>Testnet</span>
                    {network === "testnet" && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <div className="flex items-center justify-between w-full">
                    <span>Mainnet</span>
                    <span className="text-xs text-muted-foreground">Coming Soon</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => onTabChange?.("blockchain")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "blockchain" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Blockchain
              {activeTab === "blockchain" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(127,0,255,0.6)]" />
              )}
            </button>
            <button
              onClick={() => onTabChange?.("validators")}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "validators" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Validators
              {activeTab === "validators" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(127,0,255,0.6)]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
