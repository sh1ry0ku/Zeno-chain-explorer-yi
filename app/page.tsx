"use client"

import { useState } from "react"
import { BlockchainExplorer } from "@/components/blockchain-explorer"
import { ValidatorsPage } from "@/components/validators-page"
import { NavigationHeader } from "@/components/navigation-header" // Assuming NavigationHeader is imported

export default function Page() {
  const [activeTab, setActiveTab] = useState<"blockchain" | "validators">("blockchain")

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "blockchain" && <BlockchainExplorer activeTab={activeTab} onTabChange={setActiveTab} />}
      {activeTab === "validators" && <ValidatorsPage activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  )
}
