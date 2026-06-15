import { supabase } from './supabaseClient'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

export async function processCustomerMessage(message, customer) {
  const today = new Date().toISOString().split('T')[0]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a milk delivery assistant. Today is ${today}.
Extract the customer's request and respond ONLY with a JSON object like this:

{
  "action": "pause" | "resume" | "extra_order",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD" or null,
  "quantity": number or null,
  "reply": "friendly confirmation message to customer"
}

Rules:
- action "pause" = customer wants to skip delivery
- action "resume" = customer wants to restart delivery
- action "extra_order" = customer wants additional quantity
- Always fill start_date
- For single day requests, start_date and end_date are the same
- reply should be warm, short and in simple English
- Return ONLY the JSON, no extra text`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.3
    })
  })

  const data = await response.json()
  const raw = data.choices[0].message.content.trim()

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { reply: "Sorry, I didn't understand that. Can you rephrase?" }
  }

  const { error } = await supabase.from('delivery_logs').insert({
    customer_id: customer.id,
    action: parsed.action,
    start_date: parsed.start_date,
    end_date: parsed.end_date || parsed.start_date,
    quantity: parsed.quantity,
    note: message
  })

  if (error) {
    console.error('DB error:', error)
    return { reply: "I understood your request but couldn't save it. Please try again." }
  }

  if (parsed.action === 'pause') {
    await supabase.from('customers').update({ status: 'paused' }).eq('id', customer.id)
  } else if (parsed.action === 'resume') {
    await supabase.from('customers').update({ status: 'active' }).eq('id', customer.id)
  }

  return { reply: parsed.reply }
}