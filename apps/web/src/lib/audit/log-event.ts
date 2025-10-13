import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database, Json } from '@/types/database';

type RegisterAuditArgs = Database['public']['Functions']['register_audit_event']['Args'];

export async function logAuditEvent(
  supabase: SupabaseClient<Database>,
  action: string,
  metadata?: Json
) {
  try {
    const payload: RegisterAuditArgs = metadata === undefined ? { action } : { action, metadata };
    // Supabase typings do not yet expose this RPC signature correctly; we coerce to pass runtime payload.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - temporary until supabase-js types include register_audit_event args.
    await supabase.rpc('register_audit_event', payload);
  } catch (error) {
    console.warn('[logAuditEvent] Falha ao registrar evento', action, error);
  }
}
