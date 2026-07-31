import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早安'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

// Get English greeting
export function getEnglishGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'GOOD NIGHT'
  if (hour < 12) return 'GOOD MORNING'
  if (hour < 18) return 'GOOD AFTERNOON'
  if (hour < 22) return 'GOOD EVENING'
  return 'GOOD NIGHT'
}

// Format date
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// Random avatar number (1-7)
export function randomAvatar(): number {
  return Math.floor(Math.random() * 7) + 1
}
