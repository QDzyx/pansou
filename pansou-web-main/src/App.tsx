import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { FollowPanel } from './components/FollowPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { RankingPanel } from './components/RankingPanel'
import { ResultGroup } from './components/ResultGroup'
import { SearchBar } from './components/SearchBar'
import { SearchConfigPage } from './components/SearchConfigPage'
import { getCloudTypes, getHealthConfig } from './services/configService'
import { fetchRankingList } from './services/rankingService'
import { normalizeSearchView, searchContent, SearchTimeoutError } from './services/searchService'
import type { FollowItem, QueryConfig, RankingCategory, SearchItem, SearchResponse, SearchSourceType } from './types/search'
import { addFollowItem, clearFollowList, pickSnapshotForSource, readFollowList, refreshFollowSnapshot, removeFollowItem } from './utils/follow'
import { appendHistory, clearHistory, readHistory, removeHistory } from './utils/history'
import { buildSearchParams, DEFAULT_QUERY_CONFIG, readQueryConfig, sanitizeQueryConfig, writeQueryConfig } from './utils/queryConfig'

const RESEARCH_INTERVAL = 2_000
const MAX_SEARCH_ATTEMPTS = 5

const waitFor = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const applyFullSelectionDefaults = (
  config: QueryConfig,
  options: {
    channels: string[]
    plugins: string[]
    cloudTypes: string[]
  },
): QueryConfig => {
  const next = { ...config }

  if (next.selectedChannels.length === 0 && options.channels.length > 0) {
    next.selectedChannels = [...options.channels]
  }

  if (next.selectedPlugins.length === 0 && options.plugins.length > 0) {
    next.selectedPlugins = [...options.plugins]
  }

  if (next.selectedCloudTypes.length === 0 && options.cloudTypes.length > 0) {
    next.selectedCloudTypes = [...options.cloudTypes]
  }

  return next
}

