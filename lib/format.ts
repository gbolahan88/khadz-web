// lib/format.ts
export function parseToNumber(value: string | number) {
  if (typeof value === "number") return value;
  const digitsOnly = value.toString().replace(/[^0-9.-]/g, "");
  return Number(digitsOnly) || 0;
}

export function formatCurrency(value: string | number) {
  const number = parseToNumber(value);
  return `₦ ${number.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}