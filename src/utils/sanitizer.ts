/**
 * Input Sanitization & Anti-XSS Utilities
 * Strips dangerous HTML entities and enforces safe characters in financial records.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/**
 * Escapes characters that can trigger HTML injection or script execution.
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/[&<>"'/`]/g, (char) => HTML_ENTITY_MAP[char] || char)
    .trim();
}

/**
 * Validates and sanitizes numeric strings, preventing NaN or unexpected inputs.
 */
export function sanitizeAmount(value: string | number): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : Math.max(0, value);
  }
  const cleaned = String(value).replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}
