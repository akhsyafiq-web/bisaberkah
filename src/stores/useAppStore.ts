import { create } from 'zustand'
import type { Profile, Category } from '@/types/database'

interface AppState {
  userProfile: Profile | null
  currentHouseholdId: string | null
  categories: Category[]
  setProfile: (profile: Profile) => void
  setHouseholdId: (id: string) => void
  setCategories: (cats: Category[]) => void
  reset: () => void
}

export const useAppStore = create<AppState>(set => ({
  userProfile: null,
  currentHouseholdId: null,
  categories: [],
  setProfile: profile => set({ userProfile: profile }),
  setHouseholdId: id => set({ currentHouseholdId: id }),
  setCategories: cats => set({ categories: cats }),
  reset: () => set({ userProfile: null, currentHouseholdId: null, categories: [] }),
}))
