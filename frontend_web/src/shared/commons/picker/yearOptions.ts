export function makeYearOptions({
  from,
  count,
}: {
  from: number; // 시작년도 (보통 현재년도)
  count: number; // 몇 년치 (보통 100~120)
}) {
  return Array.from({ length: count }, (_, i) => from - i);
}

type BirthYearRange = {
  min: number;
  max: number;
};

export function getBirthYearRange(currentYear = new Date().getFullYear()): BirthYearRange {
  return {
    min: currentYear - 100,
    max: currentYear - 10,
  };
}

export function isValidBirthYear(year: number | undefined): year is number {
  if (typeof year !== "number" || !Number.isInteger(year)) return false;
  const { min, max } = getBirthYearRange();
  return year >= min && year <= max;
}
