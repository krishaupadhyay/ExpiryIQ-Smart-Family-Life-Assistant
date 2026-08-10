import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Mic, Sparkles, User, RefreshCw } from 'lucide-react'

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
  time: string
}

const quickPrompts = [
  '💊 Which medicines expire this week?',
  '🛒 Generate my grocery list',
  '⚡ How can I reduce electricity bill?',
  '📋 Which insurance renews soon?',
  '🎂 Any birthdays coming up?',
]

const INITIAL_MESSAGES: Message[] = []

const RESPONSES: Record<string, string> = {
  medicine: "💊 **Medicines Expiring Soon:**\n\n1. **Metformin 500mg** (Dadaji) — expires in **3 days** on Jul 23. Only 6 tablets remaining. Please reorder immediately.\n2. **Glimepiride 1mg** (Dadaji) — expires in **8 days** on Jul 28. Low stock (5 tablets).\n3. **Pantoprazole 40mg** (Sunita) — expires Jul 30, 10 days away.\n\n⚠️ Tip: Apollo Pharmacy has Metformin 500mg in stock. You can also use the 1mg-findia or Netmeds app for home delivery.",
  grocery: "🛒 **Smart Grocery List for This Week:**\n\nBased on your current PantryIQ inventory and typical consumption:\n\n**Urgent (buy today):**\n• Milk — 2 litres (critically low)\n• Paneer — 1 pack (out of stock)\n• Curd — 2 packs (low)\n\n**This Week:**\n• Toor Dal — 2 kg\n• Ghee — 500g\n• Red Chilli Powder — 100g\n• Coffee Powder — 200g\n\n💡 Buying dal and ghee in bulk saves ~₹120/month based on your usage pattern.",
  electricity: "⚡ **How to Reduce Your Electricity Bill:**\n\nYour BESCOM bill this month is ₹1,240 — ₹260 higher than last month. Here's what I suggest:\n\n1. **ACs at 24°C** instead of 18-20°C — saves 20-25% AC power\n2. **Turn off ACs** 30 min before sleeping — rooms stay cool enough\n3. **Switch to LED bulbs** if any old bulbs remain\n4. **Run washing machine on full load** — reduces cycles per week\n5. **Unplug chargers** when not in use\n\n💰 Estimated savings: ₹150–200/month (~₹2,000/year)",
  insurance: "📋 **Insurance Policies Renewing Soon:**\n\n🔴 **URGENT:**\n• **Honda City Car Insurance** (HDFC ERGO) — Renews **Jul 28** (8 days away!). Premium: ₹18,500. Call 1800-266-0700.\n\n🟡 **This Month:**\n• **Star Health Family Floater** — Renews Aug 5. Premium: ₹32,500 for ₹10 Lakh coverage.\n\n🟢 **Later:**\n• LIC Jeevan Anand — Sep 15\n\n💡 For car insurance, compare quotes on Policybazaar — you may get a better rate.",
  birthday: "🎂 **Upcoming Birthdays:**\n\n1. **Rajesh (Dad)** — July 24, just **4 days away!** 🥳\n   • He's turning 53. Order a cake today!\n   • Suggested gift: A health tracker watch (his BP needs monitoring)\n\n2. **Anjali (Neighbour)** — August 3, 14 days away\n\n3. **Sunita (Mom)** — September 8\n\n💝 Tip: Book a family dinner reservation for Dad's birthday in advance — weekends get booked fast!",
}

function getResponse(userText: string): string {
  const lower = userText.toLowerCase()
  if (lower.includes('medicine') || lower.includes('tablet') || lower.includes('expire') || lower.includes('drug') || lower.includes('meditrack'))
    return RESPONSES.medicine
  if (lower.includes('grocery') || lower.includes('pantry') || lower.includes('milk') || lower.includes('dal') || lower.includes('shopping'))
    return RESPONSES.grocery
  if (lower.includes('electric') || lower.includes('bill') || lower.includes('bescom') || lower.includes('energy'))
    return RESPONSES.electricity
  if (lower.includes('insurance') || lower.includes('policy') || lower.includes('renew') || lower.includes('premium'))
    return RESPONSES.insurance
  if (lower.includes('birthday') || lower.includes('anniversary') || lower.includes('event') || lower.includes('calendar'))
    return RESPONSES.birthday
  return "I'm analysing your family data... 🤔\n\nI can help you with:\n• **Medicines** — expiry alerts & dosage schedules\n• **Groceries** — smart shopping lists & low stock alerts\n• **Bills** — due dates, payment reminders, savings tips\n• **Insurance** — renewal tracking & policy details\n• **Family Events** — birthdays, anniversaries, tasks\n\nCould you ask me something specific about any of these areas?"
}

function formatText(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    if (line.startsWith('• ')) return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />
    if (line.match(/^\d+\./)) return <p key={i} className="mb-0.5" dangerouslySetInnerHTML={{ __html: bold }} />
    if (line === '') return <div key={i} className="h-2" />
    return <p key={i} className="mb-0.5" dangerouslySetInnerHTML={{ __html: bold }} />
  })
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const cleanText = text.replace(/^[🛒💊⚡📋🎂]\s*/, '').trim()

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: cleanText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response = getResponse(cleanText)
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMsg])
      setTyping(false)
    }, 1200 + Math.random() * 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 65px)' }}>
      {/* Chat Header */}
      <div className="relative overflow-hidden shrink-0 bg-violet-900">
        <img
          src="https://images.unsplash.com/photo-1750365919971-7dd273e7b317?w=1200&h=220&fit=crop&auto=format"
          alt="AI brain technology"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/95 via-violet-800/80 to-purple-800/70" />
        <div className="relative px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base">ExpiryIQ AI Assistant</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-violet-200 text-xs">Online · Knows your family data</span>
              </div>
            </div>
            <button
              onClick={() => setMessages(INITIAL_MESSAGES)}
              className="ml-auto bg-white/20 hover:bg-white/30 transition-colors rounded-xl p-2"
              title="Clear chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {['Medicine Alerts', 'Grocery Lists', 'Bill Reminders', 'Insurance Tracking', 'Family Events'].map(cap => (
              <span key={cap} className="shrink-0 text-[10px] font-semibold bg-white/15 border border-white/20 px-2.5 py-1 rounded-full">
                {cap}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
        {quickPrompts.map(p => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="shrink-0 text-xs font-medium bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#F8FAFC]">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-violet-600 to-purple-700'
                : 'bg-gradient-to-br from-orange-400 to-pink-500'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-white" />
              }
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                  : 'bg-violet-600 text-white'
              }`}>
                {msg.role === 'assistant'
                  ? <div className="space-y-0.5">{formatText(msg.text)}</div>
                  : <p>{msg.text}</p>
                }
              </div>
              <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about medicines, groceries, bills, insurance..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all pr-12"
              disabled={typing}
            />
          </div>
          <button
            type="button"
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 transition-colors"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="w-10 h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">AI responses are based on your family's data in ExpiryIQ.</p>
      </div>
    </div>
  )
}
