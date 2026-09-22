import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react'
import { apiRequest } from '../services/api'

type Message = { id: number; role: 'user' | 'assistant'; text: string; time: string }

const quickPrompts = [
  '💊 Which medicines expire this week?',
  '📄 Any documents expiring soon?',
  '📋 Which insurance renews soon?',
  '💡 What bills are due?',
  '🎂 Any birthdays coming up?',
]

function formatText(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bold.replace(/^[-•]\s*/, '') }} />
    }
    if (line === '') return <div key={i} className="h-2" />
    return <p key={i} className="mb-0.5" dangerouslySetInnerHTML={{ __html: bold }} />
  })
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function sendMessage(text: string) {
    if (!text.trim() || typing) return
    const cleanText = text.replace(/^[🛒💊⚡📋🎂📄💡]\s*/, '').trim()

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: cleanText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setError('')

    try {
      // Send a short rolling history so the AI has conversational context
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.text }))

      const data = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: cleanText, history })
      })

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.reply,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assistant could not respond. Please try again.')
    } finally {
      setTyping(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 65px)' }}>
      <div className="relative overflow-hidden shrink-0 bg-violet-900">
        <img src="https://images.unsplash.com/photo-1750365919971-7dd273e7b317?w=1200&h=220&fit=crop&auto=format" alt="AI brain technology" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/95 via-violet-800/80 to-purple-800/70" />
        <div className="relative px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30"><Bot className="w-5 h-5" /></div>
            <div>
              <h1 className="font-extrabold text-base">ExpiryIQ AI Assistant</h1>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /><span className="text-violet-200 text-xs">Online · Knows your family data</span></div>
            </div>
            <button onClick={() => { setMessages([]); setError('') }} className="ml-auto bg-white/20 hover:bg-white/30 transition-colors rounded-xl p-2" title="Clear chat"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {['Medicines', 'Documents', 'Insurance', 'Bills', 'Family Events'].map(cap => (
              <span key={cap} className="shrink-0 text-[10px] font-semibold bg-white/15 border border-white/20 px-2.5 py-1 rounded-full">{cap}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
        {quickPrompts.map(p => (
          <button key={p} onClick={() => sendMessage(p)} className="shrink-0 text-xs font-medium bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full transition-colors">{p}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#F8FAFC]">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-10 h-10 text-violet-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Ask me anything about your family's medicines, documents, bills, or events.</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-violet-600 to-purple-700' : 'bg-gradient-to-br from-orange-400 to-pink-500'}`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-white border border-slate-100 text-slate-700 shadow-sm' : 'bg-violet-600 text-white'}`}>
                {msg.role === 'assistant' ? <div className="space-y-0.5">{formatText(msg.text)}</div> : <p>{msg.text}</p>}
              </div>
              <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-white" /></div>
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
              </div>
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-slate-100 px-4 py-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about medicines, documents, bills, insurance..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
              disabled={typing}
            />
          </div>
          <button type="submit" disabled={!input.trim() || typing} className="w-10 h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">AI responses are based on your family's real data in ExpiryIQ.</p>
      </div>
    </div>
  )
}
