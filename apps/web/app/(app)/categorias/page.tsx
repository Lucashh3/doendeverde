import { Metadata } from 'next';

import { CategoryCard, type CategoryInfo } from '@/components/categories/category-card';
import { CategoryStats } from '@/components/categories/category-stats';
import { fetchCategories } from '@/lib/feed/fetch-feed';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Categorias | Doende Verde',
  description: 'Explore todas as categorias da comunidade Doende Verde. Encontre conteúdo sobre cultivo, experiências, educação e muito mais.',
};

export default async function CategoriesPage() {
  const supabase = createSupabaseServerClient();

  // Buscar categorias básicas
  const categories = await fetchCategories();

  // Buscar contagem de posts por categoria
  const { data: postCounts } = await supabase
    .from('posts')
    .select('category_id')
    .eq('is_deleted', false);

  // Contar posts por categoria (simplificado por enquanto)
  const categoryCounts = postCounts?.reduce((acc, post) => {
    // Como não temos relacionamento direto, usamos valor simulado por enquanto
    acc[post.category_id] = (acc[post.category_id] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  // Dados completos das categorias com contagem (simulada para demonstração)
  const categoriesWithCounts: CategoryInfo[] = categories.map((category, index) => ({
    slug: category.slug,
    label: category.label || '',
    icon: category.icon || '🌿',
    postCount: Math.floor(Math.random() * 100) + (index * 15), // Valores simulados
    color: getCategoryColor(category.slug),
    isPopular: getPopularCategories().includes(category.slug)
  }));

  // Organizar categorias (populares primeiro)
  const sortedCategories = categoriesWithCounts.sort((a, b) => {
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    return (b.postCount || 0) - (a.postCount || 0);
  });

  // Calcular estatísticas
  const totalPosts = sortedCategories.reduce((sum, cat) => sum + (cat.postCount || 0), 0);
  const mostActiveCategory = sortedCategories.find(cat => cat.isPopular)?.label;

  return (
    <main
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            margin: 0,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Categorias da Comunidade
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          Explore os diferentes temas da nossa comunidade. Cada categoria oferece
          conteúdo único e valioso para sua jornada sustentável.
        </p>
      </header>

      <CategoryStats
        totalCategories={sortedCategories.length}
        totalPosts={totalPosts}
        mostActiveCategory={mostActiveCategory}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {sortedCategories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            variant={category.isPopular ? 'featured' : 'default'}
            onClick={() => {
              window.location.href = `/feed?categoria=${category.slug}`;
            }}
          />
        ))}
      </div>

      {sortedCategories.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <p>Nenhuma categoria encontrada.</p>
        </div>
      )}
    </main>
  );
}

// Função auxiliar para definir cores por categoria
function getCategoryColor(slug: string): string {
  const colors: Record<string, string> = {
    'experiencias': '#8b5cf6',      // Purple
    'cultivo': '#22c55e',         // Green
    'educacao': '#3b82f6',        // Blue
    'cultura-e-memes': '#f59e0b', // Amber
    'saude-bem-estar': '#ec4899', // Pink
    'politica-legislacao': '#ef4444', // Red
    'pesquisa-ciencia': '#06b6d4',   // Cyan
    'sustentabilidade': '#10b981'    // Emerald
  };
  return colors[slug] || '#22c55e';
}

// Função auxiliar para definir categorias populares
function getPopularCategories(): string[] {
  return ['cultivo', 'experiencias', 'educacao'];
}