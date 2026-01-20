import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function chromeColorToHex(color: number): string {
  const rgb = color >>> 0
  const r = (rgb >> 16) & 255
  const g = (rgb >> 8) & 255
  const b = rgb & 255
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}
