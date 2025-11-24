"use client"

import { useState, useRef } from "react"
import { BlockchainExplorer } from "@/components/blockchain-explorer"
import { ValidatorsPage } from "@/components/validators-page"
import { NavigationHeader } from "@/components/navigation-header"

export default function Page() {
  const [activeTab, setActiveTab] = useState<"blockchain" | "validators">("blockchain")
  const blockchainExplorerRef = useRef<{ handleSearch: (query: string) => void } | null>(null)

  const handleSearch = (query: string) => {
    if (activeTab === "blockchain" && blockchainExplorerRef.current) {
      blockchainExplorerRef.current.handleSearch(query)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader activeTab={activeTab} onTabChange={setActiveTab} onSearch={handleSearch} />

      {activeTab === "blockchain" && (
        <BlockchainExplorer activeTab={activeTab} onTabChange={setActiveTab} ref={blockchainExplorerRef} />
      )}
      {activeTab === "validators" && <ValidatorsPage activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  )
}
