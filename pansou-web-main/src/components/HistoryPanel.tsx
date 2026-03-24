import { Clock3, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { HistoryItem } from '../types/search'

interface HistoryPanelProps {
  items: HistoryItem[]
  expanded: boolean
  onToggle: () => void
  onSearchAgain: (keyword: string) => void
  onRemove: (keyword: string) => void
  onClear: () => void
}

const COLLAPSED_COUNT = 8

export function HistoryPanel({
  items,
  expanded,
  onToggle,
  onSearchAgain,
  onRemove,
  onClear,
}: HistoryPanelProps) {
  const visible = expanded ? items : items.slice(0, COLLAPSED_COUNT)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 text-slate-900">
          <Clock3 className="h-4 w-4" />
          <h2 className="text-sm font-semibold">历史搜索</h2>
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

      {items.length === 0 && <p className="text-sm text-slate-500">还没有历史搜索，试试从榜单里挑一部吧。</p>}

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {visible.map((item) => (
              <div key={item.ts} className="group inline-flex max-w-full items-center rounded-md border border-slate-200 bg-slate-50 pl-2.5 pr-1 text-sm text-slate-700">
                <button
                  type="button"
                  className="max-w-[180px] truncate py-1.5 text-left hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                  onClick={() => onSearchAgain(item.keyword)}
                >
                  {item.keyword}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.keyword)}
                  className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition group-hover:text-slate-600 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {items.length > COLLAPSED_COUNT && (
            <button
              type="button"
              onClick={onToggle}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            >
              {expanded ? (
                <>
                  收起 <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  展开全部 {items.length} 条 <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </>
      )}
    </section>
  )
}
