"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  Briefcase,
  Activity
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface DashboardData {
  totalInvestment: number
  currentValue: number
  totalPnL: number
  dayPnL: number
  holdings: any[]
  positions: any[]
  funds: any
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [holdingsRes, positionsRes, fundsRes] = await Promise.all([
        fetch("/api/dhan/holdings"),
        fetch("/api/dhan/positions"),
        fetch("/api/dhan/funds"),
      ])

      if (!holdingsRes.ok || !positionsRes.ok || !fundsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const holdings = await holdingsRes.json()
      const positions = await positionsRes.json()
      const funds = await fundsRes.json()

      const totalInvestment = holdings.reduce((sum: number, h: any) => sum + (h.avgCostPrice * h.totalQty), 0)
      const currentValue = holdings.reduce((sum: number, h: any) => sum + (h.lastTradedPrice * h.totalQty), 0)
      const totalPnL = holdings.reduce((sum: number, h: any) => sum + (h.unrealizedProfit || 0), 0)
      const dayPnL = positions.reduce((sum: number, p: any) => sum + (p.unrealizedProfit || 0), 0)

      setData({
        totalInvestment,
        currentValue,
        totalPnL,
        dayPnL,
        holdings,
        positions,
        funds,
      })
      setError(null)
    } catch (err) {
      setError("Failed to load dashboard data. Please configure your Dhan API credentials in Settings.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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

  const pnlPercentage = data ? ((data.totalPnL / data.totalInvestment) * 100) : 0
  const dayPnlPercentage = data ? ((data.dayPnL / data.currentValue) * 100) : 0

  // Prepare chart data
  const portfolioData = data?.holdings.slice(0, 5).map((h: any) => ({
    name: h.tradingSymbol,
    value: h.lastTradedPrice * h.totalQty,
    pnl: h.unrealizedProfit,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="text-gray-500">Track your investments and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <Wallet className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.totalInvestment || 0)}</div>
            <p className="text-xs text-gray-500">Initial capital invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.currentValue || 0)}</div>
            <p className="text-xs text-gray-500">Present market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {(data?.totalPnL || 0) >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data?.totalPnL || 0)}
            </div>
            <p className={`text-xs ${(data?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(pnlPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day's P&L</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data?.dayPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data?.dayPnL || 0)}
            </div>
            <p className={`text-xs ${(data?.dayPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(dayPnlPercentage)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Holdings by Value</CardTitle>
            <CardDescription>Your largest positions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Funds</CardTitle>
            <CardDescription>Your account balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available Balance</span>
              <span className="text-lg font-bold">{formatCurrency(data?.funds?.availabelBalance || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utilized Amount</span>
              <span className="text-lg font-medium">{formatCurrency(data?.funds?.utilizedAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Collateral</span>
              <span className="text-lg font-medium">{formatCurrency(data?.funds?.collateralAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium text-gray-900">Withdrawable</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(data?.funds?.withdrawableBalance || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Holdings</CardTitle>
          <CardDescription>Your top performing stocks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.holdings.slice(0, 5).map((holding: any, index: number) => {
              const pnl = holding.unrealizedProfit || 0
              const pnlPercent = ((pnl / (holding.avgCostPrice * holding.totalQty)) * 100) || 0
              return (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{holding.tradingSymbol}</p>
                    <p className="text-sm text-gray-500">Qty: {holding.totalQty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(holding.lastTradedPrice * holding.totalQty)}</p>
                    <p className={`text-sm ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(pnl)} ({formatPercentage(pnlPercent)})
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
