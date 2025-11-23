"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, TrendingUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getPriceInfo } from "@/lib/blockchain-api"

type NavigationHeaderProps = {
  onSearch?: (query: string) => void
}

export function NavigationHeader({ onSearch }: NavigationHeaderProps) {
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
    const interval = setInterval(fetchPriceData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
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
    </header>
  )
}
