import type { HistoryItem } from '../types/search'

const HISTORY_KEY = 'pansou_search_history_v1'
const MAX_HISTORY_COUNT = 100

const canUseStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

export const readHistory = (): HistoryItem[] => {
  if (!canUseStorage()) {
    return []
  }

  const raw = localStorage.getItem(HISTORY_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as HistoryItem[]
    return parsed.filter((item) => item.keyword.trim().length > 0).slice(0, MAX_HISTORY_COUNT)
  } catch {
    return []
  }
}

const writeHistory = (items: HistoryItem[]) => {
  if (!canUseStorage()) {
    return
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_COUNT)))
}

export const appendHistory = (keyword: string): HistoryItem[] => {
  const normalized = keyword.trim()
  if (!normalized) {
    return readHistory()
  }

  const current = readHistory()
  const deduped = current.filter((item) => item.keyword !== normalized)
  const next = [{ keyword: normalized, ts: Date.now() }, ...deduped].slice(0, MAX_HISTORY_COUNT)
  writeHistory(next)
  return next
}

export const removeHistory = (keyword: string): HistoryItem[] => {
  const next = readHistory().filter((item) => item.keyword !== keyword)
  writeHistory(next)
  return next
}

export const clearHistory = () => {
  if (!canUseStorage()) {
    return
  }
  localStorage.removeItem(HISTORY_KEY)
}
