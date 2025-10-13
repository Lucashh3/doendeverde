type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const ENV_LOG_LEVEL = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined) ?? 'info';

const shouldLog = (level: LogLevel) => LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[ENV_LOG_LEVEL];

const serialize = (context?: LogContext) => {
  if (!context || Object.keys(context).length === 0) return '';
  try {
    return JSON.stringify(context);
  } catch (error) {
    return JSON.stringify({ _error: 'Failed to serialize log context', context: String(error) });
  }
};

const logToConsole = (level: LogLevel, scope: string, message: string, context?: LogContext) => {
  if (!shouldLog(level)) {
    return;
  }

  const payload = `[${level.toUpperCase()}] [${scope}] ${message}`;
  const serializedContext = serialize(context);

  switch (level) {
    case 'debug':
    case 'info':
      console.log(serializedContext ? `${payload} ${serializedContext}` : payload);
      break;
    case 'warn':
      console.warn(serializedContext ? `${payload} ${serializedContext}` : payload);
      break;
    case 'error':
      console.error(serializedContext ? `${payload} ${serializedContext}` : payload);
      break;
  }
};

export const createLogger = (scope: string) => ({
  debug: (message: string, context?: LogContext) => logToConsole('debug', scope, message, context),
  info: (message: string, context?: LogContext) => logToConsole('info', scope, message, context),
  warn: (message: string, context?: LogContext) => logToConsole('warn', scope, message, context),
  error: (message: string, context?: LogContext) => logToConsole('error', scope, message, context)
});

export const logger = createLogger('app');
