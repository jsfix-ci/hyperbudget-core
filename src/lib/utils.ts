export const format_number = (num: number): string => {
  if (num === null) { return null; }
  return (!isNaN(num) ? Number(num).toFixed(2) : num.toString());
};
