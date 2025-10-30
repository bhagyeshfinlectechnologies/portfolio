"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { RefreshCw, Wallet, TrendingDown, Lock, ArrowDownToLine } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Fund {
  sodLimit: number
  collateralAmount: number
  availabelBalance: number
  utilizedAmount: number
  blockedPayinAmount: number
  blockedPayoutAmount: number
  withdrawableBalance: number
}

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchFunds = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/dhan/funds")

      if (!response.ok) {
        throw new Error("Failed to fetch funds")
      }

      const data = await response.json()
      setFunds(data)
      setError(null)
    } catch (err) {
      setError("Failed to load funds. Please check your API credentials in Settings.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFunds()
    const interval = setInterval(fetchFunds, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading funds...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Funds & Margins</h1>
          <p className="text-gray-500">Your account balance and limits</p>
        </div>
        <Button onClick={fetchFunds} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Balance Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl">Available Balance</CardTitle>
          <CardDescription>Funds available for trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-blue-600">
            {formatCurrency(funds?.availabelBalance || 0)}
          </div>
        </CardContent>
      </Card>

      {/* Fund Details Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Start of Day Limit</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(funds?.sodLimit || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Opening balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilized Amount</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(funds?.utilizedAmount || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently in use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collateral</CardTitle>
            <Lock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(funds?.collateralAmount || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Securities as margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked (Pay-in)</CardTitle>
            <Lock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(funds?.blockedPayinAmount || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pending settlements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked (Payout)</CardTitle>
            <Lock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(funds?.blockedPayoutAmount || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Withdrawal pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawable</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(funds?.withdrawableBalance || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Available to withdraw</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Fund Breakdown</CardTitle>
          <CardDescription>Detailed analysis of your account funds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-medium">Start of Day Limit</span>
              <span className="text-lg font-bold">{formatCurrency(funds?.sodLimit || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm text-gray-600">+ Collateral Amount</span>
              <span className="text-purple-600">+{formatCurrency(funds?.collateralAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm text-gray-600">- Utilized Amount</span>
              <span className="text-orange-600">-{formatCurrency(funds?.utilizedAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm text-gray-600">- Blocked (Pay-in)</span>
              <span className="text-red-600">-{formatCurrency(funds?.blockedPayinAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm text-gray-600">- Blocked (Payout)</span>
              <span className="text-red-600">-{formatCurrency(funds?.blockedPayoutAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-bold">Available Balance</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(funds?.availabelBalance || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
