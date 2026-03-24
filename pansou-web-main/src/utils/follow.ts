import type { FollowItem, SearchItem, SearchSourceType } from '../types/search'

const FOLLOW_KEY = 'pansou_follow_list_v1'
const MAX_FOLLOW_COUNT = 200

const canUseStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const buildFollowKey = (keyword: string, sourceType: SearchSourceType) => `${keyword.trim()}::${sourceType}`

const sanitizeItems = (items: FollowItem[]) =>
  items
    .filter((item) => item.keyword.trim().length > 0 && item.lastSnapshot?.url)
    .slice(0, MAX_FOLLOW_COUNT)

export const readFollowList = (): FollowItem[] => {
  if (!canUseStorage()) {
    return []
  }

  const raw = localStorage.getItem(FOLLOW_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as FollowItem[]
    return sanitizeItems(parsed)
  } catch {
    return []
  }
}

const writeFollowList = (items: FollowItem[]) => {
  if (!canUseStorage()) {
    return
  }

  try {
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(sanitizeItems(items)))
  } catch {
    // Ignore storage failures to avoid blocking search flow.
  }
}

export const addFollowItem = ({ keyword, sourceType, item }: { keyword: string; sourceType: SearchSourceType; item: SearchItem }): FollowItem[] => {
  const normalizedKeyword = keyword.trim()
  if (!normalizedKeyword) {
    return readFollowList()
  }

  const now = Date.now()
  const key = buildFollowKey(normalizedKeyword, sourceType)

  const nextItem: FollowItem = {
    key,
    keyword: normalizedKeyword,
    sourceType,
    createdAt: now,
    updatedAt: now,
    linkUnchanged: true,
    lastSnapshot: {
      url: item.url,
      password: item.password,
      datetime: item.datetime,
      source: item.source,
      note: item.note,
    },
  }

  const current = readFollowList()
  const index = current.findIndex((entry) => entry.key === key)

  let next: FollowItem[]
  if (index >= 0) {
    const existing = current[index]
    nextItem.createdAt = existing.createdAt
    nextItem.linkUnchanged = existing.lastSnapshot.url === item.url
    next = [nextItem, ...current.filter((entry) => entry.key !== key)]
  } else {
    next = [nextItem, ...current]
  }

  writeFollowList(next)
  return sanitizeItems(next)
}

export const refreshFollowSnapshot = ({ followItem, item }: { followItem: FollowItem; item: SearchItem }): FollowItem[] => {
  const now = Date.now()
  const current = readFollowList()
  const next = current.map((entry) => {
    if (entry.key !== followItem.key) {
      return entry
    }

    return {
      ...entry,
      updatedAt: now,
      linkUnchanged: entry.lastSnapshot.url === item.url,
      lastSnapshot: {
        url: item.url,
        password: item.password,
        datetime: item.datetime,
        source: item.source,
        note: item.note,
      },
    }
  })

  writeFollowList(next)
  return sanitizeItems(next)
}

export const removeFollowItem = (key: string): FollowItem[] => {
  const next = readFollowList().filter((item) => item.key !== key)
  writeFollowList(next)
  return sanitizeItems(next)
}

export const clearFollowList = () => {
  if (!canUseStorage()) {
    return
  }

  localStorage.removeItem(FOLLOW_KEY)
}

export const pickSnapshotForSource = (items: SearchItem[], sourceType: SearchSourceType): SearchItem | null => {
  if (items.length === 0) {
    return null
  }

  if (sourceType === 'magnet') {
    return items[0]
  }

  return items[0]
}
