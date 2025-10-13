'use client';

import type { CSSProperties } from 'react';
import Link from "next/link";

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: "1.5rem",
  maxWidth: "900px",
  margin: "0 auto",
  padding: "4rem 1.5rem",
  color: "#F2E9E4",
};

const faqItems = [
  {
    question: "Como recebo convite para o beta?",
    answer:
      "Cadastre-se na landing principal. Enviamos convites em lotes semanais priorizando pessoas que se inscrevem com alguma motivação (cultivo, educação, cultura).",
  },
  {
    question: "Posso publicar fotos ou vídeos?",
    answer:
      "Sim! Suportamos uploads de imagem/vídeo curto via Supabase Storage. Evite conteúdo que exponha terceiros ou informações sensíveis.",
  },
  {
    question: "O que acontece se meu post for sinalizado?",
    answer:
      "Você recebe um aviso privado com contexto. A moderação revisa e decide entre manter, editar ou remover. Banimentos só acontecem após análise criteriosa.",
  },
  {
    question: "Existe aplicativo mobile?",
    answer:
      "Ainda não, mas o site é responsivo. Estamos avaliando PWA após o beta.",
  },
  {
    question: "Como ganhar badges?",
    answer:
      "Participando: primeiro post, votos recebidos, relatos que engajam a galera. Novas conquistas serão anunciadas na newsletter.",
  },
];

export default function FaqPage() {
  return (
    <main
      style={{
        background: "linear-gradient(180deg, #051C14 0%, #0B3D2E 100%)",
        minHeight: "100vh",
        color: "#F2E9E4",
      }}
    >
      <section style={{ ...sectionStyle, textAlign: "center" }}>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2.75rem", margin: 0 }}>
          FAQ — Dúvidas Frequentes
        </h1>
        <p style={{ color: "#CBE9DA", lineHeight: 1.7 }}>
          Encontrou algo que não está aqui? Manda um alô em{" "}
          <a
            href="mailto:hello@doendeverde.app"
            style={{ color: "#7BD6A3", textDecoration: "underline" }}
          >
            hello@doendeverde.app
          </a>{" "}
          ou venha conversar direto no app.
        </p>
      </section>

      <section style={{ ...sectionStyle, gap: "1.5rem", paddingBottom: "6rem" }}>
        <div
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          {faqItems.map((item) => (
            <article
              key={item.question}
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(108, 59, 153, 0.35)",
                background: "rgba(5, 28, 20, 0.65)",
                padding: "1.5rem",
                display: "grid",
                gap: "0.6rem",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.35rem" }}>{item.question}</h2>
              <p style={{ margin: 0, color: "#C8DCD1", lineHeight: 1.7 }}>
                {item.answer}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#C8DCD1",
          }}
        >
          <p>
            Precisa de suporte imediato? Visite nossa{" "}
            <Link href="/admin" style={{ color: "#7BD6A3" }}>
              central de moderação
            </Link>{" "}
            ou envie um flag diretamente do post.
          </p>
        </div>
      </section>
    </main>
  );
}
