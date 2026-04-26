'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [statuses, setStatuses] = useState<any[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState('')
  const router = useRouter()

  // 🎨 STATUS COLORS
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Responding to Station':
        return 'bg-blue-500 text-white'
      case 'Responding to Scene':
        return 'bg-red-500 text-white'
      case 'Not Available':
        return 'bg-gray-600 text-white'
      case 'No Status':
        return 'bg-gray-300 text-black'
      default:
        return 'bg-gray-200 text-black'
    }
  }

  // 🟢 ACTIVE BUTTON STYLE
  const isActive = (status: string) => {
    return currentStatus === status
      ? 'ring-4 ring-yellow-300 scale-[1.02]'
      : ''
  }

  // 🕒 TIME AGO
  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return "N/A"

    const now = Date.now()
    const time = new Date(timestamp).getTime()
    const minutes = Math.floor((now - time) / 60000)

    if (minutes < 1) return "Just now"
    if (minutes === 1) return "1 minute ago"
    if (minutes < 60) return `${minutes} minutes ago`

    const hours = Math.floor(minutes / 60)
    if (hours === 1) return "1 hour ago"

    return `${hours} hours ago`
  }

  // 🔐 LOGIN
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
        fetchStatuses()
      }
    }

    getUser()
  }, [])

  // 🔄 AUTO REFRESH
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatuses()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // 📊 FETCH + AUTO RESET
  const fetchStatuses = async () => {
    const { data, error } = await supabase
      .from('firefighter_status')
      .select(`
        status,
        user_id,
        updated_at,
        profiles (
          first_name,
          last_name
        )
      `)

    if (error) {
      console.log(error)
      return
    }

    const now = Date.now()
    const expiredUsers: string[] = []

    const updatedData = data.map((item: any) => {
      if (!item.updated_at) return item

      const updatedTime = new Date(item.updated_at).getTime()
      const minutes = (now - updatedTime) / 60000

      if (minutes >= 30 && item.status !== 'No Status') {
        expiredUsers.push(item.user_id)

        return {
          ...item,
          status: 'No Status'
        }
      }

      return item
    })

    // 🔥 DB UPDATE
    if (expiredUsers.length > 0) {
      await supabase
        .from('firefighter_status')
        .update({
          status: 'No Status',
          updated_at: new Date().toISOString()
        })
        .in('user_id', expiredUsers)
    }

    setStatuses(updatedData)
  }

  // 🔄 UPDATE STATUS
  const updateStatus = async (newStatus: string) => {
    if (!user) return

    setCurrentStatus(newStatus)

    await supabase.from('firefighter_status').upsert(
      {
        user_id: user.id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    fetchStatuses()
  }

  // 🔄 GROUP
  const grouped = statuses.reduce((acc: any, item: any) => {
    const status = item.status || 'No Status'
    if (!acc[status]) acc[status] = []
    acc[status].push(item)
    return acc
  }, {})

  const toggle = (status: string) => {
    setExpanded(expanded === status ? null : status)
  }

  if (!user) return <p className="p-4">Loading...</p>

  return (
    <main className="p-4">
      <button onClick={() => router.push("/")}>⬅ Back</button>

      {/* 🔥 STATUS BUTTONS */}
      <h1 className="text-2xl font-bold mb-2">
        Set Your Status
      </h1>


<div className="grid gap-5 mb-6">

  <button
    onClick={() => updateStatus('Responding to Station')}
    className={`w-full min-h-[70px] text-xl font-semibold py-6 px-6 bg-blue-500 text-white rounded-full shadow-lg hover:opacity-90 active:scale-95 transition transform flex items-center justify-center gap-2 ${isActive('Responding to Station')}`}
  >
    🚒 Responding to Station
  </button>

  <button
    onClick={() => updateStatus('Responding to Scene')}
    className={`w-full min-h-[70px] text-xl font-semibold py-6 px-6 bg-red-500 text-white rounded-full shadow-lg hover:opacity-90 active:scale-95 transition transform flex items-center justify-center gap-2 ${isActive('Responding to Scene')}`}
  >
    🔥 Responding to Scene
  </button>

  <button
    onClick={() => updateStatus('Not Available')}
    className={`w-full min-h-[70px] text-xl font-semibold py-6 px-6 bg-gray-500 text-white rounded-full shadow-lg hover:opacity-90 active:scale-95 transition transform flex items-center justify-center gap-2 ${isActive('Not Available')}`}
  >
    ⛔ Not Available
  </button>

</div>


      <p className="mb-6">
        Current Status: <strong>{currentStatus || 'None'}</strong>
      </p>

      {/* 📊 STATUS BOARD */}
      <h2 className="text-xl font-bold mb-3">
        Firefighter Status Board
      </h2>

      {Object.keys(grouped).map((status) => (
        <div
          key={status}
          className="mb-6 border rounded overflow-hidden shadow-md bg-white"
        >

          {/* HEADER */}
          <div
            onClick={() => toggle(status)}
            className={`p-3 cursor-pointer font-semibold flex justify-between ${getStatusColor(status)}`}
          >
            <span>
              {status === 'Responding to Station' && '🚒 '}
              {status === 'Responding to Scene' && '🔥 '}
              {status === 'Not Available' && '⛔ '}
              {status === 'No Status' && '❔ '}
              {status}
            </span>

            <span>({grouped[status].length})</span>
          </div>

          <div className="h-[2px] bg-gray-200"></div>

          {/* LIST */}
          {expanded === status && (
            <div className="p-3 bg-gray-50 space-y-2">

              {grouped[status].map((item: any, index: number) => (
                <div key={index} className="p-2 bg-white rounded shadow-sm">

                    {item.profiles?.first_name} {item.profiles?.last_name}  |  Last Updated: {formatTimeAgo(item.updated_at)}

                </div>
              ))}

            </div>
          )}
        </div>
      ))}
    </main>
  )
}