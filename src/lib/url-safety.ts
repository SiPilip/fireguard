export function toSafeExternalUrl(input: string | null | undefined): string | null {
  if (!input || typeof input !== "string") return null;

  try {
    const parsed = new URL(input, "http://localhost");
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return input;
    }
    return null;
  } catch {
    if (input.startsWith("/")) {
      return input;
    }
    return null;
  }
}
