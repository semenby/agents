// src/types/errors.ts

/**
 * Classification of error types for fallback decisions
 */
export type ErrorClassification =
  | 'timeout'
  | 'rateLimit'
  | 'serverError'
  | 'unavailable'
  | 'notFound'
  | 'badRequest'
  | 'auth'
  | 'unknown';

/**
 * Result of error classification
 */
export interface ClassifiedError {
  type: ErrorClassification;
  message: string;
  retryable: boolean;
}

/**
 * Settings for fallback behavior
 */
export interface FallbackSettings {
  /** Error types that should trigger fallback */
  fallbackOn?: ErrorClassification[];
}
