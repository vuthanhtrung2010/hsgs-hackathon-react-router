export function parseStudentIds(input: string): string[] {
  if (!input || !input.trim()) return [];
  const tokens = input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return Array.from(new Set(tokens));
}
