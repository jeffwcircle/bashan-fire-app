'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [status, setStatus] = useState('')

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus)

    await supabase.from('firefighter_status').insert([
      {
        status: newStatus,
        updated_at: new Date().toISOString(),
      },
    ])
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Firefighter Tracker
      </h1>

      <div className="grid gap-2">
        <button onClick={() => updateStatus('Responding to Station')} className="bg-blue-500 text-white p-3 rounded">
          Responding to Station
        </button>

        <button onClick={() => updateStatus('Responding to Scene')} className="bg-red-500 text-white p-3 rounded">
          Responding to Scene
        </button>

        <button onClick={() => updateStatus('Not Available')} className="bg-gray-500 text-white p-3 rounded">
          Not Available
        </button>
      </div>

      <p className="mt-4">Current Status: {status}</p>
    </main>
  )
}