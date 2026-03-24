import type { SearchResponse, SearchSourceType } from '../types/search'

type SearchItemSeed = {
  url: string
  password: string
  datetime: string
  source: string
  images: string[]
}

interface CatalogEntry {
  title: string
  aliases: string[]
  byType: Partial<Record<SearchSourceType, SearchItemSeed[]>>
}

const MOCK_CATALOG: CatalogEntry[] = [
  {
    title: '剑来',
    aliases: ['剑来', '动漫剑来'],
    byType: {
      '123': [
        {
          url: 'https://www.123684.com/s/jhjVTd-ifV5v',
          password: '',
          datetime: '0001-01-01T00:00:00Z',
          source: 'plugin:huban',
          images: ['https://pic3.yzzyimages.com/upload/vod/2024-08-15/17236856091.jpg'],
        },
      ],
      magnet: [
        {
          url: 'magnet:?xt=urn:btih:904eb5de4c10c46d62c5d5788292ddd3266fa646',
          password: '',
          datetime: '2026-03-11T00:00:00Z',
          source: 'plugin:xb6v',
          images: [],
        },
      ],
      quark: [
        {
          url: 'https://pan.quark.cn/s/015f1fa403f0',
          password: '',
          datetime: '2024-08-15T00:00:00Z',
          source: 'plugin:jutoushe',
          images: [],
        },
      ],
    },
  },
  {
    title: '庆余年 第二季',
    aliases: ['庆余年', '庆余年2'],
    byType: {
      quark: [
        {
          url: 'https://pan.quark.cn/s/10dd33bfa001',
          password: '',
          datetime: '2024-06-01T00:00:00Z',
          source: 'plugin:cloudfan',
          images: ['https://dummyimage.com/320x450/f5f4ef/222&text=%E5%BA%86%E4%BD%99%E5%B9%B4+2'],
        },
      ],
      magnet: [
        {
          url: 'magnet:?xt=urn:btih:84f1a60714f213ef329fd58b1ba57e3f223ac010',
          password: '',
          datetime: '2024-06-03T00:00:00Z',
          source: 'plugin:xb6v',
          images: [],
        },
      ],
    },
  },
  {
    title: '繁花',
    aliases: ['繁花', 'blossoms'],
    byType: {
      '123': [
        {
          url: 'https://www.123684.com/s/hf3ksd-z1c',
          password: '1111',
          datetime: '2024-01-07T00:00:00Z',
          source: 'plugin:huban',
          images: ['https://dummyimage.com/320x450/e7f0ff/1d2f50&text=%E7%B9%81%E8%8A%B1'],
        },
      ],
      quark: [
        {
          url: 'https://pan.quark.cn/s/918cdaf33700',
          password: '',
          datetime: '2024-01-05T00:00:00Z',
          source: 'plugin:jutoushe',
          images: [],
        },
      ],
    },
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const buildResult = (query: string): SearchResponse => {
  const normalized = query.trim().toLowerCase()
  const matched = MOCK_CATALOG.filter((entry) => {
    const inTitle = entry.title.toLowerCase().includes(normalized)
    const inAlias = entry.aliases.some((alias) => alias.toLowerCase().includes(normalized))
    return inTitle || inAlias
  })

  const mergedByType: SearchResponse['data']['merged_by_type'] = {}

  matched.forEach((entry) => {
    ;(['123', 'magnet', 'quark'] as SearchSourceType[]).forEach((type) => {
      const resources = entry.byType[type]
      if (!resources || resources.length === 0) {
        return
      }

      const decorated = resources.map((item) => ({
        ...item,
        note:
          type === 'magnet'
            ? `${entry.title}.全集.2160p.HD国语中字`
            : `【影视】${entry.title}`,
      }))

      const current = mergedByType[type] ?? []
      mergedByType[type] = [...current, ...decorated]
    })
  })

  const total = Object.values(mergedByType).reduce((sum, list) => sum + (list?.length ?? 0), 0)

  return {
    code: 0,
    message: 'success',
    data: {
      total,
      merged_by_type: mergedByType,
    },
  }
}

export const mockSearch = async (query: string): Promise<SearchResponse> => {
  await delay(450)

  if (query.trim().length === 0) {
    return {
      code: 0,
      message: 'success',
      data: {
        total: 0,
        merged_by_type: {},
      },
    }
  }

  return buildResult(query)
}
