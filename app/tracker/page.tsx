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

  // 🔐 Check login
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

  // 📊 Fetch all statuses
  const fetchStatuses = async () => {
    const { data, error } = await supabase
      .from('firefighter_status')
      .select(`
        status,
        user_id,
        profiles (
          first_name,
          last_name
        )
      `)

    if (error) {
      console.log(error)
    } else {
      setStatuses(data)
    }
  }

  // 🔄 Update status (UPSERT)
  const updateStatus = async (newStatus: string) => {
    if (!user) return

    setCurrentStatus(newStatus)

    const { error } = await supabase.from('firefighter_status').upsert(
      {
        user_id: user.id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      console.log(error)
    } else {
      fetchStatuses() // 🔄 refresh dashboard
    }
  }

  // 🔄 Group statuses
  const grouped = statuses.reduce((acc: any, item: any) => {
    const status = item.status || 'No Status'
    if (!acc[status]) acc[status] = []
    acc[status].push(item)
    return acc
  }, {})

  // 🔁 Toggle expand
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

      <div className="grid gap-2 mb-4">
        <button
          onClick={() => updateStatus('Responding to Station')}
          className="bg-blue-500 text-white p-3 rounded"
        >
          Responding to Station
        </button>

        <button
          onClick={() => updateStatus('Responding to Scene')}
          className="bg-red-500 text-white p-3 rounded"
        >
          Responding to Scene
        </button>

        <button
          onClick={() => updateStatus('Not Available')}
          className="bg-gray-500 text-white p-3 rounded"
        >
          Not Available
        </button>
      </div>

      <p className="mb-6">
        Current Status: {currentStatus}
      </p>

      {/* 📊 STATUS BOARD */}
      <h2 className="text-xl font-bold mb-3">
        Firefighter Status Board
      </h2>

      {Object.keys(grouped).map((status) => (
        <div key={status} className="mb-3 border rounded">
          
          {/* Header */}
          <div
            onClick={() => toggle(status)}
            className="p-3 bg-gray-200 cursor-pointer font-semibold flex justify-between"
          >
            <span>{status}</span>
            <span>({grouped[status].length})</span>
          </div>

          {/* Expanded List */}
          {expanded === status && (
            <div className="p-2">
              {grouped[status].map((item: any, index: number) => (
                <div key={index} className="p-1 border-b">
                  {item.profiles?.first_name} {item.profiles?.last_name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </main>
  )
}