import { months } from "../constants/months";

export const formatDate = (date: string): string => {
  const dateArr = date.split("-");
  const [day, month, year] = dateArr;
  const formattedDate = `${months[Number(month) - 1]} ${year}`;
  return formattedDate;
};
