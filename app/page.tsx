'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'
import { createSupabaseClient } from '@/lib/supabase'

const supabase = createSupabaseClient()

export default function Home() {
  const [user, setUser] = useState<{
    user_metadata: {
      avatar_url: string
      full_name: string
    }
    email: string
  } | null>(null)

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
    }

    getUser()
  }, [])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    location.reload()
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">
            Music Social
          </h1>

          <button
            onClick={signInWithGoogle}
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:opacity-80 transition"
          >
            Continue with Google
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-2xl w-[400px] text-center">
        <Image
          src={user.user_metadata.avatar_url}
          alt="avatar"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />

        <h1 className="text-2xl font-bold mb-2">
          {user.user_metadata.full_name}
        </h1>

        <p className="text-zinc-400 mb-6">
          {user.email}
        </p>

        <button
          onClick={signOut}
          className="bg-red-500 px-4 py-2 rounded-xl hover:opacity-80 transition"
        >
          Logout
        </button>
      </div>
    </main>
  )
}