function App() {
  const [view, setView] = useState<'search' | 'config'>('search')
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [queryConfig, setQueryConfig] = useState<QueryConfig>(readQueryConfig())
  const [rankingList, setRankingList] = useState<RankingCategory[]>([])
  const [rankingLoading, setRankingLoading] = useState(false)
  const [rankingError, setRankingError] = useState('')
  const [availableChannels, setAvailableChannels] = useState<string[]>([])
  const [availablePlugins, setAvailablePlugins] = useState<string[]>([])
  const [availableCloudTypes, setAvailableCloudTypes] = useState<string[]>([])
  const [healthAvailable, setHealthAvailable] = useState(false)
  const [healthMessage, setHealthMessage] = useState('等待健康检查')
  const [pluginsEnabled, setPluginsEnabled] = useState(false)
  const [historyList, setHistoryList] = useState(readHistory())
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [followList, setFollowList] = useState(readFollowList())
  const [refreshingFollowKey, setRefreshingFollowKey] = useState<string | null>(null)

  const loadRankingList = useCallback(async () => {
    setRankingLoading(true)
    setRankingError('')

    try {
      const rankings = await fetchRankingList()
      setRankingList(rankings)
    } catch (rankingLoadError) {
      const message = rankingLoadError instanceof Error ? rankingLoadError.message : '榜单加载失败，请稍后重试'
      setRankingList([])
      setRankingError(message)
    } finally {
      setRankingLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const cloudTypes = getCloudTypes()
      void loadRankingList()
      const health = await getHealthConfig()

      setAvailableCloudTypes(cloudTypes)
      setAvailableChannels(health.channels)
      setAvailablePlugins(health.plugins)
      setHealthAvailable(health.available)
      setHealthMessage(health.message)
      setPluginsEnabled(health.pluginsEnabled)

      setQueryConfig((prev) => {
        const sanitized = sanitizeQueryConfig(prev, {
          channels: health.channels,
          plugins: health.plugins,
          cloudTypes,
        })

        return applyFullSelectionDefaults(sanitized, {
          channels: health.channels,
          plugins: health.plugins,
          cloudTypes,
        })
      })
    }

    void init()
  }, [loadRankingList])

  useEffect(() => {
    writeQueryConfig(queryConfig)
  }, [queryConfig])

  const normalizedView = useMemo(() => normalizeSearchView(response?.data), [response])
  const mergedByType = normalizedView.mergedByType
  const total = normalizedView.total
  const hasSearched = searchKeyword.length > 0
  const sourceCount = useMemo(() => Object.values(mergedByType).filter((list) => list.length > 0).length, [mergedByType])
  const rankingItemCount = useMemo(() => rankingList.reduce((sum, category) => sum + category.items.length, 0), [rankingList])
  const pluginHintVisible = !pluginsEnabled || availablePlugins.length === 0

  const updateQueryConfig = (next: QueryConfig) => {
    let adjusted = next
    if (adjusted.selectedCloudTypes.length === 0 && availableCloudTypes.length > 0) {
      adjusted = { ...adjusted, selectedCloudTypes: [...availableCloudTypes] }
    }
    setQueryConfig(adjusted)
  }

  const resetQueryConfig = () => {
    const defaults = sanitizeQueryConfig(
      {
        ...DEFAULT_QUERY_CONFIG,
        selectedChannels: [...availableChannels],
        selectedPlugins: [...availablePlugins],
        selectedCloudTypes: availableCloudTypes.length > 0 ? [...availableCloudTypes] : DEFAULT_QUERY_CONFIG.selectedCloudTypes,
      },
      {
        channels: availableChannels,
        plugins: availablePlugins,
        cloudTypes: availableCloudTypes.length > 0 ? availableCloudTypes : DEFAULT_QUERY_CONFIG.selectedCloudTypes,
      },
    )
    setQueryConfig(
      applyFullSelectionDefaults(defaults, {
        channels: availableChannels,
        plugins: availablePlugins,
        cloudTypes: availableCloudTypes,
      }),
    )
  }

  const doSearch = async (rawKeyword?: string): Promise<SearchResponse | null> => {
    const target = (rawKeyword ?? keyword).trim()
    setKeyword(target)

    if (!target) {
      setSearchKeyword('')
      setError('')
      setResponse(null)
      return null
    }

    setLoading(true)
    setError('')

    try {
      const baseParams = buildSearchParams(target, queryConfig)
      let result: SearchResponse | null = null

      for (let attempt = 1; attempt <= MAX_SEARCH_ATTEMPTS; attempt += 1) {
        try {
          const attemptParams = {
            ...baseParams,
          }
          const current = await searchContent(attemptParams, {
            method: 'GET',
          })

          result = current

          if (attempt < MAX_SEARCH_ATTEMPTS) {
            await waitFor(RESEARCH_INTERVAL)
          }
        } catch (attemptError) {
          if (attemptError instanceof SearchTimeoutError) {
            if (attempt === MAX_SEARCH_ATTEMPTS) {
              setResponse(null)
              setSearchKeyword(target)
              setHistoryList(appendHistory(target))
              return null
            }

            await waitFor(RESEARCH_INTERVAL)
            continue
          }

          throw attemptError
        }
      }

      if (!result) {
        setResponse(null)
        setSearchKeyword(target)
        setHistoryList(appendHistory(target))
        return null
      }

      setResponse(result)
      setSearchKeyword(target)
      setHistoryList(appendHistory(target))
      return result
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : '请求异常，请稍后重试'
      setError(message)
      setResponse(null)
      setSearchKeyword(target)
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleAddFollowFromResult = (item: SearchItem, sourceType: SearchSourceType) => {
    if (!searchKeyword.trim()) {
      return
    }

    setFollowList(addFollowItem({ keyword: searchKeyword, sourceType, item }))
  }

  const handleRefreshFollow = async (followItem: FollowItem) => {
    setRefreshingFollowKey(followItem.key)
    const result = await doSearch(followItem.keyword)
    if (!result) {
      setRefreshingFollowKey(null)
      return
    }

    const mergedByType = result.data.merged_by_type ?? {}
    const sourceItems = mergedByType[followItem.sourceType] ?? []
    const snapshot = pickSnapshotForSource(sourceItems, followItem.sourceType)
    if (snapshot) {
      setFollowList(refreshFollowSnapshot({ followItem, item: snapshot }))
    }

    setRefreshingFollowKey(null)
  }

  return (
    <div className="app-shell min-h-screen pb-6">
      <SearchBar
        value={keyword}
        onChange={setKeyword}
        onSearch={() => {
          setView('search')
          void doSearch()
        }}
        loading={loading}
        view={view}
        onSwitchView={setView}
      />

      <main className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">全网影视资源检索台</h1>
              <p className="mt-1 text-sm text-slate-600">输入片名或从榜单点选，系统按来源聚合结果，支持直接打开或复制链接。</p>
            </div>
            <dl className="grid grid-cols-3 gap-x-6 gap-y-1 text-right">
              <div>
                <dt className="text-xs text-slate-500">榜单条目</dt>
                <dd className="text-base font-semibold text-slate-900">{rankingItemCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">历史搜索</dt>
                <dd className="text-base font-semibold text-slate-900">{historyList.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">追更条目</dt>
                <dd className="text-base font-semibold text-slate-900">{followList.length}</dd>
              </div>
            </dl>
          </div>
        </header>

        {view === 'config' ? (
          <section className="mt-4">
            <SearchConfigPage
              config={queryConfig}
              channels={availableChannels}
              plugins={availablePlugins}
              cloudTypes={availableCloudTypes}
              healthAvailable={healthAvailable}
              healthMessage={healthMessage}
              pluginsEnabled={pluginsEnabled}
              onChange={updateQueryConfig}
              onReset={resetQueryConfig}
            />
          </section>
        ) : (
          <section className="mt-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
              <HistoryPanel
                items={historyList}
                expanded={historyExpanded}
                onToggle={() => setHistoryExpanded((v) => !v)}
                onSearchAgain={(value) => void doSearch(value)}
                onRemove={(value) => setHistoryList(removeHistory(value))}
                onClear={() => {
                  clearHistory()
                  setHistoryList([])
                }}
              />
              <FollowPanel
                items={followList}
                loading={loading}
                refreshingKey={refreshingFollowKey}
                onRefresh={(item) => void handleRefreshFollow(item)}
                onRemove={(key) => setFollowList(removeFollowItem(key))}
                onClear={() => {
                  clearFollowList()
                  setFollowList([])
                }}
              />
              {rankingLoading ? (
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">正在加载影视榜单...</div>
              ) : rankingError ? (
                <ErrorState message={rankingError} onRetry={() => void loadRankingList()} />
              ) : (
                <RankingPanel categories={rankingList} activeKeyword={searchKeyword} onPick={(title) => void doSearch(title)} />
              )}
            </aside>

            <section className="space-y-4" aria-live="polite">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                {!hasSearched ? (
                  <p className="text-sm text-slate-600">请选择左侧榜单条目，或在顶部输入关键词开始检索。</p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-slate-700">
                      当前关键词: <span className="font-semibold text-slate-900">{searchKeyword}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      共 {total} 条，覆盖 {sourceCount} 个来源
                    </p>
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  当前配置: src=all · res=merge · 请求方式=GET · 并发=6 · 强制刷新=开启 · channels {queryConfig.selectedChannels.length} · plugins{' '}
                  {queryConfig.selectedPlugins.length} · cloud_types {queryConfig.selectedCloudTypes.length}
                </p>
                {pluginHintVisible && <p className="mt-1 text-xs text-amber-700">插件未启用或未配置</p>}
              </div>

              {loading && <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">正在检索资源，请稍候...</div>}

              {!loading && error && <ErrorState message={error} onRetry={() => void doSearch(searchKeyword)} />}

              {!loading && hasSearched && !error && total === 0 && <EmptyState keyword={searchKeyword} />}

              {!loading && !error && total > 0 && (
                <ResultGroup mergedByType={mergedByType} preferredSources={queryConfig.selectedCloudTypes} onFollow={handleAddFollowFromResult} />
              )}
            </section>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
