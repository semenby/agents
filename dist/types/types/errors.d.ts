/**
 * Classification of error types for fallback decisions
 */
export type ErrorClassification =
  | 'timeout'
  | 'rateLimit'
  | 'serverError'
  | 'unavailable'
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
