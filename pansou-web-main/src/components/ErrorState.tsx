import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-center">
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-rose-500" />
      <h2 className="text-base font-semibold text-rose-700">请求失败</h2>
      <p className="mt-2 text-sm text-rose-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
      >
        重试
      </button>
    </div>
  )
}
