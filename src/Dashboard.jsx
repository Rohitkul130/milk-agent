import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function Dashboard({ onBack }) {
  const [customers, setCustomers] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('customers')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .order('id')

    const { data: logData } = await supabase
      .from('delivery_logs')
      .select('*, customers(name, phone)')
      .order('created_at', { ascending: false })

    setCustomers(customerData || [])
    setLogs(logData || [])
    setLoading(false)
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  }

  const getActionColor = (action) => {
    if (action === 'pause') return 'bg-red-100 text-red-700'
    if (action === 'resume') return 'bg-green-100 text-green-700'
    if (action === 'extra_order') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getActionLabel = (action) => {
    if (action === 'pause') return '⏸ Paused'
    if (action === 'resume') return '▶️ Resumed'
    if (action === 'extra_order') return '➕ Extra Order'
    return action
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-xl font-bold">🥛 MilkMate Admin</h1>
          <p className="text-sm text-blue-200">Business Dashboard</p>
        </div>
        <button
          onClick={onBack}
          className="text-sm bg-white text-blue-600 px-3 py-1 rounded-lg font-medium hover:bg-blue-50"
        >
          ← Back
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-600">{customers.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Customers</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">
            {customers.filter(c => c.status === 'active').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-red-500">
            {customers.filter(c => c.status === 'paused').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Paused</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4 flex gap-3">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'customers'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Customers
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Activity Logs
        </button>
        <button
          onClick={fetchData}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-600 hover:bg-gray-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : activeTab === 'customers' ? (

          /* Customers Table */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Address</th>
                  <th className="px-4 py-3 text-left">Daily Qty</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{c.address}</td>
                    <td className="px-4 py-3 text-gray-600">{c.daily_quantity}L</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (

          /* Logs Table */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">End Date</th>
                  <th className="px-4 py-3 text-left">Note</th>
                  <th className="px-4 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{log.customers?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.start_date}</td>
                    <td className="px-4 py-3 text-gray-600">{log.end_date}</td>
                    <td className="px-4 py-3 text-gray-500 italic">{log.note}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard