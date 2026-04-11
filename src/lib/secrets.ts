const warnedMissingSecrets = new Set<string>();

function resolveSecret(name: string, developmentFallback: string): string {
  const value = process.env[name]?.trim();
  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Environment variable ${name} is required in production.`);
  }

  if (!warnedMissingSecrets.has(name)) {
    console.warn(`[config] ${name} is not set. Using development fallback.`);
    warnedMissingSecrets.add(name);
  }

  return developmentFallback;
}

export function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(
    resolveSecret('JWT_SECRET', 'super-secret-jwt-key-for-dev')
  );
}

export function getOtpHashSecret(): string {
  return resolveSecret('OTP_HASH_SECRET', 'secret-development-key');
}