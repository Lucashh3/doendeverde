import Image from 'next/image';
import Link from 'next/link';

const heroStyle = {
  display: 'grid',
  gap: '2.5rem',
  alignItems: 'center',
  justifyItems: 'center',
  textAlign: 'center',
  padding: '6rem 1.5rem 4rem'
} as const;

const sectionStyle = {
  display: 'grid',
  gap: '1.5rem',
  padding: '4rem 1.5rem',
  maxWidth: '960px',
  margin: '0 auto',
  color: '#F2E9E4'
} as const;

const ctaStyle = {
  display: 'inline-flex',
  gap: '0.75rem',
  alignItems: 'center',
  padding: '0.85rem 1.75rem',
  borderRadius: '999px',
  background: 'linear-gradient(135deg, #0B3D2E 0%, #6C3B99 100%)',
  color: '#F2E9E4',
  textDecoration: 'none',
  fontWeight: 600,
  boxShadow: '0 16px 40px rgba(11, 61, 46, 0.45)'
} as const;

const features = [
  {
    title: 'Privacidade por padrão',
    description:
      'Escolha um codinome, compartilhe experiências com segurança e controle total sobre notificações e exposição.'
  },
  {
    title: 'Gamificação leve',
    description:
      'Ganhe XP por posts, comentários e votos recebidos. Suba de nível, cole badges raros e conquiste o Hall da Brisa.'
  },
  {
    title: 'Conteúdo comunitário',
    description:
      'Feed filtrável por categorias e tags, curadoria semanal e espaço para cultura, educação e cultivo responsável.'
  }
];

const faqs = [
  {
    question: 'O que é o Doende Verde?',
    answer:
      'Uma comunidade canábica brasileira onde você pode trocar experiências, aprender e se engajar sem censura, com moderação atenta e clima acolhedor.'
  },
  {
    question: 'Posso usar meu nome real?',
    answer:
      'Claro! Mas incentivamos começar com um codinome. Você decide quanto quer revelar e pode alterar isso a qualquer momento.'
  },
  {
    question: 'Como funcionam os níveis?',
    answer:
      'XP é acumulado interagindo na comunidade. Cada nível desbloqueia badges, destaque no Hall da Brisa e futuras missões especiais.'
  }
];

export default function LandingPage() {
  return (
    <main style={{ background: 'linear-gradient(180deg, #051C14 0%, #0B3D2E 100%)', color: '#E8F5EC' }}>
      <section style={heroStyle}>
        <Image
          src="/assets/branding/logo-primary.svg"
          alt="Doende Verde — Comunidade Canábica"
          width={200}
          height={70}
          priority
        />
        <p style={{ maxWidth: '680px', lineHeight: 1.7, fontSize: '1.1rem', color: '#CBE9DA' }}>
          Compartilhe sua brisa, aprenda novas técnicas de cultivo e fortaleça a cena canábica nacional com privacidade,
          respeito e uma pitada de gamificação.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/auth/sign-in" style={ctaStyle}>
            Entrar na Brisa
          </Link>
          <Link
            href="#features"
            style={{
              ...ctaStyle,
              background: 'rgba(108, 59, 153, 0.2)',
              boxShadow: 'none'
            }}
          >
            Conhecer recursos
          </Link>
        </div>
        <Image
          src="/assets/branding/mascot-doende.svg"
          alt="Mascote Doende Verde acenando"
          width={200}
          height={220}
        />
      </section>

      <section id="features" style={{ ...sectionStyle, background: 'rgba(11, 61, 46, 0.35)', borderRadius: '32px' }}>
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.25rem' }}>
          Feito por e para a comunidade canábica brasileira
        </h2>
        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
          }}
        >
          {features.map(feature => (
            <article
              key={feature.title}
              style={{
                borderRadius: '20px',
                border: '1px solid rgba(108, 59, 153, 0.35)',
                background: 'rgba(5, 28, 20, 0.65)',
                padding: '1.75rem'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#F2E9E4' }}>{feature.title}</h3>
              <p style={{ marginTop: '0.75rem', lineHeight: 1.6, color: '#C8DCD1' }}>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ ...sectionStyle, textAlign: 'left' }}>
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem' }}>
          Perguntas frequentes
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {faqs.map(faq => (
            <details
              key={faq.question}
              style={{
                borderRadius: '16px',
                border: '1px solid rgba(203, 233, 218, 0.25)',
                background: 'rgba(5, 28, 20, 0.55)',
                padding: '1.25rem'
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1.05rem' }}>{faq.question}</summary>
              <p style={{ marginTop: '0.75rem', color: '#CBE9DA', lineHeight: 1.6 }}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: '#9AA0A6',
          fontSize: '0.9rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Link href="/privacidade" style={{ color: '#CBE9DA', textDecoration: 'underline' }}>
            Política de Privacidade
          </Link>
          <Link href="/termos" style={{ color: '#CBE9DA', textDecoration: 'underline' }}>
            Termos de Uso
          </Link>
          <Link href="/faq" style={{ color: '#CBE9DA', textDecoration: 'underline' }}>
            FAQ
          </Link>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Doende Verde. Cultivando conexões seguras.</p>
      </footer>
    </main>
  );
}
