"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Eye, EyeOff } from "lucide-react"

interface UserSettings {
  id: string
  email: string
  name: string | null
  dhanClientId: string | null
  dhanApiKey: string | null
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    dhanClientId: "",
    dhanApiKey: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings")
      if (!response.ok) throw new Error("Failed to fetch settings")

      const data = await response.json()
      setSettings(data)
      setFormData({
        name: data.name || "",
        dhanClientId: data.dhanClientId || "",
        dhanApiKey: data.dhanApiKey || "",
      })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      await fetchSettings()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and API credentials</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={settings?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dhan API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Dhan API Configuration</CardTitle>
            <CardDescription>Configure your Dhan broker credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dhanClientId">Client ID</Label>
              <Input
                id="dhanClientId"
                value={formData.dhanClientId}
                onChange={(e) => setFormData({ ...formData, dhanClientId: e.target.value })}
                placeholder="Your Dhan Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dhanApiKey">API Access Token</Label>
              <div className="relative">
                <Input
                  id="dhanApiKey"
                  type={showApiKey ? "text" : "password"}
                  value={formData.dhanApiKey}
                  onChange={(e) => setFormData({ ...formData, dhanApiKey: e.target.value })}
                  placeholder="Your Dhan API Key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to get Dhan API Credentials</CardTitle>
          <CardDescription>Follow these steps to configure your API access</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Login to your <a href="https://dhan.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dhan account</a></li>
            <li>Navigate to Settings → API Management</li>
            <li>Click on "Create New API" or "Generate Token"</li>
            <li>Copy your Client ID and Access Token</li>
            <li>Paste them in the fields above and save</li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Security Note:</strong> Your API credentials are stored securely and encrypted. Never share your API keys with anyone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button and Messages */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {message && (
            <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </div>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={saving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
