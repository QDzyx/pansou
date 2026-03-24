import type { QueryConfig } from '../types/search'

interface SearchConfigPageProps {
  config: QueryConfig
  channels: string[]
  plugins: string[]
  cloudTypes: string[]
  healthAvailable: boolean
  healthMessage: string
  pluginsEnabled: boolean
  onChange: (next: QueryConfig) => void
  onReset: () => void
}

const sectionClass = 'rounded-lg border border-slate-200 bg-white p-4'

const labelFromKey = (value: string) => {
  if (value === '123') {
    return '123'
  }
  return value
}

const toggleList = (items: string[], value: string) => {
  if (items.includes(value)) {
    return items.filter((item) => item !== value)
  }
  return [...items, value]
}

export function SearchConfigPage({
  config,
  channels,
  plugins,
  cloudTypes,
  healthAvailable,
  healthMessage,
  pluginsEnabled,
  onChange,
  onReset,
}: SearchConfigPageProps) {
  const pluginDisabled = !pluginsEnabled || plugins.length === 0
  const pluginsSelectionDisabled = pluginDisabled

  return (
    <section className="space-y-4" aria-live="polite">
      <div className={sectionClass}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <h2 className="text-sm font-semibold text-slate-900">查询配置</h2>
          <button
            type="button"
            onClick={onReset}
            className="rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            恢复默认
          </button>
        </div>

        <p className={`text-xs ${healthAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
          Health 状态: {healthMessage}
        </p>
        {pluginDisabled && <p className="mt-1 text-xs text-amber-700">插件未启用或未配置</p>}
      </div>

      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-slate-900">TG Channels（来自 Health）</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {channels.length === 0 && <p className="text-sm text-slate-500">暂无 channels 可选</p>}
          {channels.map((channel) => (
            <label key={channel} className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={config.selectedChannels.includes(channel)}
                onChange={() => onChange({ ...config, selectedChannels: toggleList(config.selectedChannels, channel) })}
                className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
              />
              <span>{channel}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-slate-900">Plugins（来自 Health）</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {plugins.length === 0 && <p className="text-sm text-slate-500">暂无 plugins 可选</p>}
          {plugins.map((plugin) => (
            <label key={plugin} className={`inline-flex items-center gap-2 text-sm ${pluginsSelectionDisabled ? 'text-slate-400' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                checked={config.selectedPlugins.includes(plugin)}
                disabled={pluginsSelectionDisabled}
                onChange={() => onChange({ ...config, selectedPlugins: toggleList(config.selectedPlugins, plugin) })}
                className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
              />
              <span>{plugin}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-slate-900">Cloud Types</h3>
        <p className="mt-1 text-xs text-slate-500">用于 cloud_types 过滤，来源为环境变量覆盖或固定枚举兜底。</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {cloudTypes.map((cloudType) => (
            <label key={cloudType} className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={config.selectedCloudTypes.includes(cloudType)}
                onChange={() => onChange({ ...config, selectedCloudTypes: toggleList(config.selectedCloudTypes, cloudType) })}
                className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
              />
              <span>{labelFromKey(cloudType)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-slate-900">高级参数</h3>
        <div className="mt-3 grid gap-3">
          <label className="space-y-1 text-sm text-slate-700">
            <span>ext（JSON）</span>
            <textarea
              value={config.extJson}
              onChange={(e) => onChange({ ...config, extJson: e.target.value })}
              rows={4}
              placeholder={'例如: {"region":"cn"}'}
              className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span>filter.include（逗号分隔）</span>
            <input
              value={config.includeText}
              onChange={(e) => onChange({ ...config, includeText: e.target.value })}
              className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-700">
            <span>filter.exclude（逗号分隔）</span>
            <input
              value={config.excludeText}
              onChange={(e) => onChange({ ...config, excludeText: e.target.value })}
              className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            />
          </label>
        </div>
      </div>
    </section>
  )
}
