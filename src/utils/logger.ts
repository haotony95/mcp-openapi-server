import { appendFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 } as const
type LogLevel = keyof typeof LOG_LEVELS

function parseLogLevel(value: string | undefined): LogLevel {
  const normalized = value?.toLowerCase().trim()
  if (normalized && normalized in LOG_LEVELS) return normalized as LogLevel
  return 'info'
}

export class Logger {
  private logFilePath: string | undefined
  private level: number

  constructor(private verbose: boolean = true) {
    this.logFilePath = process.env.LOG_FILE_PATH
    this.level = LOG_LEVELS[parseLogLevel(process.env.LOG_LEVEL)]
    if (this.logFilePath) {
      mkdirSync(dirname(this.logFilePath), { recursive: true })
    }
  }

  setVerbose(verbose: boolean | undefined): void {
    this.verbose = verbose ?? true
  }

  debug(message?: unknown, ...optionalParams: unknown[]): void {
    if (this.level > LOG_LEVELS.debug) return
    if (this.verbose) {
      console.error(message, ...optionalParams)
    }
    this.writeToFile('DEBUG', message, ...optionalParams)
  }

  info(message?: unknown, ...optionalParams: unknown[]): void {
    if (this.level > LOG_LEVELS.info) return
    if (this.verbose) {
      console.error(message, ...optionalParams)
    }
    this.writeToFile('INFO', message, ...optionalParams)
  }

  warn(message?: unknown, ...optionalParams: unknown[]): void {
    if (this.level > LOG_LEVELS.warn) return
    if (this.verbose) {
      console.warn(message, ...optionalParams)
    }
    this.writeToFile('WARN', message, ...optionalParams)
  }

  error(message?: unknown, ...optionalParams: unknown[]): void {
    if (this.level > LOG_LEVELS.error) return
    if (this.verbose) {
      console.error(message, ...optionalParams)
    }
    this.writeToFile('ERROR', message, ...optionalParams)
  }

  fatal(message?: unknown, ...optionalParams: unknown[]): void {
    console.error(message, ...optionalParams)
    this.writeToFile('FATAL', message, ...optionalParams)
  }

  private writeToFile(level: string, message?: unknown, ...optionalParams: unknown[]): void {
    if (!this.logFilePath) return
    const parts = [message, ...optionalParams].map(p =>
      typeof p === 'string' ? p : JSON.stringify(p)
    )
    const line = `${new Date().toISOString()} [${level}] ${parts.join(' ')}\n`
    appendFileSync(this.logFilePath, line)
  }
}
