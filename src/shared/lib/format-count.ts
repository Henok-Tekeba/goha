export function formatCount(
  count: number,
  singular: string,
  plural = `${singular}s`
): string {
  return `${count.toLocaleString("en")} ${count === 1 ? singular : plural}`;
}
