import { create } from 'zustand'

interface AuthState {
  token: string
  adminName: string
  setAuth: (token: string, adminName: string) => void
  clearAuth: () => void
}

export const useStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token') || '',
  adminName: localStorage.getItem('adminName') || '',
  setAuth: (token, adminName) => {
    localStorage.setItem('token', token)
    localStorage.setItem('adminName', adminName)
    set({ token, adminName })
  },
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminName')
    set({ token: '', adminName: '' })
  },
}))
