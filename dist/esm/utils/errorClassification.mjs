const TIMEOUT_PATTERNS = [
    /timeout/i,
    /timed out/i,
    /ETIMEDOUT/i,
    /ECONNRESET/i,
    /socket hang up/i,
];
const RATE_LIMIT_PATTERNS = [
    /rate.?limit/i,
    /too many requests/i,
    /429/,
    /quota exceeded/i,
    /capacity/i,
];
const SERVER_ERROR_PATTERNS = [
    /500/,
    /502/,
    /503/,
    /504/,
    /internal server error/i,
    /bad gateway/i,
    /service unavailable/i,
];
const UNAVAILABLE_PATTERNS = [
    /ENOTFOUND/i,
    /ECONNREFUSED/i,
    /getaddrinfo/i,
    /network/i,
    /unreachable/i,
];
const AUTH_PATTERNS = [
    /401/,
    /403/,
    /unauthorized/i,
    /forbidden/i,
    /invalid.*key/i,
    /authentication/i,
    /api.?key/i,
];
const BAD_REQUEST_PATTERNS = [/400/, /malformed/i, /bad request/i];
/**
 * Classifies an error to determine if fallback should be attempted.
 * @param error - The error to classify
 * @returns Classification result with type, message, and retryable flag
 */
function classifyError(error) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error?.status ??
        error?.statusCode;
    // Check status code first (most reliable)
    if (statusCode) {
        if (statusCode === 429) {
            return { type: 'rateLimit', message, retryable: true };
        }
        if (statusCode === 401 || statusCode === 403) {
            return { type: 'auth', message, retryable: false };
        }
        if (statusCode === 400) {
            return { type: 'badRequest', message, retryable: false };
        }
        if (statusCode >= 500 && statusCode < 600) {
            return { type: 'serverError', message, retryable: true };
        }
    }
    // Check message patterns
    if (TIMEOUT_PATTERNS.some((p) => p.test(message))) {
        return { type: 'timeout', message, retryable: true };
    }
    if (RATE_LIMIT_PATTERNS.some((p) => p.test(message))) {
        return { type: 'rateLimit', message, retryable: true };
    }
    if (AUTH_PATTERNS.some((p) => p.test(message))) {
        return { type: 'auth', message, retryable: false };
    }
    if (BAD_REQUEST_PATTERNS.some((p) => p.test(message))) {
        return { type: 'badRequest', message, retryable: false };
    }
    if (SERVER_ERROR_PATTERNS.some((p) => p.test(message))) {
        return { type: 'serverError', message, retryable: true };
    }
    if (UNAVAILABLE_PATTERNS.some((p) => p.test(message))) {
        return { type: 'unavailable', message, retryable: true };
    }
    // Default: unknown but retryable (conservative approach)
    return { type: 'unknown', message, retryable: true };
}
/**
 * Default error types that should trigger fallback
 */
const DEFAULT_FALLBACK_ON = [
    'timeout',
    'rateLimit',
    'serverError',
    'unavailable',
];
/**
 * Determines if the error type should trigger a fallback attempt.
 * @param errorType - The classified error type
 * @param fallbackOn - Array of error types that should trigger fallback (defaults to recoverable errors)
 * @returns True if fallback should be attempted
 */
function shouldTriggerFallback(errorType, fallbackOn = DEFAULT_FALLBACK_ON) {
    return fallbackOn.includes(errorType);
}

export { classifyError, shouldTriggerFallback };
//# sourceMappingURL=errorClassification.mjs.map
