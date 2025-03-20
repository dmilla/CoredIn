import { months } from "@/modules/home/constants/months";

export const getSelectedMonth = (month: string) => {
  const monthIndex = months.indexOf(month);
  return monthIndex + 1 > 9 ? `${monthIndex + 1}` : `0${monthIndex + 1}`;
};
