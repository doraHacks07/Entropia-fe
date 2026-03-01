import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Truncate Unlink (unlink1...) or hex (0x...) addresses for display */
export function truncateAddress(address: string, prefixLen = 12, suffixLen = 6): string {
  if (!address || address.length <= prefixLen + suffixLen + 3) return address
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`
}
