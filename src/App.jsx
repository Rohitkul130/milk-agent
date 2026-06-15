import { useState } from 'react'
import { supabase } from './supabaseClient'
import Chat from './Chat'
import Dashboard from './Dashboard'

function App() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .eq('password', password)
      .single()

    if (error || !data) {
      setError('Invalid phone number or password')
      setLoading(false)
      return
    }

    setCustomer(data)
    if (data.phone === '9664149181') setShowDashboard(true)
    setLoading(false)
  }

  if (customer) {
    if (showDashboard) {
      return <Dashboard onBack={() => setShowDashboard(false)} />
    }
    return (
      <Chat
        customer={customer}
        onLogout={() => setCustomer(null)}
        onDashboard={() => setShowDashboard(true)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">🥛 MilkMate</h1>
          <p className="text-gray-500 text-sm mt-1">Your daily delivery assistant</p>
        </div>

        {/* Phone Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

      </div>
    </div>
  )
}

export default App