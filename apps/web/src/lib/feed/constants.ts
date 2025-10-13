export const FEED_PAGE_SIZE = 20;

export const FEED_SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'popular', label: 'Mais votados' },
  { value: 'top-week', label: 'Top da semana' },
  { value: 'top-month', label: 'Top do mês' }
] as const;

export const FEED_PERIODS = [
  { value: 'week', label: 'Últimos 7 dias' },
  { value: 'month', label: 'Últimos 30 dias' },
  { value: 'all', label: 'Todo período' }
] as const;

export type FeedSort = (typeof FEED_SORT_OPTIONS)[number]['value'];
export type FeedPeriod = (typeof FEED_PERIODS)[number]['value'];

export const DEFAULT_FEED_SORT: FeedSort = 'recent';
export const DEFAULT_FEED_PERIOD: FeedPeriod = 'week';
