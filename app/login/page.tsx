'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [message, setMessage] = useState('')

  // 🔐 LOGIN
  const handleLogin = async () => {
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    // ✅ Redirect after login
    router.push('/')
  }

  // 📝 SIGN UP
  const handleSignUp = async () => {
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
          },
        ])

      if (profileError) {
        setMessage(profileError.message)
        return
      }

      setMessage(
        'Account created! Siging in!'
      )
      router.push('/')
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Firefighter Login
      </h1>

      {/* First Name */}
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      {/* Last Name */}
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-3 rounded"
      />

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white p-2 rounded flex-1"
        >
          Login
        </button>

        <button
          onClick={handleSignUp}
          className="bg-green-500 text-white p-2 rounded flex-1"
        >
          Sign Up
        </button>
      </div>

      {/* Message */}
      {message && (
        <p className="mt-3 text-sm text-center text-gray-700">
          {message}
        </p>
      )}
    </div>
  )
}