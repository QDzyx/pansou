import { useEffect, useMemo, useState } from 'react'
import type { MergedByType, SearchItem, SearchSourceType } from '../types/search'
import { ResultCard } from './ResultCard'

interface ResultGroupProps {
  mergedByType: MergedByType
  onFollow: (item: SearchItem, sourceType: SearchSourceType) => void
  preferredSources?: string[]
}

const knownOrder = ['123', 'quark', 'magnet']

const sourceTitleMap: Record<string, string> = {
  '123': '123 云盘资源',
  quark: '夸克网盘资源',
  magnet: '磁力资源',
}

const PAGE_SIZE = 20

const buildOrderedSources = (sources: string[], preferredSources: string[]) => {
  const preferredIndex = new Map(preferredSources.map((item, index) => [item, index]))

  return [...sources].sort((a, b) => {
    const aIndex = preferredIndex.get(a)
    const bIndex = preferredIndex.get(b)
    if (typeof aIndex === 'number' && typeof bIndex === 'number') {
      return aIndex - bIndex
    }
    if (typeof aIndex === 'number') {
      return -1
    }
    if (typeof bIndex === 'number') {
      return 1
    }
    const knownA = knownOrder.indexOf(a)
    const knownB = knownOrder.indexOf(b)
    if (knownA >= 0 && knownB >= 0) {
      return knownA - knownB
    }
    if (knownA >= 0) {
      return -1
    }
    if (knownB >= 0) {
      return 1
    }
    return a.localeCompare(b)
  })
}

const resolveSourceTitle = (source: string) => sourceTitleMap[source] ?? `${source} 资源`

export function ResultGroup({ mergedByType, onFollow, preferredSources = [] }: ResultGroupProps) {
  const [activeSource, setActiveSource] = useState<SearchSourceType | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const availableSources = useMemo(() => {
    const nonEmptySources = Object.entries(mergedByType)
      .filter(([, list]) => list.length > 0)
      .map(([source]) => source)

    return buildOrderedSources(nonEmptySources, preferredSources)
  }, [mergedByType, preferredSources])

  useEffect(() => {
    if (availableSources.length === 0) {
      setActiveSource(null)
      return
    }
    const found = activeSource && availableSources.includes(activeSource)
    if (!found) {
      setActiveSource(availableSources[0])
    }
    setVisibleCount(PAGE_SIZE)
  }, [activeSource, availableSources])

  const activeList = activeSource ? mergedByType[activeSource] ?? [] : []

  const visibleList = activeList.slice(0, visibleCount)
  const hasMore = activeList.length > visibleCount

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
          {availableSources.map((source) => {
            const count = (mergedByType[source] ?? []).length
            const selected = source === activeSource
            return (
              <button
                key={source}
                type="button"
                onClick={() => {
                  setActiveSource(source)
                  setVisibleCount(PAGE_SIZE)
                }}
                className={`rounded px-2 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
                  selected
                    ? 'bg-slate-700 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {resolveSourceTitle(source)} ({count})
              </button>
            )
          })}
        </div>

        {activeSource && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">{resolveSourceTitle(activeSource)}</h2>
              <span className="text-xs text-slate-500">
                已显示 {visibleList.length} / {activeList.length}
              </span>
            </div>

            <div className="mb-1 hidden rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 md:grid md:grid-cols-[minmax(0,2fr)_0.9fr_0.8fr_0.7fr_240px] md:gap-3">
              <span>资源信息</span>
              <span>来源插件</span>
              <span>时间</span>
              <span>提取码</span>
              <span className="text-right">操作</span>
            </div>

            <div className="divide-y divide-slate-200">
              {visibleList.map((item) => (
                <ResultCard key={`${activeSource}-${item.url}`} item={item} sourceType={activeSource} onFollow={onFollow} />
              ))}
            </div>

            {hasMore && (
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="rounded border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                >
                  加载更多
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
