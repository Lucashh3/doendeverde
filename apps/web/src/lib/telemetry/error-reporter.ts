type ReportOptions = {
  error: unknown;
  context?: Record<string, unknown>;
};

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development';

type SentryEvent = {
  level: 'error';
  message: string;
  timestamp: number;
  environment: string;
  extra?: Record<string, unknown>;
};

const buildEvent = (message: string, context?: Record<string, unknown>): SentryEvent => ({
  level: 'error',
  message,
  timestamp: Date.now() / 1000,
  environment: SENTRY_ENVIRONMENT,
  extra: context
});

const sendToSentry = async (event: SentryEvent) => {
  if (!SENTRY_DSN) return;

  try {
    const endpoint = `${SENTRY_DSN.replace(/\/$/, '')}/api/0/store/`;
    await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[error-reporter] failed to send event', error);
  }
};

const errorToMessage = (error: unknown) => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
};

export async function reportError({ error, context }: ReportOptions) {
  const message = errorToMessage(error);

  if (process.env.NODE_ENV !== 'production' || !SENTRY_DSN) {
    console.error('[error-reporter]', message, context ?? {});
  }

  await sendToSentry(buildEvent(message, context));
}
