import { Search, LoaderCircle } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  loading: boolean
  view: 'search' | 'config'
  onSwitchView: (view: 'search' | 'config') => void
}

export function SearchBar({ value, onChange, onSearch, loading, view, onSwitchView }: SearchBarProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              id="global-search-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch()
                }
              }}
              className="h-9 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="搜剧名、电影名、演员名，例如：剑来"
            />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onSearch}
            className="inline-flex h-9 min-w-24 items-center justify-center gap-2 rounded-md bg-slate-800 px-4 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            搜索
          </button>

          <div className="ml-auto inline-flex rounded-md border border-slate-300 bg-white p-0.5">
            <button
              type="button"
              onClick={() => onSwitchView('search')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
                view === 'search' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              搜索页
            </button>
            <button
              type="button"
              onClick={() => onSwitchView('config')}
              className={`rounded px-2.5 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
                view === 'config' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              查询配置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
