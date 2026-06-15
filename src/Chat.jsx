import { useState } from 'react'
import { processCustomerMessage } from './aiAgent'

function Chat({ customer, onLogout }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi ${customer.name}! 👋 I'm your MilkMate assistant. You can tell me things like:\n\n• "Skip delivery tomorrow"\n• "No milk for 3 days from Monday"\n• "Add 1 extra litre tomorrow"`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const { reply } = await processCustomerMessage(input, customer)
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-xl font-bold">🥛 MilkMate</h1>
          <p className="text-sm text-blue-200">Hello, {customer.name}</p>
        </div>
        <button
          onClick={onLogout}
          className="text-sm bg-white text-blue-600 px-3 py-1 rounded-lg font-medium hover:bg-blue-50"
        >
          Logout
        </button>
      </div>

      {/* Customer Info Bar */}
      <div className="bg-white px-6 py-3 flex gap-6 text-sm text-gray-600 border-b shadow-sm">
        <span>📦 Daily: <strong>{customer.daily_quantity}L</strong></span>
        <span>📍 {customer.address}</span>
        <span>🟢 Status: <strong className="text-green-600">{customer.status}</strong></span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm whitespace-pre-line shadow-sm
              ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none text-gray-400 text-sm shadow-sm">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white px-4 py-4 border-t flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your request..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>

    </div>
  )
}

export default Chat