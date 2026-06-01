'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
  DrawerDescription, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

export function SettingsSignOut() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Kamu sudah keluar')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-destructive/30 bg-card px-4 py-3.5 text-left transition-colors active:bg-muted/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF3F2]">
          <LogOut className="h-4 w-4 text-destructive" />
        </span>
        <span className="text-sm font-medium text-destructive">Keluar</span>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Keluar dari BisaBerkah?</DrawerTitle>
            <DrawerDescription>
              Kamu bisa masuk kembali kapan saja.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <Button variant="destructive" onClick={handleSignOut} disabled={loading} className="h-12">
              {loading ? 'Keluar…' : 'Ya, Keluar'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="h-12">
              Batal
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
