import type { HealthData, HealthResponse } from '../types/search'
import { getFallbackCloudTypes } from '../utils/queryConfig'

const DEFAULT_BASE_URL = ''
const DEFAULT_TIMEOUT_MS = 8000

export interface HealthConfigResult {
  available: boolean
  message: string
  channels: string[]
  plugins: string[]
  pluginsEnabled: boolean
}

const getBaseUrl = (override?: string) =>
  (override ?? import.meta.env.VITE_PANSOU_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '')

const normalizeCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const withTimeout = async (input: RequestInfo | URL, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

const normalizeHealth = (data?: Partial<HealthData>): HealthData => ({
  channels: Array.isArray(data?.channels) ? data.channels : [],
  channels_count: typeof data?.channels_count === 'number' ? data.channels_count : undefined,
  plugins_enabled: typeof data?.plugins_enabled === 'boolean' ? data.plugins_enabled : false,
  plugins: Array.isArray(data?.plugins) ? data.plugins : [],
  plugin_count: typeof data?.plugin_count === 'number' ? data.plugin_count : undefined,
})

interface FlatHealthPayload {
  status?: string
  channels?: string[]
  channels_count?: number
  plugins_enabled?: boolean
  plugins?: string[]
  plugin_count?: number
}

const parseHealthPayload = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      message: '健康检查返回格式错误',
      data: normalizeHealth(),
    }
  }

  const wrapped = payload as Partial<HealthResponse>
  if (typeof wrapped.code === 'number') {
    if (wrapped.code !== 0) {
      return {
        ok: false,
        message: wrapped.message ?? '健康检查返回非成功状态',
        data: normalizeHealth(),
      }
    }

    return {
      ok: true,
      message: wrapped.message ?? 'success',
      data: normalizeHealth(wrapped.data),
    }
  }

  const flat = payload as FlatHealthPayload
  const statusOk = !flat.status || flat.status === 'ok'

  return {
    ok: statusOk,
    message: statusOk ? 'success' : `健康检查状态异常: ${flat.status ?? 'unknown'}`,
    data: normalizeHealth(flat),
  }
}

export const getCloudTypes = (): string[] => {
  const envValue = import.meta.env.VITE_PANSOU_CLOUD_TYPES ?? import.meta.env.NEXT_PUBLIC_PANSOU_CLOUD_TYPES
  if (!envValue || typeof envValue !== 'string') {
    return getFallbackCloudTypes()
  }

  const parsed = normalizeCsv(envValue)
  return parsed.length > 0 ? parsed : getFallbackCloudTypes()
}

export const getHealthConfig = async (options?: {
  baseURL?: string
  bearerToken?: string
  timeoutMs?: number
}): Promise<HealthConfigResult> => {
  const baseURL = getBaseUrl(options?.baseURL)
  const headers: HeadersInit = {}

  if (options?.bearerToken) {
    headers.Authorization = `Bearer ${options.bearerToken}`
  }

  try {
    const response = await withTimeout(`${baseURL}/api/health`, { method: 'GET', headers }, options?.timeoutMs ?? DEFAULT_TIMEOUT_MS)

    if (!response.ok) {
      return {
        available: false,
        message: `健康检查失败（HTTP ${response.status}）`,
        channels: [],
        plugins: [],
        pluginsEnabled: false,
      }
    }

    const payload = await response.json()
    const parsed = parseHealthPayload(payload)

    if (!parsed.ok) {
      return {
        available: false,
        message: parsed.message,
        channels: [],
        plugins: [],
        pluginsEnabled: false,
      }
    }

    const normalized = parsed.data
    return {
      available: true,
      message: parsed.message,
      channels: normalized.channels,
      plugins: normalized.plugins,
      pluginsEnabled: normalized.plugins_enabled,
    }
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError' ? '健康检查超时，请检查服务状态' : '健康检查请求失败'
    return {
      available: false,
      message,
      channels: [],
      plugins: [],
      pluginsEnabled: false,
    }
  }
}
