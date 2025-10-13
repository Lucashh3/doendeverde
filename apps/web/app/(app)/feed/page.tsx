import { Suspense } from 'react';

import { FeedFilters } from '@/components/feed/feed-filters';
import { FeedList } from '@/components/feed/feed-list';
import { fetchCategories, fetchFeedPosts } from '@/lib/feed/fetch-feed';

export const revalidate = 30;

export default async function FeedPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const categoryParam = Array.isArray(searchParams.categoria)
    ? searchParams.categoria[0]
    : searchParams.categoria;
  const tagParam = Array.isArray(searchParams.tag) ? searchParams.tag[0] : searchParams.tag;
  const sortParam = Array.isArray(searchParams.ordenar) ? searchParams.ordenar[0] : searchParams.ordenar;
  const periodParam = Array.isArray(searchParams.periodo)
    ? searchParams.periodo[0]
    : searchParams.periodo;

  const page = pageParam ? Number(pageParam) : 1;

  const [categories, { posts, hasMore }] = await Promise.all([
    fetchCategories(),
    fetchFeedPosts({
      categorySlug: categoryParam ?? undefined,
      tagSlug: tagParam ?? undefined,
      sort: (sortParam as any) ?? undefined,
      period: (periodParam as any) ?? undefined,
      page
    })
  ]);

  const baseParams = new URLSearchParams();
  if (categoryParam) baseParams.set('categoria', categoryParam);
  if (tagParam) baseParams.set('tag', tagParam);
  if (sortParam) baseParams.set('ordenar', sortParam);
  if (periodParam) baseParams.set('periodo', periodParam);

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <Suspense fallback={<div>Carregando filtros...</div>}>
        <FeedFilters categories={categories} />
      </Suspense>
      <Suspense fallback={<div>Carregando feed...</div>}>
        <FeedList posts={posts} />
      </Suspense>
      <FeedPagination currentPage={page} hasMore={hasMore} baseParams={baseParams} />
    </div>
  );
}

type FeedPaginationProps = {
  currentPage: number;
  hasMore: boolean;
  baseParams: URLSearchParams;
};

function FeedPagination({ currentPage, hasMore, baseParams }: FeedPaginationProps) {
  const nextPage = currentPage + 1;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;

  const urlForPage = (page: number) => {
    const params = new URLSearchParams(baseParams);
    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }

    const queryString = params.toString();
    return queryString.length > 0 ? `?${queryString}` : '?';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#9AA0A6'
      }}
    >
      <span>Página {currentPage}</span>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {prevPage ? (
          <a href={urlForPage(prevPage)} style={{ color: '#F2E9E4', textDecoration: 'none' }}>
            ← Página anterior
          </a>
        ) : (
          <span style={{ opacity: 0.4 }}>← Página anterior</span>
        )}
        {hasMore ? (
          <a href={urlForPage(nextPage)} style={{ color: '#F2E9E4', textDecoration: 'none' }}>
            Próxima página →
          </a>
        ) : (
          <span style={{ opacity: 0.4 }}>Próxima página →</span>
        )}
      </div>
    </div>
  );
}
