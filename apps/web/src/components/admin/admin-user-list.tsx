'use client';

import { useState, useTransition } from 'react';

import { setUserModerationStatus } from '@/actions/admin';

type UserRecord = {
  id: string;
  username: string;
  display_name: string | null;
  moderation_status: string;
  is_admin: boolean;
  created_at: string;
};

type AdminUserListProps = {
  users: UserRecord[];
};

const STATUS_OPTIONS: Array<{ value: 'active' | 'shadowbanned' | 'banned'; label: string }> = [
  { value: 'active', label: 'Ativo' },
  { value: 'shadowbanned', label: 'Shadowban' },
  { value: 'banned', label: 'Banido' }
];

export function AdminUserList({ users }: AdminUserListProps) {
  if (users.length === 0) {
    return <p style={{ color: '#9AA0A6', margin: 0 }}>Nenhum usuário encontrado.</p>;
  }

  return (
    <div
      style={{
        borderRadius: '18px',
        border: '1px solid rgba(23, 62, 48, 0.5)',
        background: 'rgba(5, 28, 20, 0.75)',
        overflow: 'hidden'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(17, 94, 72, 0.4)', color: '#F2E9E4' }}>
            <th style={thStyle}>Usuário</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Criado em</th>
            <th style={thStyle}>Admin</th>
            <th style={thStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRow({ user }: { user: UserRecord }) {
  const [status, setStatus] = useState<'active' | 'shadowbanned' | 'banned'>(
    user.moderation_status as 'active' | 'shadowbanned' | 'banned'
  );
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (next: 'active' | 'shadowbanned' | 'banned') => {
    setStatus(next);
    startTransition(async () => {
      await setUserModerationStatus(user.id, next);
    });
  };

  return (
    <tr
      style={{
        borderBottom: '1px solid rgba(23, 62, 48, 0.35)',
        color: '#E0E6E9'
      }}
    >
      <td style={tdStyle}>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <strong>@{user.username}</strong>
          {user.display_name ? <span style={{ color: '#9AA0A6' }}>{user.display_name}</span> : null}
        </div>
      </td>
      <td style={tdStyle}>
        <select
          value={status}
          onChange={event => handleStatusChange(event.target.value as typeof status)}
          disabled={isPending}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            border: '1px solid rgba(46, 204, 113, 0.35)',
            background: 'rgba(17, 94, 72, 0.35)',
            color: '#F2E9E4'
          }}
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td style={tdStyle}>{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
      <td style={tdStyle}>{user.is_admin ? 'Sim' : 'Não'}</td>
      <td style={tdStyle}>
        <StatusHint status={status} />
      </td>
    </tr>
  );
}

function StatusHint({ status }: { status: string }) {
  const descriptions: Record<string, string> = {
    active: 'Participação normal na comunidade.',
    shadowbanned: 'Postagens visíveis apenas ao autor.',
    banned: 'Acesso bloqueado.'
  };

  return <span style={{ color: '#9AA0A6', fontSize: '0.85rem' }}>{descriptions[status] ?? ''}</span>;
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.85rem 1rem',
  fontWeight: 600,
  fontSize: '0.9rem'
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  verticalAlign: 'top',
  fontSize: '0.95rem'
};
