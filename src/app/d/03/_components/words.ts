const ONES = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** 26 → "twenty-six" (numbers under a hundred, for counts in running text) */
export function inWords(n: number) {
  if (n < 20) return ONES[n];
  if (n > 99) return String(n);
  return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
}

export const capital = (s: string) => s.replace(/^./, (m) => m.toUpperCase());
