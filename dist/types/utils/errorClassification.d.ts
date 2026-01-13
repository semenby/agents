import type { ClassifiedError, ErrorClassification } from '../types/errors';
/**
 * Classifies an error to determine if fallback should be attempted.
 * @param error - The error to classify
 * @returns Classification result with type, message, and retryable flag
 */
export declare function classifyError(error: unknown): ClassifiedError;
/**
 * Determines if the error type should trigger a fallback attempt.
 * @param errorType - The classified error type
 * @param fallbackOn - Array of error types that should trigger fallback (defaults to recoverable errors)
 * @returns True if fallback should be attempted
 */
export declare function shouldTriggerFallback(
  errorType: ErrorClassification,
  fallbackOn?: ErrorClassification[]
): boolean;
