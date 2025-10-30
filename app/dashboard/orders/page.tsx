"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface Order {
  orderId: string
  tradingSymbol: string
  exchangeSegment: string
  transactionType: string
  orderStatus: string
  orderType: string
  productType: string
  quantity: number
  filled_qty: number
  price: number
  triggerPrice: number
  createTime: string
  updateTime: string
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'TRADED':
    case 'COMPLETE':
      return 'bg-green-100 text-green-700'
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700'
    case 'PENDING':
    case 'OPEN':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/dhan/orders")

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      setOrders(data)
      setError(null)
    } catch (err) {
      setError("Failed to load orders. Please check your API credentials in Settings.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
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

  const completedOrders = orders.filter(o => o.orderStatus?.toUpperCase() === 'TRADED' || o.orderStatus?.toUpperCase() === 'COMPLETE')
  const pendingOrders = orders.filter(o => o.orderStatus?.toUpperCase() === 'PENDING' || o.orderStatus?.toUpperCase() === 'OPEN')
  const rejectedOrders = orders.filter(o => o.orderStatus?.toUpperCase() === 'REJECTED' || o.orderStatus?.toUpperCase() === 'CANCELLED')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500">Track your order execution</p>
        </div>
        <Button onClick={fetchOrders} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
          <CardDescription>Complete order book</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Time</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-500">Symbol</th>
                  <th className="pb-3 text-center text-sm font-medium text-gray-500">Type</th>
                  <th className="pb-3 text-center text-sm font-medium text-gray-500">Order Type</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Qty</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Filled</th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-500">Price</th>
                  <th className="pb-3 text-center text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const time = order.createTime ? format(new Date(order.createTime), 'dd MMM, HH:mm') : '-'

                  return (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-4 text-sm">{time}</td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{order.tradingSymbol}</p>
                          <p className="text-xs text-gray-500">{order.productType}</p>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          order.transactionType?.toUpperCase() === 'BUY'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {order.transactionType}
                        </span>
                      </td>
                      <td className="py-4 text-center text-sm">{order.orderType}</td>
                      <td className="py-4 text-right font-medium">{formatNumber(order.quantity)}</td>
                      <td className="py-4 text-right font-medium">{formatNumber(order.filled_qty || 0)}</td>
                      <td className="py-4 text-right">{formatCurrency(order.price)}</td>
                      <td className="py-4 text-center">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No orders found. Start trading to see your order history here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
