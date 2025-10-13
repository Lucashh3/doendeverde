# 📂 Sistema de Categorias - Guia Completo

## 🎯 Visão Geral

O sistema de categorias organiza o conteúdo da comunidade Doende Verde em temas específicos, facilitando a navegação e descoberta de conteúdo relevante.

## 📊 Categorias Disponíveis

### 🏠 Categorias Originais (4)
- **🌬️ Experiências** - Relatos de brisas, viagens e aprendizados
- **🌱 Cultivo** - Técnicas, setups e genética de cultivo
- **📚 Educação** - Informação segura e redução de danos
- **🎭 Cultura & Memes** - Arte e cultura canábica brasileira

### ✨ Novas Categorias Adicionadas (4)
- **🩺 Saúde & Bem-estar** - Benefícios medicinais e cuidados pessoais
- **⚖️ Política & Legislação** - Leis, advocacy e direitos
- **🔬 Pesquisa & Ciência** - Estudos científicos e descobertas
- **🌍 Sustentabilidade** - Cultivo orgânico e práticas ecológicas

## 🗂️ Estrutura Técnica

### Banco de Dados
```sql
categories (
  id: SERIAL PRIMARY KEY,
  slug: VARCHAR UNIQUE,
  label: VARCHAR,
  description: TEXT,
  icon: VARCHAR,
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### Relacionamentos
- `posts.category_id` → `categories.id`
- Cada post pertence a uma categoria
- Sistema de tags complementa as categorias

## 🎨 Características Visuais

### Cores Temáticas
- **Experiências:** Roxo (#8b5cf6)
- **Cultivo:** Verde (#22c55e)
- **Educação:** Azul (#3b82f6)
- **Cultura & Memes:** Âmbar (#f59e0b)
- **Saúde & Bem-estar:** Rosa (#ec4899)
- **Política & Legislação:** Vermelho (#ef4444)
- **Pesquisa & Ciência:** Ciano (#06b6d4)
- **Sustentabilidade:** Esmeralda (#10b981)

### Layout Responsivo
- **Desktop:** Grid com 3 colunas
- **Tablet:** Grid com 2 colunas
- **Mobile:** Lista vertical

## 🚀 Funcionalidades

### Página de Categorias (`/categorias`)
- Visualização de todas as categorias
- Estatísticas gerais da comunidade
- Cards interativos com informações
- Ordenação por popularidade e atividade

### Filtros no Feed (`/feed`)
- Seleção rápida de categoria
- Indicadores visuais de atividade
- Filtros combináveis com tags e período

### Criação de Posts (`/posts/criar`)
- Seleção obrigatória de categoria
- Dropdown com ícones e descrições

## 📈 Métricas e Analytics

### Estatísticas por Categoria
- Número de posts publicados
- Taxa de engajamento (curtidas, comentários)
- Categorias em tendência

### Indicadores de Popularidade
- 🔥 Badge para categorias populares
- Destaque visual diferenciado
- Ordenação automática

## 🛠️ Administração

### Gerenciamento de Categorias
- CRUD completo via interface admin
- Upload de ícones personalizados
- Definição de cores temáticas
- Controle de ativação/desativação

### Moderação
- Moderação de conteúdo por categoria
- Flags específicos por tema
- Políticas diferenciadas

## 🔄 Sistema de Tags Complementar

### Tags Relacionadas por Categoria
- **Cultivo:** indoor, outdoor, sementes, clonagem, poda, floração
- **Saúde:** dor-crônica, ansiedade, epilepsia, terpenos, canabinoides
- **Política:** legalização, ativismo, reforma-da-lei
- **Pesquisa:** estudos-clínicos, medicina, redução-de-danos

## 📱 Experiência Mobile

### Otimizações
- Touch targets adequados (mínimo 44px)
- Layout otimizado para thumb navigation
- Carregamento lazy de imagens
- Animações suaves de transição

### Filtros Mobile
- Filtros colapsáveis
- Seleção rápida via chips
- Busca integrada de categorias

## 🎯 Boas Práticas

### Para Usuários
1. Escolha a categoria mais específica para seu post
2. Use tags complementares para melhor descoberta
3. Explore diferentes categorias para descobrir conteúdo
4. Participe ativamente nas categorias de interesse

### Para Moderadores
1. Mantenha categorias organizadas e relevantes
2. Monitore qualidade do conteúdo por categoria
3. Incentive participação equilibrada entre categorias
4. Atualize descrições conforme evolução da comunidade

## 🚀 Próximas Funcionalidades

### Planejadas
- [ ] Subcategorias hierárquicas
- [ ] Sistema de recomendações por categoria
- [ ] Categorização automática com IA
- [ ] Métricas avançadas de engajamento
- [ ] Personalização de categorias favoritas

### Melhorias Técnicas
- [ ] Cache inteligente de categorias populares
- [ ] Indexação otimizada para buscas
- [ ] API de categorias para integrações
- [ ] Webhooks para eventos de categoria

## 📞 Suporte

Para dúvidas sobre categorização ou sugestões de novas categorias, entre em contato com a equipe de moderação através dos canais oficiais da comunidade.