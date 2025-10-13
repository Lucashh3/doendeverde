-- Migração: Expandir categorias de posts
-- Data: 2025-01-13
-- Descrição: Adiciona 4 novas categorias para melhor organização do conteúdo

-- Adicionar novas categorias
INSERT INTO public.categories (slug, label, description, icon)
VALUES
  ('saude-bem-estar', 'Saúde & Bem-estar', 'Benefícios medicinais, cuidados pessoais e bem-estar relacionado ao uso responsável.', '🩺'),
  ('politica-legislacao', 'Política & Legislação', 'Atualizações sobre leis, advocacy, direitos e discussões políticas sobre cannabis.', '⚖️'),
  ('pesquisa-ciencia', 'Pesquisa & Ciência', 'Estudos científicos, descobertas médicas e avanços na pesquisa canábica.', '🔬'),
  ('sustentabilidade', 'Sustentabilidade', 'Cultivo orgânico, impacto ambiental, práticas ecológicas e consumo consciente.', '🌍')
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- Comentário: As 4 categorias existentes são mantidas:
-- - experiencias (Experiências)
-- - cultivo (Cultivo)
-- - educacao (Educação)
-- - cultura-e-memes (Cultura & Memes)