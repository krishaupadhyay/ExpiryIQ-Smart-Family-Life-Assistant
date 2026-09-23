import { useState } from 'react'
import { CalendarHeart, Plus, CheckCircle2, Circle, Gift, Star, ChevronLeft, ChevronRight } from 'lucide-react'

type FamilyEvent = { id: number; title: string; date: string; type: string; member: string; color: string; dot: string; icon: string }

const events: FamilyEvent[] = []

const tasks: any[] = []

const birthdays: any[] = []

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function MiniCalendar({ events }: { events: FamilyEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1))
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const eventDays = new Set(
    events
      .filter((e: FamilyEvent) => {
        const d = new Date(e.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map((e: FamilyEvent) => new Date(e.date).getDate())
  )

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const today = new Date()
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">{MONTHS[month]} {year}</h3>
        <div className="flex gap-1">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg relative text-sm
            ${d === null ? '' : 'hover:bg-slate-100 cursor-pointer transition-colors'}
            ${d && isToday(d) ? 'bg-blue-600 text-white font-bold hover:bg-blue-700' : 'text-slate-700'}
          `}>
            {d && (
              <>
                <span>{d}</span>
                {eventDays.has(d) && !isToday(d) && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-500" />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FamilyPulse() {
  const [tab, setTab] = useState<'events' | 'tasks' | 'birthdays'>('events')
  const [taskStates, setTaskStates] = useState<Record<number, boolean>>(
    Object.fromEntries(tasks.map(t => [t.id, t.done]))
  )

  const toggleTask = (id: number) => setTaskStates(prev => ({ ...prev, [id]: !prev[id] }))

  const upcoming = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Hero Banner */}
      <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 relative h-48 sm:h-56 overflow-hidden bg-pink-900">
        <img
          src="https://images.unsplash.com/photo-1728024450683-7f00f07ed820?w=1200&h=400&fit=crop&auto=format"
          alt="Indian family celebrating birthday together"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/85 via-pink-800/50 to-transparent" />
        <div className="absolute inset-0 flex items-end p-5 lg:p-7">
          <div className="flex items-end justify-between w-full gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <CalendarHeart className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">ExpiryIQ Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow">FamilyPulse</h1>
              <p className="text-pink-100 text-sm mt-1">Family calendar, events, birthdays &amp; task management</p>
            </div>
            <button className="shrink-0 flex items-center gap-2 bg-white text-pink-700 hover:bg-pink-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Upcoming Events', value: events.filter(e => new Date(e.date) >= new Date()).length, bg: 'bg-pink-50', color: 'text-pink-600' },
          { label: 'This Month', value: events.filter(e => { const d = new Date(e.date); return d.getMonth() === 6 && d.getFullYear() === 2025 }).length, bg: 'bg-violet-50', color: 'text-violet-600' },
          { label: 'Tasks Pending', value: tasks.filter(t => !t.done).length, bg: 'bg-orange-50', color: 'text-orange-600' },
          { label: 'Birthdays Soon', value: birthdays.filter(b => b.daysLeft <= 30).length, bg: 'bg-blue-50', color: 'text-blue-600' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-600 text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <MiniCalendar events={events} />

          {/* Upcoming Events Preview */}
          <div className="mt-4 bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Coming Up Next</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {upcoming.map(event => {
                const daysLeft = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)
                return (
                  <div key={event.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <span className="text-lg">{event.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{event.title}</p>
                      <p className="text-xs text-slate-400">{event.member}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      daysLeft <= 3 ? 'bg-red-100 text-red-600' : daysLeft <= 7 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Panels */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            {([
              { key: 'events', label: 'Events', icon: Star },
              { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
              { key: 'birthdays', label: 'Birthdays', icon: Gift },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === key ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {tab === 'events' && (
            <div className="space-y-3">
              {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => {
                const daysLeft = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)
                return (
                  <div key={event.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 shrink-0">
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm">{event.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })} · {event.member}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${event.color}`}>
                        {daysLeft <= 0 ? 'Today' : `${daysLeft} days`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'tasks' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Family Tasks</span>
                <span className="text-xs text-slate-400">{tasks.filter(t => !taskStates[t.id]).length} pending</span>
              </div>
              <div className="divide-y divide-slate-50">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => toggleTask(task.id)}
                  >
                    {taskStates[task.id]
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      : <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${taskStates[task.id] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {task.text}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Due: {new Date(task.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === 'high' ? 'bg-red-100 text-red-600' :
                      task.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'birthdays' && (
            <div className="space-y-3">
              {birthdays.map(bday => (
                <div key={bday.name} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bday.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {bday.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm">{bday.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {bday.date} {bday.age ? `· Turning ${bday.age}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-extrabold ${bday.daysLeft <= 7 ? 'text-pink-600' : 'text-slate-700'}`}>{bday.daysLeft}d</p>
                    <p className="text-[10px] text-slate-400">to go</p>
                  </div>
                  {bday.daysLeft <= 7 && (
                    <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0">
                      🎂 Plan
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
