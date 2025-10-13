-- Seed data for Doende Verde MVP

insert into public.categories (slug, label, description, icon)
values
  ('experiencias', 'Experiências', 'Relatos de brisas, viagens e aprendizados da comunidade.', '🌬️'),
  ('cultivo', 'Cultivo', 'Dicas, setups e genética para quem ama cuidar da planta.', '🌱'),
  ('educacao', 'Educação', 'Informação segura sobre usos, legislação e redução de danos.', '📚'),
  ('cultura-e-memes', 'Cultura & Memes', 'Memes, arte, música e cultura canábica brasileira.', '🎭'),
  ('saude-bem-estar', 'Saúde & Bem-estar', 'Benefícios medicinais, cuidados pessoais e bem-estar relacionado ao uso responsável.', '🩺'),
  ('politica-legislacao', 'Política & Legislação', 'Atualizações sobre leis, advocacy, direitos e discussões políticas sobre cannabis.', '⚖️'),
  ('pesquisa-ciencia', 'Pesquisa & Ciência', 'Estudos científicos, descobertas médicas e avanços na pesquisa canábica.', '🔬'),
  ('sustentabilidade', 'Sustentabilidade', 'Cultivo orgânico, impacto ambiental, práticas ecológicas e consumo consciente.', '🌍')
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
  ('edibles', 'Edibles'),
  ('medicina', 'Medicina'),
  ('terpenos', 'Terpenos'),
  ('canabinoides', 'Canabinoides'),
  ('orgânico', 'Orgânico'),
  ('permacultura', 'Permacultura'),
  ('ativismo', 'Ativismo'),
  ('reforma-da-lei', 'Reforma da Lei'),
  ('estudos-clínicos', 'Estudos Clínicos'),
  ('dor-crônica', 'Dor Crônica'),
  ('ansiedade', 'Ansiedade'),
  ('epilepsia', 'Epilepsia'),
  ('sementes', 'Sementes'),
  ('clonagem', 'Clonagem'),
  ('poda', 'Poda'),
  ('floração', 'Floração')
on conflict (slug) do nothing;
