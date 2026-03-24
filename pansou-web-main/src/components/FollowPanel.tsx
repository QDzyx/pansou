import dayjs from 'dayjs'
import { BellRing, RefreshCcw, Trash2 } from 'lucide-react'
import type { FollowItem } from '../types/search'

interface FollowPanelProps {
  items: FollowItem[]
  loading: boolean
  refreshingKey: string | null
  onRefresh: (item: FollowItem) => void
  onRemove: (key: string) => void
  onClear: () => void
}

const sourceLabelMap: Record<string, string> = {
  '123': '123云盘',
  quark: '夸克网盘',
  magnet: '磁力链接',
}

const resolveSourceLabel = (sourceType: string) => sourceLabelMap[sourceType] ?? `${sourceType} 资源`

const formatUpdatedAt = (ts: number) => {
  const date = dayjs(ts)
  return date.isValid() ? date.format('MM-DD HH:mm') : '--'
}

export function FollowPanel({ items, loading, refreshingKey, onRefresh, onRemove, onClear }: FollowPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 text-slate-900">
          <BellRing className="h-4 w-4" />
          <h2 className="text-sm font-semibold">追更列表</h2>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </button>
        )}
      </div>

      {items.length === 0 && <p className="text-sm text-slate-500">把剧集加入追更后，可快速复搜并复用历史链接。</p>}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => {
            const refreshing = refreshingKey === item.key
            return (
              <article key={item.key} className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 text-sm font-medium text-slate-900">{item.keyword}</h3>
                  <button
                    type="button"
                    onClick={() => onRemove(item.key)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                    aria-label={`移除 ${item.keyword}`}
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-0.5 text-xs text-slate-600">
                  <p>
                    来源: {resolveSourceLabel(item.sourceType)} · 最近刷新: {formatUpdatedAt(item.updatedAt)}
                  </p>
                  <p className="truncate">历史链接: {item.lastSnapshot.url}</p>
                  <p className={item.linkUnchanged ? 'text-emerald-700' : 'text-amber-700'}>
                    {item.linkUnchanged ? '本次刷新链接未变化' : '本次刷新链接已更新'}
                  </p>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={loading || refreshing}
                    onClick={() => onRefresh(item)}
                    className="inline-flex h-7 items-center gap-1 rounded border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    {refreshing ? '刷新中...' : '刷新'}
                  </button>

                  <a
                    href={item.lastSnapshot.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-7 items-center rounded bg-slate-800 px-2 text-xs font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                  >
                    打开历史链接
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
