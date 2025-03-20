const currentYear = new Date().getFullYear();

export const years: number[] = [];
for (let i = currentYear; i > currentYear - 70; i--) {
  years.push(i);
}
