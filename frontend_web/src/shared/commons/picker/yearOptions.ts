export function makeYearOptions({
  from,
  count,
}: {
  from: number; // 시작년도 (보통 현재년도)
  count: number; // 몇 년치 (보통 100~120)
}) {
  return Array.from({ length: count }, (_, i) => from - i);
}
