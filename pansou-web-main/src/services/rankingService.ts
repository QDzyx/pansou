import type { RankingApiResponse, RankingCategory } from '../types/search'

const DEFAULT_BASE_URL = ''

const getBaseUrl = () =>
  (import.meta.env.VITE_PANSOU_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '')

const RANKING_API_URL = `${getBaseUrl()}/api/douban/rankings`

const isValidRankingResponse = (payload: unknown): payload is RankingApiResponse => {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const data = (payload as { data?: unknown }).data
  if (!data || typeof data !== 'object') {
    return false
  }

  return Array.isArray((data as { rankings?: unknown }).rankings)
}

export const fetchRankingList = async (): Promise<RankingCategory[]> => {
  const response = await fetch(RANKING_API_URL)
  if (!response.ok) {
    throw new Error(`榜单接口请求失败(${response.status})`)
  }

  const payload: unknown = await response.json()
  if (!isValidRankingResponse(payload)) {
    throw new Error('榜单接口返回格式无效')
  }

  if (payload.code !== 0) {
    throw new Error(payload.message || '榜单接口返回失败')
  }

  return payload.data.rankings.map((category) => ({
    id: category.type,
    name: category.name,
    items: category.items.map((item) => ({
      id: item.subject_id,
      title: item.title,
      rank: item.rank,
      rating: item.score,
      url: item.url,
    })),
  }))
}
