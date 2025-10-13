'use client';

import type { CSSProperties } from 'react';

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: "1.5rem",
  maxWidth: "960px",
  margin: "0 auto",
  padding: "4rem 1.5rem",
  color: "#F2E9E4",
};

const listStyle: CSSProperties = {
  margin: 0,
  paddingLeft: "1.25rem",
  display: "grid",
  gap: "0.6rem",
  lineHeight: 1.6,
  color: "#C8DCD1",
};

export default function TermsPage() {
  const principles = [
    "Você deve ter 18 anos ou mais para criar conta.",
    "Responsabilidade pelo conteúdo publicado é do autor. Conteúdo ilegal ou ofensivo será removido.",
    "Moderação pode aplicar medidas (aviso, shadowban, ban) para proteger a comunidade.",
  ];

  const usage = [
    "Não compartilhe dados pessoais de terceiros sem consentimento.",
    "Evite spam, links maliciosos e autopromoção excessiva.",
    "Conteúdo educativo sobre cultivo e redução de danos é bem-vindo; venda/compra de substâncias não é permitida.",
  ];

  return (
    <main
      style={{
        background: "linear-gradient(180deg, #051C14 0%, #0B3D2E 100%)",
        minHeight: "100vh",
      }}
    >
      <section style={{ ...sectionStyle, textAlign: "center" }}>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2.75rem", margin: 0 }}>
          Termos de Uso
        </h1>
        <p style={{ color: "#CBE9DA", lineHeight: 1.7 }}>
          O Doende Verde é um espaço comunitário de troca responsável. Ao continuar usando
          a plataforma, você concorda com as regras abaixo.
        </p>
      </section>

      <section style={{ ...sectionStyle, gap: "2rem" }}>
        <article
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(108, 59, 153, 0.35)",
            background: "rgba(5, 28, 20, 0.65)",
            padding: "1.75rem",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.75rem" }}>Princípios</h2>
          <ul style={listStyle}>
            {principles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(46, 204, 113, 0.3)",
            background: "rgba(5, 28, 20, 0.55)",
            padding: "1.75rem",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.75rem" }}>Uso aceitável</h2>
          <ul style={listStyle}>
            {usage.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(203, 233, 218, 0.25)",
            background: "rgba(5, 28, 20, 0.55)",
            padding: "1.75rem",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.75rem" }}>Responsabilidade & Isenção</h2>
          <p style={{ color: "#C8DCD1", lineHeight: 1.7 }}>
            O conteúdo publicado pelos usuários não representa opinião oficial da plataforma.
            Informações compartilhadas não substituem aconselhamento médico ou jurídico.
            A equipe se reserva o direito de remover conteúdo que viole leis brasileiras ou
            conduta comunitária.
          </p>
          <p style={{ color: "#CBE9DA" }}>
            Atualizações destes termos serão comunicadas no app e canais oficiais. Data da última
            atualização: {new Date().toLocaleDateString("pt-BR")}.
          </p>
        </article>
      </section>
    </main>
  );
}
