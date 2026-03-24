import type { RankingCategory } from '../types/search'

export const mockRankingList: RankingCategory[] = [
  {
    id: 'series',
    name: '电视剧榜',
    items: [
      {
        id: 'series-1',
        title: '繁花',
        rank: 1,
        rating: 8.7,
        url: 'https://movie.douban.com/subject/36132444/',
      },
      {
        id: 'series-2',
        title: '庆余年 第二季',
        rank: 2,
        rating: 7.3,
        url: 'https://movie.douban.com/subject/34937650/',
      },
      {
        id: 'series-3',
        title: '怪奇物语',
        rank: 3,
        rating: 8.6,
        url: 'https://movie.douban.com/subject/26352614/',
      },
    ],
  },
  {
    id: 'movie',
    name: '电影榜',
    items: [
      {
        id: 'movie-1',
        title: '沙丘2',
        rank: 1,
        rating: 8.5,
        url: 'https://movie.douban.com/subject/34445217/',
      },
      {
        id: 'movie-2',
        title: '奥本海默',
        rank: 2,
        rating: 8.8,
        url: 'https://movie.douban.com/subject/35575567/',
      },
    ],
  },
  {
    id: 'anime',
    name: '动漫榜',
    items: [
      {
        id: 'anime-1',
        title: '剑来',
        rank: 1,
        rating: 8.9,
        url: 'https://movie.douban.com/subject/37058608/',
      },
      {
        id: 'anime-2',
        title: '葬送的芙莉莲',
        rank: 2,
        rating: 9.3,
        url: 'https://movie.douban.com/subject/36151692/',
      },
    ],
  },
  {
    id: 'chinese',
    name: '华语榜',
    items: [
      {
        id: 'ch-1',
        title: '漫长的季节',
        rank: 1,
        rating: 9.4,
        url: 'https://movie.douban.com/subject/35588177/',
      },
      {
        id: 'ch-2',
        title: '山海情',
        rank: 2,
        rating: 9.2,
        url: 'https://movie.douban.com/subject/35065914/',
      },
    ],
  },
]
