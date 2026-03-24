export type SearchSourceType = string

export type SearchSource = 'all' | 'tg' | 'plugin'

export type SearchResMode = 'merge' | 'results' | 'all'

export interface SearchFilter {
  include: string[]
  exclude: string[]
}

export interface SearchParams {
  kw: string
  channels?: string[] | string
  plugins?: string[] | string
  cloud_types?: string[] | string
  src?: SearchSource
  refresh?: boolean
  res?: SearchResMode
  conc?: number
  ext?: Record<string, unknown>
  filter?: SearchFilter
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface MergedLink {
  url: string
  password: string
  note: string
  datetime: string
  source: string
  images?: string[]
}

export interface SearchResult extends MergedLink {
  cloud_type?: string
  source_type?: string
}

export type MergedByType = Record<string, MergedLink[]>

export interface SearchData {
  total: number
  results?: SearchResult[]
  merged_by_type?: Record<string, MergedLink[]>
}

export type SearchResponse = ApiResponse<SearchData>

export interface HealthData {
  channels: string[]
  channels_count?: number
  plugins_enabled: boolean
  plugins: string[]
  plugin_count?: number
}

export type HealthResponse = ApiResponse<HealthData>

export interface QueryConfig {
  selectedChannels: string[]
  selectedPlugins: string[]
  selectedCloudTypes: string[]
  extJson: string
  includeText: string
  excludeText: string
}

export type SearchItem = MergedLink

export interface RankingApiItem {
  subject_id: string
  title: string
  url: string
  rank: number
  score: number
}

export interface RankingApiCategory {
  type: string
  name: string
  total: number
  updated_at: string
  items: RankingApiItem[]
}

export interface RankingApiData {
  rankings: RankingApiCategory[]
}

export type RankingApiResponse = ApiResponse<RankingApiData>

export interface RankingItem {
  id: string
  title: string
  rank: number
  rating: number
  url: string
}

export interface RankingCategory {
  id: string
  name: string
  items: RankingItem[]
}

export interface HistoryItem {
  keyword: string
  ts: number
}

export interface FollowResourceSnapshot {
  url: string
  password: string
  datetime: string
  source: string
  note: string
}

export interface FollowItem {
  key: string
  keyword: string
  sourceType: SearchSourceType
  createdAt: number
  updatedAt: number
  lastSnapshot: FollowResourceSnapshot
  linkUnchanged: boolean
}
