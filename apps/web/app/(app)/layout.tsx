import Link from 'next/link';
import type { ReactNode } from 'react';

import './app-layout.css';

type AppLayoutProps = {
  children: ReactNode;
};

const links = [
  { href: '/feed', label: 'Feed' },
  { href: '/hall-da-brisa', label: 'Hall da Brisa' },
  { href: '/conquistas', label: 'Conquistas' },
  { href: '/posts/criar', label: 'Criar Post' },
  { href: '/admin', label: 'Painel Admin' },
  { href: '/configuracoes/privacidade', label: 'Privacidade' }
];

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/" className="app-logo">
          🌿 Doende Verde
        </Link>
        <nav className="app-nav">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="app-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="app-content">{children}</div>
    </div>
  );
}
