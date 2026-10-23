/**
 * Number and Currency formatting utilities for PBS House Loan Management System
 * Conforms to Bangladesh BREB standards:
 * - South Asian comma grouping (e.g. 46,00,000)
 * - Bengali numerals (০-৯)
 * - Strict omission of "৳" symbol per official user specification
 */

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBnDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '০';
  return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

export function formatBnNumber(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '০';
  const n = Math.round(Number(amount));
  const isNegative = n < 0;
  const absStr = Math.abs(n).toString();

  let formatted = '';
  if (absStr.length <= 3) {
    formatted = absStr;
  } else {
    const lastThree = absStr.substring(absStr.length - 3);
    const otherNumbers = absStr.substring(0, absStr.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = `${formattedOther},${lastThree}`;
  }

  const bnFormatted = formatted.replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
  return isNegative ? `-${bnFormatted}` : bnFormatted;
}

export function formatBnDecimal(amount: number | string | undefined | null, decimals = 2): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '০.০০';
  const n = Number(amount);
  const parts = n.toFixed(decimals).split('.');
  const intPart = formatBnNumber(parts[0]);
  const decPart = toBnDigits(parts[1]);
  return `${intPart}.${decPart}`;
}
