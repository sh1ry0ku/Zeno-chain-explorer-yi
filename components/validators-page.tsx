"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getValidatorInfo } from "@/lib/blockchain-api"
import { Activity, Database, TrendingUp, Clock } from "lucide-react"

interface ValidatorInfo {
  totalValidators: number
  allActiveHealthy: boolean
  totalStaked: string
  percentOfSupply: number
  currentUptime: number
  sloMet: boolean
  sloTarget: number
  incidents: number
  avgResponse: number
  uptimeHistory: { timestamp: string; uptime: number }[]
}

type ValidatorsPageProps = {
  activeTab: "blockchain" | "validators"
  onTabChange: (tab: "blockchain" | "validators") => void
}

export function ValidatorsPage({ activeTab, onTabChange }: ValidatorsPageProps) {
  const [validatorInfo, setValidatorInfo] = useState<ValidatorInfo>({
    totalValidators: 0,
    allActiveHealthy: false,
    totalStaked: "0.00",
    percentOfSupply: 0,
    currentUptime: 0,
    sloMet: false,
    sloTarget: 99.9,
    incidents: 0,
    avgResponse: 0,
    uptimeHistory: [],
  })
  const [timePeriod, setTimePeriod] = useState<"24H" | "7D" | "30D" | "90D">("24H")

  useEffect(() => {
    const fetchValidatorInfo = async () => {
      const info = await getValidatorInfo()
      setValidatorInfo(info)
    }

    fetchValidatorInfo()
    const interval = setInterval(fetchValidatorInfo, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Validator Stats */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Validators</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{validatorInfo.totalValidators}</div>
              <p className="text-sm text-success flex items-center gap-1 mt-2">
                {validatorInfo.allActiveHealthy ? "✓ All Active & Healthy" : "⚠ Some validators offline"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Staked</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{validatorInfo.totalStaked} ZENO</div>
              <p className="text-sm text-muted-foreground mt-2">
                {validatorInfo.percentOfSupply.toFixed(1)}% of supply
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Network Uptime Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Network Uptime</CardTitle>
              </div>
              <div className="flex gap-2">
                {(["24H", "7D", "30D", "90D"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      timePeriod === period
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Uptime Metrics */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card className="bg-card/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-success">{validatorInfo.currentUptime.toFixed(2)}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Current Uptime</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {validatorInfo.sloMet ? (
                      <span className="text-success">✓</span>
                    ) : (
                      <span className="text-destructive">✗</span>
                    )}
                    <span className="text-sm font-medium text-success">SLO Met</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Target: {validatorInfo.sloTarget}%</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{validatorInfo.incidents}</div>
                  <p className="text-sm text-muted-foreground mt-1">Incidents</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{validatorInfo.avgResponse}ms</div>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Avg Response
                  </p>
                  <p className="text-xs text-muted-foreground">Real-time</p>
                </CardContent>
              </Card>
            </div>

            {/* Uptime Chart Placeholder */}
            <div className="h-64 bg-card/50 rounded-lg border border-border flex items-center justify-center">
              <p className="text-muted-foreground">Uptime chart will display when RPC is connected</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
