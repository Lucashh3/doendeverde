'use client';

import { useTransition } from 'react';

import { resolveAlert } from '@/actions/admin';

type AlertRecord = {
  id: string;
  alert_type: string;
  severity: string;
  metadata: Record<string, unknown>;
  created_at: string;
  resolved_at: string | null;
  user: {
    id: string;
    username: string;
  } | null;
  resolver: {
    id: string;
    username: string;
  } | null;
};

type AdminAlertsListProps = {
  alerts: AlertRecord[];
};

export function AdminAlertsList({ alerts }: AdminAlertsListProps) {
  if (alerts.length === 0) {
    return <p style={{ color: '#9AA0A6', margin: 0 }}>Nenhum alerta automático registrado.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {alerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}

function AlertCard({ alert }: { alert: AlertRecord }) {
  const [isPending, startTransition] = useTransition();

  const handleResolve = () => {
    startTransition(async () => {
      await resolveAlert(alert.id);
    });
  };

  return (
    <article
      style={{
        borderRadius: '16px',
        border: '1px solid rgba(46, 204, 113, 0.3)',
        background: 'rgba(5, 28, 20, 0.75)',
        padding: '1.25rem',
        display: 'grid',
        gap: '0.75rem'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <strong style={{ fontSize: '1.15rem', color: '#F2E9E4' }}>
            {alert.alert_type.replace(/_/g, ' ')}
          </strong>
          <div style={{ color: '#9AA0A6', fontSize: '0.9rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span>Usuário: @{alert.user?.username ?? 'desconhecido'}</span>
            <span>Detectado: {new Date(alert.created_at).toLocaleString('pt-BR')}</span>
            {alert.resolved_at ? (
              <span>
                Resolvido por @{alert.resolver?.username ?? 'admin'} em{' '}
                {new Date(alert.resolved_at).toLocaleString('pt-BR')}
              </span>
            ) : null}
          </div>
        </div>
        <SeverityBadge severity={alert.severity} resolved={Boolean(alert.resolved_at)} />
      </header>

      <pre
        style={{
          margin: 0,
          padding: '0.75rem',
          borderRadius: '12px',
          background: 'rgba(17, 94, 72, 0.3)',
          color: '#E8DAFF',
          fontSize: '0.85rem',
          overflowX: 'auto'
        }}
      >
        {JSON.stringify(alert.metadata, null, 2)}
      </pre>

      {!alert.resolved_at ? (
        <button
          type="button"
          onClick={handleResolve}
          disabled={isPending}
          style={{
            justifySelf: 'flex-start',
            border: 'none',
            borderRadius: '999px',
            padding: '0.45rem 1.5rem',
            background: 'rgba(46, 204, 113, 0.85)',
            color: '#081E19',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Marcar como resolvido
        </button>
      ) : null}
    </article>
  );
}

function SeverityBadge({ severity, resolved }: { severity: string; resolved: boolean }) {
  const palette: Record<string, { bg: string; text: string }> = {
    low: { bg: 'rgba(52, 152, 219, 0.2)', text: '#3498db' },
    medium: { bg: 'rgba(241, 196, 15, 0.25)', text: '#f1c40f' },
    high: { bg: 'rgba(231, 76, 60, 0.25)', text: '#e74c3c' }
  };

  const key = resolved ? 'low' : severity?.toLowerCase();
  const { bg, text } = palette[key] ?? palette.medium;

  return (
    <span
      style={{
        padding: '0.35rem 0.9rem',
        borderRadius: '999px',
        background: bg,
        color: text,
        textTransform: 'uppercase',
        fontWeight: 600,
        fontSize: '0.8rem',
        letterSpacing: '0.04em'
      }}
    >
      {resolved ? 'resolvido' : severity}
    </span>
  );
}
