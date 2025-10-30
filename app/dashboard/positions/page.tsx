"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercentage, formatNumber } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Position {
  tradingSymbol: string
  exchangeSegment: string
  productType: string
  positionType: string
  netQty: number
  buyAvg: number
  sellAvg: number
  buyQty: number
  sellQty: number
  lastTradedPrice: number
  realizedProfit: number
  unrealizedProfit: number
  dayBuyQty: number
  daySellQty: number
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPositions = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/dhan/positions")

      if (!response.ok) {
        throw new Error("Failed to fetch positions")
      }

      const data = await response.json()
      setPositions(data)
      setError(null)
    } catch (err) {
      setError("Failed to load positions. Please check your API credentials in Settings.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPositions()
    const interval = setInterval(fetchPositions, 30000)
    return () => clearInterval(interval)
  }, [])

  const totalRealizedPnL = positions.reduce((sum, p) => sum + (p.realizedProfit || 0), 0)
  const totalUnrealizedPnL = positions.reduce((sum, p) => sum + (p.unrealizedProfit || 0), 0)
  const totalPnL = totalRealizedPnL + totalUnrealizedPnL

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading positions...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Positions</h1>
          <p className="text-gray-500">Your active trading positions</p>
        </div>
        <Button onClick={fetchPositions} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Realized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalRealizedPnL)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Unrealized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalUnrealizedPnL)}
            </div>
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
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Positions ({positions.length})</CardTitle>
          <CardDescription>Your intraday and overnight positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Symbol</th>
                  <th className="pb-3 text-center text-sm font-medium text-gray-500">Type</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Net Qty</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Buy Avg</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Sell Avg</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">LTP</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Realized P&L</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, index) => {
                  const realizedPnl = position.realizedProfit || 0
                  const unrealizedPnl = position.unrealizedProfit || 0

                  return (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{position.tradingSymbol}</p>
                          <p className="text-xs text-gray-500">{position.exchangeSegment}</p>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          position.netQty > 0
                            ? 'bg-green-100 text-green-700'
                            : position.netQty < 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {position.netQty > 0 ? 'LONG' : position.netQty < 0 ? 'SHORT' : 'SQUARE'}
                        </span>
                      </td>
                      <td className="py-4 text-right font-medium">{formatNumber(Math.abs(position.netQty))}</td>
                      <td className="py-4 text-right">{formatCurrency(position.buyAvg)}</td>
                      <td className="py-4 text-right">{formatCurrency(position.sellAvg)}</td>
                      <td className="py-4 text-right font-medium">{formatCurrency(position.lastTradedPrice)}</td>
                      <td className={`py-4 text-right font-bold ${realizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(realizedPnl)}
                      </td>
                      <td className={`py-4 text-right font-bold ${unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {unrealizedPnl >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          {formatCurrency(Math.abs(unrealizedPnl))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {positions.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No open positions. Start trading to see your positions here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
