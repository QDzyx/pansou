import { Film } from 'lucide-react'

interface EmptyStateProps {
  keyword: string
}

export function EmptyState({ keyword }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <Film className="mx-auto mb-3 h-8 w-8 text-slate-400" />
      <h2 className="text-base font-semibold text-slate-900">没有找到相关资源</h2>
      <p className="mt-2 text-sm text-slate-500">关键词“{keyword}”暂无结果。建议更换关键词，或在左侧榜单中重新选择。</p>
    </div>
  )
}
