import type { MergedByType, MergedLink, SearchData, SearchParams, SearchResponse } from '../types/search'

const DEFAULT_BASE_URL = ''
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000

export class SearchTimeoutError extends Error {
  constructor(message = '搜索请求超时，请稍后重试') {
    super(message)
    this.name = 'SearchTimeoutError'
  }
}

interface SearchRequestOptions {
  baseURL?: string
  bearerToken?: string
  timeoutMs?: number
  method?: 'GET' | 'POST'
}

const getBaseUrl = (override?: string) =>
  (override ?? import.meta.env.VITE_PANSOU_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '')

const joinList = (value?: string[] | string): string | undefined => {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    return value.trim() || undefined
  }

  const joined = value.map((item) => item.trim()).filter(Boolean).join(',')
  return joined || undefined
}

const sanitizeParams = (input: SearchParams): SearchParams => {
  const next: SearchParams = {
    kw: input.kw.trim(),
    src: input.src ?? 'all',
    res: input.res ?? 'merge',
    cloud_types: input.cloud_types,
    ext: input.ext,
    filter: input.filter,
  }

  if (next.src !== 'plugin') {
    next.channels = input.channels
  }

  if (next.src !== 'tg') {
    next.plugins = input.plugins
  }

  return next
}

const withTimeout = async (input: RequestInfo | URL, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

const normalizeData = (data?: Partial<SearchData>): SearchData => ({
  total: typeof data?.total === 'number' ? data.total : 0,
  results: Array.isArray(data?.results) ? data.results : [],
  merged_by_type: data?.merged_by_type ?? {},
})

const buildGetUrl = (baseUrl: string, params: SearchParams) => {
  const query = new URLSearchParams()
  query.set('kw', params.kw)

  const channels = joinList(params.channels)
  if (channels) {
    query.set('channels', channels)
  }

  const plugins = joinList(params.plugins)
  if (plugins) {
    query.set('plugins', plugins)
  }

  const cloudTypes = joinList(params.cloud_types)
  if (cloudTypes) {
    query.set('cloud_types', cloudTypes)
  }

  if (params.src) {
    query.set('src', params.src)
  }

  if (typeof params.refresh === 'boolean') {
    query.set('refresh', String(params.refresh))
  }

  if (params.res) {
    query.set('res', params.res)
  }

  if (typeof params.conc === 'number' && Number.isFinite(params.conc)) {
    query.set('conc', String(params.conc))
  }

  if (params.ext) {
    query.set('ext', JSON.stringify(params.ext))
  }

  if (params.filter) {
    query.set('filter', JSON.stringify(params.filter))
  }

  return `${baseUrl}/api/search?${query.toString()}`
}

const normalizeMergedByTypeFromResults = (results: MergedLink[]): MergedByType => {
  const merged: MergedByType = {}

  results.forEach((item) => {
    const source = item.source?.trim() || 'others'
    if (!merged[source]) {
      merged[source] = []
    }
    merged[source].push(item)
  })

  return merged
}

export const normalizeSearchView = (data?: SearchData) => {
  const normalizedData = normalizeData(data)
  const merged = normalizedData.merged_by_type ?? {}
  const hasMerged = Object.values(merged).some((items) => items.length > 0)

  if (hasMerged) {
    return {
      total: normalizedData.total,
      mergedByType: merged,
    }
  }

  return {
    total: normalizedData.total,
    mergedByType: normalizeMergedByTypeFromResults(normalizedData.results ?? []),
  }
}

export const searchContent = async (params: SearchParams, options?: SearchRequestOptions): Promise<SearchResponse> => {
  const sanitized = sanitizeParams(params)
  if (!sanitized.kw) {
    throw new Error('kw 不能为空')
  }

  const baseURL = getBaseUrl(options?.baseURL)
  const method = options?.method ?? 'GET'
  const headers: HeadersInit = {}

  if (options?.bearerToken) {
    headers.Authorization = `Bearer ${options.bearerToken}`
  }

  let response: Response
  try {
    if (method === 'GET') {
      response = await withTimeout(
        buildGetUrl(baseURL, sanitized),
        {
          method: 'GET',
          headers,
        },
        options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      )
    } else {
      response = await withTimeout(
        `${baseURL}/api/search`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sanitized),
        },
        options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      )
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new SearchTimeoutError()
    }
    throw new Error('搜索请求失败，请检查网络或服务地址')
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(`鉴权失败（HTTP ${response.status}）`) 
    }
    throw new Error(`搜索请求失败（HTTP ${response.status}）`)
  }

  const payload = (await response.json()) as Partial<SearchResponse>
  if (payload.code !== 0) {
    throw new Error(payload.message ?? '后端返回错误')
  }

  return {
    code: 0,
    message: payload.message ?? 'success',
    data: normalizeData(payload.data),
  }
}
