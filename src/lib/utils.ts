export const format_number = (num: number): string => {
  return (!isNaN(num) ? Number(num).toFixed(2) : num.toString());
};
