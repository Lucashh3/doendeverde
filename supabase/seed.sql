-- Seed data for Doende Verde MVP

insert into public.categories (slug, label, description, icon)
values
  ('experiencias', 'Experiências', 'Relatos de brisas, viagens e aprendizados da comunidade.', '🌬️'),
  ('cultivo', 'Cultivo', 'Dicas, setups e genética para quem ama cuidar da planta.', '🌱'),
  ('educacao', 'Educação', 'Informação segura sobre usos, legislação e redução de danos.', '📚'),
  ('cultura-e-memes', 'Cultura & Memes', 'Memes, arte, música e cultura canábica brasileira.', '🎭')
on conflict (slug) do update
set label = excluded.label,
    description = excluded.description,
    icon = excluded.icon;

insert into public.badges (code, name, description, icon)
values
  ('primeira-colheita', 'Primeira Colheita', 'Postou seu primeiro relato de cultivo.', '🌾'),
  ('brisado-lendario', 'Brisado Lendário', '100 posts que fizeram a galera viajar.', '✨'),
  ('cultivador-indoor', 'Cultivador Indoor', 'Compartilhou técnicas de grow indoor.', '🏠'),
  ('curioso-iluminado', 'Curioso Iluminado', 'Fez 10 perguntas inteligentes na comunidade.', '💡')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    icon = excluded.icon;

insert into public.level_thresholds (level, min_xp, description)
values
  ('Iniciante', 0, 'Primeiros passos na comunidade.'),
  ('Entusiasta', 200, 'Participa ativamente com posts e comentários.'),
  ('Grower Sênior', 600, 'Compartilha técnicas e ajuda outras pessoas constantemente.'),
  ('Cultivador Indoor', 1200, 'Referência em conhecimento técnico e engajamento.')
on conflict (level) do update
set min_xp = excluded.min_xp,
    description = excluded.description;

insert into public.tags (slug, label)
values
  ('redução-de-danos', 'Redução de Danos'),
  ('legalização', 'Legalização'),
  ('indoor', 'Indoor'),
  ('outdoor', 'Outdoor'),
  ('edibles', 'Edibles')
on conflict (slug) do nothing;
