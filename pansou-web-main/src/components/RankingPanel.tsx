import { useEffect, useMemo, useState } from 'react'
import type { RankingCategory } from '../types/search'

interface RankingPanelProps {
  categories: RankingCategory[]
  activeKeyword: string
  onPick: (title: string) => void
}

export function RankingPanel({ categories, activeKeyword, onPick }: RankingPanelProps) {
  const [activeCategoryId, setActiveCategoryId] = useState('')

  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id)
    }
  }, [activeCategoryId, categories])

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
    [activeCategoryId, categories],
  )

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-end justify-between border-b border-slate-200 pb-2">
        <h2 className="text-sm font-semibold text-slate-900">影视榜单</h2>
        <span className="text-xs text-slate-500">按分类查看</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategoryId(category.id)}
            className={`rounded px-2 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
              activeCategory?.id === category.id
                ? 'bg-slate-700 text-white'
                : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {(activeCategory?.items ?? []).map((item) => {
          const active = activeKeyword === item.title
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item.title)}
              className={`group flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
                active
                  ? 'border-slate-700 bg-slate-700 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {item.rank}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
              </div>
              <div className={`text-xs font-bold ${active ? 'text-amber-200' : 'text-amber-500'}`}>{item.rating.toFixed(1)}</div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
