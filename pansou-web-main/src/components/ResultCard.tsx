import dayjs from 'dayjs'
import { Copy, Link2 } from 'lucide-react'
import type { SearchItem, SearchSourceType } from '../types/search'

interface ResultCardProps {
  item: SearchItem
  sourceType: SearchSourceType
  onFollow: (item: SearchItem, sourceType: SearchSourceType) => void
}

const sourceColorMap: Record<string, string> = {
  '123': 'bg-sky-100 text-sky-700',
  magnet: 'bg-rose-100 text-rose-700',
  quark: 'bg-emerald-100 text-emerald-700',
}

const sourceLabelMap: Record<string, string> = {
  '123': '123云盘',
  magnet: '磁力链接',
  quark: '夸克网盘',
}

const resolveSourceLabel = (sourceType: string) => sourceLabelMap[sourceType] ?? `${sourceType} 资源`

const resolveSourceColor = (sourceType: string) => sourceColorMap[sourceType] ?? 'bg-slate-100 text-slate-700'

const formatDate = (value: string) => {
  if (value.startsWith('0001-01-01')) {
    return '时间未知'
  }
  const date = dayjs(value)
  return date.isValid() ? date.format('YYYY-MM-DD') : '时间未知'
}

export function ResultCard({ item, sourceType, onFollow }: ResultCardProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.url)
    } catch {
      window.alert('复制失败，请手动复制链接')
    }
  }

  return (
    <article className="grid gap-2 py-3 md:grid-cols-[minmax(0,2fr)_0.9fr_0.8fr_0.7fr_240px] md:items-center md:gap-3">
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${resolveSourceColor(sourceType)}`}>{resolveSourceLabel(sourceType)}</span>
          <h3 className="line-clamp-1 text-sm font-medium text-slate-900">{item.note}</h3>
        </div>
        <p className="truncate text-xs text-slate-500">链接: {item.url}</p>
      </div>

      <p className="truncate text-xs text-slate-600">{item.source}</p>
      <p className="text-xs text-slate-600">{formatDate(item.datetime)}</p>
      <p className="text-xs text-slate-600">{item.password || '无'}</p>

      <div className="flex flex-wrap gap-2 md:justify-end">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center justify-center gap-1 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          <Link2 className="h-3.5 w-3.5" />
          打开
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-8 items-center justify-center gap-1 rounded bg-slate-800 px-2.5 text-xs font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
        >
          <Copy className="h-3.5 w-3.5" />
          复制
        </button>
        <button
          type="button"
          onClick={() => onFollow(item, sourceType)}
          className="inline-flex h-8 items-center justify-center rounded border border-amber-300 bg-amber-50 px-2.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          加入追更
        </button>
      </div>
    </article>
  )
}
