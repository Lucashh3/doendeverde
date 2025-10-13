'use client';

import type { CSSProperties } from 'react';

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: "1.5rem",
  maxWidth: "960px",
  margin: "0 auto",
  padding: "4rem 1.5rem",
  color: "#E8F5EC",
};

const headingStyle: CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif",
  margin: 0,
};

export default function PrivacyPage() {
  const sections: Array<{ title: string; items: string[] }> = [
    {
      title: "Dados que coletamos",
      items: [
        "E-mail e codinome para autenticação via Supabase Auth.",
        "Dados de perfil (avatar, bio, preferências de privacidade).",
        "Atividades in-app (posts, comentários, votos) para fins comunitários e de gamificação.",
      ],
    },
    {
      title: "Como usamos",
      items: [
        "Personalizar sua experiência (feed, recomendações e notificações).",
        "Aplicar gamificação (XP, badges, Hall da Brisa).",
        "Monitorar comportamento suspeito e garantir segurança da comunidade.",
      ],
    },
    {
      title: "Controle do usuário",
      items: [
        "Você pode editar ou excluir seu perfil a qualquer momento.",
        "Exportação de dados disponível mediante solicitação (hello@doendeverde.app).",
        "Solicitações de exclusão total são processadas em até 7 dias úteis.",
      ],
    },
  ];

  return (
    <main
      style={{
        background: "linear-gradient(180deg, #051C14 0%, #0B3D2E 100%)",
        minHeight: "100vh",
      }}
    >
      <section style={{ ...sectionStyle, textAlign: "center" }}>
        <h1 style={{ ...headingStyle, fontSize: "2.75rem" }}>
          Política de Privacidade
        </h1>
        <p style={{ color: "#CBE9DA", lineHeight: 1.7 }}>
          Levamos sua privacidade a sério. O Doende Verde foi desenhado para
          garantir que você tenha controle total sobre sua presença na
          comunidade, mantendo dados sensíveis protegidos e auditáveis.
        </p>
      </section>

      <section style={{ ...sectionStyle, gap: "2rem" }}>
        {sections.map((section) => (
          <article
            key={section.title}
            style={{
              borderRadius: "20px",
              border: "1px solid rgba(203, 233, 218, 0.25)",
              background: "rgba(5, 28, 20, 0.65)",
              padding: "1.75rem",
              display: "grid",
              gap: "0.75rem",
            }}
          >
            <h2 style={{ ...headingStyle, fontSize: "1.75rem" }}>
              {section.title}
            </h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2rem",
                display: "grid",
                gap: "0.65rem",
                color: "#C8DCD1",
                lineHeight: 1.6,
              }}
            >
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section style={{ ...sectionStyle, paddingBottom: "6rem" }}>
        <h2 style={{ ...headingStyle, fontSize: "1.75rem" }}>Cookies & Infra</h2>
        <p style={{ color: "#C8DCD1", lineHeight: 1.7 }}>
          Utilizamos Supabase Auth para sessões e armazenamento de dados, e
          Vercel para hospedagem. Cookies são usados apenas para autenticação.
          Podemos adicionar analytics (Plausible) respeitando privacidade
          (sem rastreamento individual).
        </p>
        <h2 style={{ ...headingStyle, fontSize: "1.75rem" }}>Contato</h2>
        <p style={{ color: "#CBE9DA" }}>
          Dúvidas ou solicitações:{" "}
          <a
            href="mailto:hello@doendeverde.app"
            style={{ color: "#7BD6A3", textDecoration: "underline" }}
          >
            hello@doendeverde.app
          </a>
        </p>
      </section>
    </main>
  );
}
