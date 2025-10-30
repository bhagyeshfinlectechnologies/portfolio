"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Holding {
  tradingSymbol: string
  exchangeSegment: string
  isin: string
  totalQty: number
  dpQty: number
  t1Qty: number
  availableQty: number
  avgCostPrice: number
  buyAvg: number
  lastTradedPrice: number
  realizedProfit: number
  unrealizedProfit: number
}

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHoldings = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/dhan/holdings")

      if (!response.ok) {
        throw new Error("Failed to fetch holdings")
      }

      const data = await response.json()
      setHoldings(data)
      setError(null)
    } catch (err) {
      setError("Failed to load holdings. Please check your API credentials in Settings.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchHoldings()
    const interval = setInterval(fetchHoldings, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const totalInvestment = holdings.reduce((sum, h) => sum + (h.avgCostPrice * h.totalQty), 0)
  const currentValue = holdings.reduce((sum, h) => sum + (h.lastTradedPrice * h.totalQty), 0)
  const totalPnL = holdings.reduce((sum, h) => sum + (h.unrealizedProfit || 0), 0)
  const pnlPercentage = totalInvestment > 0 ? ((totalPnL / totalInvestment) * 100) : 0

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading holdings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Holdings</h1>
          <p className="text-gray-500">Your long-term investments</p>
        </div>
        <Button onClick={fetchHoldings} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalPnL)}
            </div>
            <p className={`text-sm ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(pnlPercentage)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Holdings ({holdings.length})</CardTitle>
          <CardDescription>Detailed view of your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Symbol</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Qty</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Avg Cost</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">LTP</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Current Value</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">P&L</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding, index) => {
                  const pnl = holding.unrealizedProfit || 0
                  const pnlPercent = ((pnl / (holding.avgCostPrice * holding.totalQty)) * 100) || 0
                  const currentVal = holding.lastTradedPrice * holding.totalQty

                  return (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{holding.tradingSymbol}</p>
                          <p className="text-xs text-gray-500">{holding.exchangeSegment}</p>
                        </div>
                      </td>
                      <td className="py-4 text-right font-medium">{formatNumber(holding.totalQty)}</td>
                      <td className="py-4 text-right">{formatCurrency(holding.avgCostPrice)}</td>
                      <td className="py-4 text-right font-medium">{formatCurrency(holding.lastTradedPrice)}</td>
                      <td className="py-4 text-right font-medium">{formatCurrency(currentVal)}</td>
                      <td className={`py-4 text-right font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {pnl >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          {formatCurrency(Math.abs(pnl))}
                        </div>
                      </td>
                      <td className={`py-4 text-right font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(pnlPercent)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {holdings.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No holdings found. Start investing to see your portfolio here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
