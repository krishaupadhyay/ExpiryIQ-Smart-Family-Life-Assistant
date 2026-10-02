import { useState, useEffect } from 'react'
import {
  CalendarHeart,
  Plus,
  CheckCircle2,
  Circle,
  Gift,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2
} from 'lucide-react'
import { apiRequest } from '../services/api'

type FamilyEvent = {
  _id: string
  title: string
  date: string
  type: string
  memberName: string
}

type FamilyTask = {
  _id: string
  text: string
  due: string
  priority: 'low' | 'medium' | 'high'
  memberName: string
  done: boolean
}

type Birthday = {
  _id: string
  name: string
  date: string
  relation: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function daysUntilNextOccurrence(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()

  let next = new Date(
    today.getFullYear(),
    d.getMonth(),
    d.getDate()
  )

  if (next < today) {
    next = new Date(
      today.getFullYear() + 1,
      d.getMonth(),
      d.getDate()
    )
  }

  return Math.ceil(
    (next.getTime() - today.getTime()) / 86400000
  )
}

function MiniCalendar({ events }: { events: FamilyEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate()

  const eventDays = new Set(
    events
      .filter(e => {
        const d = new Date(e.date)

        return (
          d.getFullYear() === year &&
          d.getMonth() === month
        )
      })
      .map(e => new Date(e.date).getDate())
  )

  const cells: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  const today = new Date()

  const isToday = (d: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">
          {MONTHS[month]} {year}
        </h3>

        <div className="flex gap-1">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(year, month - 1, 1)
              )
            }
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() =>
              setCurrentDate(
                new Date(year, month + 1, 1)
              )
            }
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map(day => (
          <div
            key={day}
            className="text-center text-[10px] font-semibold text-slate-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`aspect-square flex flex-col items-center justify-center rounded-lg relative text-sm
              ${d === null ? '' : 'hover:bg-slate-100 cursor-pointer transition-colors'}
              ${
                d && isToday(d)
                  ? 'bg-blue-600 text-white font-bold hover:bg-blue-700'
                  : 'text-slate-700'
              }
            `}
          >
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
  const [tab, setTab] = useState<
    'events' | 'tasks' | 'birthdays'
  >('events')

  const [events, setEvents] = useState<FamilyEvent[]>([])
  const [tasks, setTasks] = useState<FamilyTask[]>([])
  const [birthdays, setBirthdays] = useState<Birthday[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState<
    'event' | 'task' | 'birthday' | null
  >(null)

  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    type: '',
    memberName: ''
  })

  const [taskForm, setTaskForm] = useState({
    text: '',
    due: '',
    priority: 'medium',
    memberName: ''
  })

  const [birthdayForm, setBirthdayForm] = useState({
    name: '',
    date: '',
    relation: ''
  })

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    try {
      setLoading(true)
      setError('')

      const [e, t, b] = await Promise.all([
        apiRequest('/familypulse/events', {
          method: 'GET'
        }),

        apiRequest('/familypulse/tasks', {
          method: 'GET'
        }),

        apiRequest('/familypulse/birthdays', {
          method: 'GET'
        })
      ])

      setEvents(e.events || [])
      setTasks(t.tasks || [])
      setBirthdays(b.birthdays || [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load family calendar.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleAddEvent(
    e: React.FormEvent
  ) {
    e.preventDefault()
    setFormError('')

    if (
      !eventForm.title.trim() ||
      !eventForm.date
    ) {
      setFormError(
        'Please fill in title and date.'
      )
      return
    }

    setFormLoading(true)

    try {
      await apiRequest(
        '/familypulse/events',
        {
          method: 'POST',
          body: JSON.stringify(eventForm)
        }
      )

      await loadAll()

      setEventForm({
        title: '',
        date: '',
        type: '',
        memberName: ''
      })

      setShowModal(null)
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Failed to add event.'
      )
    } finally {
      setFormLoading(false)
    }
  }

  async function handleAddTask(
    e: React.FormEvent
  ) {
    e.preventDefault()
    setFormError('')

    if (
      !taskForm.text.trim() ||
      !taskForm.due
    ) {
      setFormError(
        'Please fill in task and due date.'
      )
      return
    }

    setFormLoading(true)

    try {
      await apiRequest(
        '/familypulse/tasks',
        {
          method: 'POST',
          body: JSON.stringify(taskForm)
        }
      )

      await loadAll()

      setTaskForm({
        text: '',
        due: '',
        priority: 'medium',
        memberName: ''
      })

      setShowModal(null)
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Failed to add task.'
      )
    } finally {
      setFormLoading(false)
    }
  }

  async function handleAddBirthday(
    e: React.FormEvent
  ) {
    e.preventDefault()
    setFormError('')

    if (
      !birthdayForm.name.trim() ||
      !birthdayForm.date
    ) {
      setFormError(
        'Please fill in name and date.'
      )
      return
    }

    setFormLoading(true)

    try {
      await apiRequest(
        '/familypulse/birthdays',
        {
          method: 'POST',
          body: JSON.stringify(birthdayForm)
        }
      )

      await loadAll()

      setBirthdayForm({
        name: '',
        date: '',
        relation: ''
      })

      setShowModal(null)
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Failed to add birthday.'
      )
    } finally {
      setFormLoading(false)
    }
  }

  async function toggleTask(id: string) {
    try {
      await apiRequest(
        `/familypulse/tasks/${id}/toggle`,
        {
          method: 'PATCH'
        }
      )

      setTasks(prev =>
        prev.map(task =>
          task._id === id
            ? {
                ...task,
                done: !task.done
              }
            : task
        )
      )
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to update task.'
      )
    }
  }

  async function deleteEvent(id: string) {
    try {
      await apiRequest(
        `/familypulse/events/${id}`,
        {
          method: 'DELETE'
        }
      )

      setEvents(prev =>
        prev.filter(event => event._id !== id)
      )
    } catch {
      alert('Failed to delete event.')
    }
  }

  async function deleteTask(id: string) {
    try {
      await apiRequest(
        `/familypulse/tasks/${id}`,
        {
          method: 'DELETE'
        }
      )

      setTasks(prev =>
        prev.filter(task => task._id !== id)
      )
    } catch {
      alert('Failed to delete task.')
    }
  }

  async function deleteBirthday(id: string) {
    try {
      await apiRequest(
        `/familypulse/birthdays/${id}`,
        {
          method: 'DELETE'
        }
      )

      setBirthdays(prev =>
        prev.filter(birthday => birthday._id !== id)
      )
    } catch {
      alert('Failed to delete birthday.')
    }
  }

  const upcoming = events
    .filter(
      event =>
        new Date(event.date) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )
    .slice(0, 5)

  const now = new Date()

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

                <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">
                  ExpiryIQ Module
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-white drop-shadow">
                FamilyPulse
              </h1>

              <p className="text-pink-100 text-sm mt-1">
                Family calendar, events, birthdays &amp; task management
              </p>
            </div>

            <button
              onClick={() =>
                setShowModal(
                  tab === 'events'
                    ? 'event'
                    : tab === 'tasks'
                    ? 'task'
                    : 'birthday'
                )
              }
              className="shrink-0 flex items-center gap-2 bg-white text-pink-700 hover:bg-pink-50 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg transition-colors"
            >
              <Plus className="w-4 h-4" />

              Add{' '}
              {tab === 'events'
                ? 'Event'
                : tab === 'tasks'
                ? 'Task'
                : 'Birthday'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Upcoming Events',
            value: events.filter(
              event =>
                new Date(event.date) >= now
            ).length,
            bg: 'bg-pink-50',
            color: 'text-pink-600'
          },
          {
            label: 'This Month',
            value: events.filter(event => {
              const d = new Date(event.date)

              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() ===
                  now.getFullYear()
              )
            }).length,
            bg: 'bg-violet-50',
            color: 'text-violet-600'
          },
          {
            label: 'Tasks Pending',
            value: tasks.filter(
              task => !task.done
            ).length,
            bg: 'bg-orange-50',
            color: 'text-orange-600'
          },
          {
            label: 'Birthdays This Month',
            value: birthdays.filter(
              birthday =>
                new Date(birthday.date).getMonth() ===
                now.getMonth()
            ).length,
            bg: 'bg-blue-50',
            color: 'text-blue-600'
          }
        ].map(
          ({ label, value, bg, color }) => (
            <div
              key={label}
              className={`${bg} rounded-2xl p-4`}
            >
              <p
                className={`text-2xl font-extrabold ${color}`}
              >
                {value}
              </p>

              <p className="text-slate-600 text-xs font-medium mt-0.5">
                {label}
              </p>
            </div>
          )
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <p className="text-center text-slate-400 text-sm py-12">
          Loading…
        </p>
      ) : (
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Calendar */}
          <div className="lg:col-span-2">
            <MiniCalendar events={events} />

            {/* Upcoming Events */}
            <div className="mt-4 bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">
                  Coming Up Next
                </h3>
              </div>

              <div className="divide-y divide-slate-50">

                {upcoming.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No upcoming events
                  </p>
                )}

                {upcoming.map(event => {
                  const daysLeft = Math.ceil(
                    (new Date(event.date).getTime() -
                      Date.now()) /
                      86400000
                  )

                  return (
                    <div
                      key={event._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {event.title}
                        </p>

                        <p className="text-xs text-slate-400">
                          {event.memberName ||
                            event.type}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          daysLeft <= 3
                            ? 'bg-red-100 text-red-600'
                            : daysLeft <= 7
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {daysLeft === 0
                          ? 'Today'
                          : `${daysLeft}d`}
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
              {(
                [
                  {
                    key: 'events',
                    label: 'Events',
                    icon: Star
                  },
                  {
                    key: 'tasks',
                    label: 'Tasks',
                    icon: CheckCircle2
                  },
                  {
                    key: 'birthdays',
                    label: 'Birthdays',
                    icon: Gift
                  }
                ] as const
              ).map(
                ({
                  key,
                  label,
                  icon: Icon
                }) => (
                  <button
                    key={key}
                    onClick={() =>
                      setTab(key)
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tab === key
                        ? 'bg-white text-pink-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />

                    {label}
                  </button>
                )
              )}
            </div>

            {/* Events */}
            {tab === 'events' && (
              <div className="space-y-3">

                {events.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">
                    No events yet.
                  </p>
                )}

                {[...events]
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() -
                      new Date(b.date).getTime()
                  )
                  .map(event => {
                    const daysLeft = Math.ceil(
                      (new Date(event.date).getTime() -
                        Date.now()) /
                        86400000
                    )

                    return (
                      <div
                        key={event._id}
                        className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center shrink-0">
                          <CalendarHeart className="w-6 h-6 text-pink-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm">
                            {event.title}
                          </h3>

                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(
                              event.date
                            ).toLocaleDateString(
                              'en-IN',
                              {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'long'
                              }
                            )}

                            {event.memberName &&
                              ` · ${event.memberName}`}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                            daysLeft <= 0
                              ? 'bg-slate-100 text-slate-500'
                              : daysLeft <= 3
                              ? 'bg-red-100 text-red-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {daysLeft <= 0
                            ? 'Today'
                            : `${daysLeft} days`}
                        </span>

                        <button
                          onClick={() =>
                            deleteEvent(
                              event._id
                            )
                          }
                          className="text-slate-300 hover:text-red-500 shrink-0"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
              </div>
            )}

            {/* Tasks */}
            {tab === 'tasks' && (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">
                    Family Tasks
                  </span>

                  <span className="text-xs text-slate-400">
                    {tasks.filter(
                      task => !task.done
                    ).length}{' '}
                    pending
                  </span>
                </div>

                <div className="divide-y divide-slate-50">

                  {tasks.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-8">
                      No tasks yet.
                    </p>
                  )}

                  {tasks.map(task => (
                    <div
                      key={task._id}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <button
                        onClick={() =>
                          toggleTask(
                            task._id
                          )
                        }
                        title={
                          task.done
                            ? 'Mark incomplete'
                            : 'Mark complete'
                        }
                      >
                        {task.done ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                        )}
                      </button>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() =>
                          toggleTask(
                            task._id
                          )
                        }
                      >
                        <p
                          className={`text-sm font-medium truncate ${
                            task.done
                              ? 'line-through text-slate-400'
                              : 'text-slate-700'
                          }`}
                        >
                          {task.text}
                        </p>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Due:{' '}
                          {new Date(
                            task.due
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short'
                            }
                          )}

                          {task.memberName &&
                            ` · ${task.memberName}`}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          task.priority ===
                          'high'
                            ? 'bg-red-100 text-red-600'
                            : task.priority ===
                              'medium'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <button
                        onClick={() =>
                          deleteTask(
                            task._id
                          )
                        }
                        className="text-slate-300 hover:text-red-500 shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Birthdays */}
            {tab === 'birthdays' && (
              <div className="space-y-3">

                {birthdays.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">
                    No birthdays added yet.
                  </p>
                )}

                {birthdays.map(bday => {
                  const daysLeft =
                    daysUntilNextOccurrence(
                      bday.date
                    )

                  const initials = bday.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <div
                      key={bday._id}
                      className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {initials}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-sm">
                          {bday.name}
                        </h3>

                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(
                            bday.date
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'long'
                            }
                          )}

                          {bday.relation &&
                            ` · ${bday.relation}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm font-extrabold ${
                            daysLeft <= 7
                              ? 'text-pink-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {daysLeft}d
                        </p>

                        <p className="text-[10px] text-slate-400">
                          to go
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          deleteBirthday(
                            bday._id
                          )
                        }
                        className="text-slate-300 hover:text-red-500 shrink-0"
                        title="Delete birthday"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showModal === 'event' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800">
                Add Event
              </h3>

              <button
                onClick={() => {
                  setShowModal(null)
                  setFormError('')
                }}
                className="text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddEvent}
              className="space-y-3.5"
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Title *
                </label>

                <input
                  value={eventForm.title}
                  onChange={e =>
                    setEventForm({
                      ...eventForm,
                      title: e.target.value
                    })
                  }
                  placeholder="e.g. Diwali Celebration"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Date *
                </label>

                <input
                  type="date"
                  value={eventForm.date}
                  onChange={e =>
                    setEventForm({
                      ...eventForm,
                      date: e.target.value
                    })
                  }
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Type
                </label>

                <input
                  value={eventForm.type}
                  onChange={e =>
                    setEventForm({
                      ...eventForm,
                      type: e.target.value
                    })
                  }
                  placeholder="e.g. Festival"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Family member
                </label>

                <input
                  value={eventForm.memberName}
                  onChange={e =>
                    setEventForm({
                      ...eventForm,
                      memberName: e.target.value
                    })
                  }
                  placeholder="Optional"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-500">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(null)
                    setFormError('')
                  }}
                  className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  {formLoading
                    ? 'Saving…'
                    : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showModal === 'task' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800">
                Add Task
              </h3>

              <button
                onClick={() => {
                  setShowModal(null)
                  setFormError('')
                }}
                className="text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddTask}
              className="space-y-3.5"
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Task *
                </label>

                <input
                  value={taskForm.text}
                  onChange={e =>
                    setTaskForm({
                      ...taskForm,
                      text: e.target.value
                    })
                  }
                  placeholder="e.g. Pay society maintenance"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Due date *
                </label>

                <input
                  type="date"
                  value={taskForm.due}
                  onChange={e =>
                    setTaskForm({
                      ...taskForm,
                      due: e.target.value
                    })
                  }
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Priority
                </label>

                <div className="flex gap-2 mt-1.5">
                  {(
                    ['low', 'medium', 'high'] as const
                  ).map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() =>
                        setTaskForm({
                          ...taskForm,
                          priority
                        })
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        taskForm.priority ===
                        priority
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Assign to
                </label>

                <input
                  value={taskForm.memberName}
                  onChange={e =>
                    setTaskForm({
                      ...taskForm,
                      memberName: e.target.value
                    })
                  }
                  placeholder="Optional"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-500">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(null)
                    setFormError('')
                  }}
                  className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  {formLoading
                    ? 'Saving…'
                    : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Birthday Modal */}
      {showModal === 'birthday' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800">
                Add Birthday
              </h3>

              <button
                onClick={() => {
                  setShowModal(null)
                  setFormError('')
                }}
                className="text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddBirthday}
              className="space-y-3.5"
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Name *
                </label>

                <input
                  value={birthdayForm.name}
                  onChange={e =>
                    setBirthdayForm({
                      ...birthdayForm,
                      name: e.target.value
                    })
                  }
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Birth date *
                </label>

                <input
                  type="date"
                  value={birthdayForm.date}
                  onChange={e =>
                    setBirthdayForm({
                      ...birthdayForm,
                      date: e.target.value
                    })
                  }
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Relation
                </label>

                <input
                  value={birthdayForm.relation}
                  onChange={e =>
                    setBirthdayForm({
                      ...birthdayForm,
                      relation: e.target.value
                    })
                  }
                  placeholder="e.g. Father"
                  className="w-full mt-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-500">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(null)
                    setFormError('')
                  }}
                  className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-xl text-sm text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  {formLoading
                    ? 'Saving…'
                    : 'Save Birthday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}