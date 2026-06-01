'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function getAuthErrorMessage(code: string | undefined): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Email atau password salah'
    case 'email_not_confirmed':
      return 'Email belum dikonfirmasi. Cek inbox kamu'
    case 'user_already_exists':
    case 'email_exists':
      return 'Email sudah terdaftar. Silakan login'
    case 'weak_password':
      return 'Password terlalu lemah'
    default:
      return 'Terjadi kesalahan. Coba lagi'
  }
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function signInWithEmail(email: string, password: string) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const message = getAuthErrorMessage(error.code)
        toast.error(message)
        return { error: message }
      }
      router.push('/dashboard')
      router.refresh()
      return { error: null }
    } finally {
      setLoading(false)
    }
  }

  async function signUpWithEmail(name: string, email: string, password: string) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) {
        const message = getAuthErrorMessage(error.code)
        toast.error(message)
        return { error: message }
      }
      toast.success('Akun berhasil dibuat! Selamat datang di BisaBerkah 🌿')
      router.push('/dashboard')
      router.refresh()
      return { error: null }
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        toast.error('Gagal masuk dengan Google')
        return { error: error.message }
      }
      return { error: null }
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return { loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }
}
