import type { QueryConfig, SearchFilter, SearchParams } from '../types/search'

const QUERY_CONFIG_KEY = 'pansou_query_config_v1'

const FALLBACK_CLOUD_TYPES = [
  'baidu',
  'aliyun',
  'quark',
  'tianyi',
  'uc',
  'mobile',
  '115',
  'pikpak',
  'xunlei',
  '123',
  'magnet',
  'ed2k',
  'others',
]

export const DEFAULT_QUERY_CONFIG: QueryConfig = {
  selectedChannels: [],
  selectedPlugins: [],
  selectedCloudTypes: [...FALLBACK_CLOUD_TYPES],
  extJson: '',
  includeText: '',
  excludeText: '',
}

const canUseStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const normalizeCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const unique = (items: string[]) => Array.from(new Set(items))

export const readQueryConfig = (): QueryConfig => {
  if (!canUseStorage()) {
    return { ...DEFAULT_QUERY_CONFIG }
  }

  const raw = localStorage.getItem(QUERY_CONFIG_KEY)
  if (!raw) {
    return { ...DEFAULT_QUERY_CONFIG }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<QueryConfig>
    return {
      ...DEFAULT_QUERY_CONFIG,
      ...parsed,
      selectedChannels: unique(parsed.selectedChannels ?? DEFAULT_QUERY_CONFIG.selectedChannels),
      selectedPlugins: unique(parsed.selectedPlugins ?? DEFAULT_QUERY_CONFIG.selectedPlugins),
      selectedCloudTypes: unique(parsed.selectedCloudTypes ?? DEFAULT_QUERY_CONFIG.selectedCloudTypes),
    }
  } catch {
    return { ...DEFAULT_QUERY_CONFIG }
  }
}

export const writeQueryConfig = (config: QueryConfig) => {
  if (!canUseStorage()) {
    return
  }

  localStorage.setItem(QUERY_CONFIG_KEY, JSON.stringify(config))
}

export const sanitizeQueryConfig = (
  config: QueryConfig,
  options: {
    channels: string[]
    plugins: string[]
    cloudTypes: string[]
  },
): QueryConfig => {
  const channelSet = new Set(options.channels)
  const pluginSet = new Set(options.plugins)
  const cloudTypeSet = new Set(options.cloudTypes)

  const nextCloudTypes = config.selectedCloudTypes.filter((item) => cloudTypeSet.has(item))

  return {
    ...config,
    selectedChannels: config.selectedChannels.filter((item) => channelSet.has(item)),
    selectedPlugins: config.selectedPlugins.filter((item) => pluginSet.has(item)),
    selectedCloudTypes: nextCloudTypes.length > 0 ? nextCloudTypes : [...options.cloudTypes],
  }
}

const parseExt = (value: string): Record<string, unknown> | undefined => {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>
    return parsed
  } catch {
    return undefined
  }
}

const parseFilter = (includeText: string, excludeText: string): SearchFilter | undefined => {
  const include = normalizeCsv(includeText)
  const exclude = normalizeCsv(excludeText)
  if (include.length === 0 && exclude.length === 0) {
    return undefined
  }

  return { include, exclude }
}

export const buildSearchParams = (keyword: string, config: QueryConfig): SearchParams => {
  const kw = keyword.trim()
  const params: SearchParams = {
    kw,
    src: 'all',
    res: 'merge',
    // refresh: false,
    cloud_types: config.selectedCloudTypes,
    channels: config.selectedChannels,
    plugins: config.selectedPlugins,
  }

  const ext = parseExt(config.extJson)
  if (ext) {
    params.ext = ext
  }

  const filter = parseFilter(config.includeText, config.excludeText)
  if (filter) {
    params.filter = filter
  }

  return params
}

export const getFallbackCloudTypes = () => [...FALLBACK_CLOUD_TYPES]
