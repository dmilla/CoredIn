export const handleMonthChange = (
  selectedMonth: string,
  currentDate: string
) => {
  const dateArr = currentDate.split("-");
  return dateArr.toSpliced(1, 1, selectedMonth).join("-");
};

export const handleYearChange = (year: string, currentDate: string) => {
  const dateArr = currentDate.split("-");
  return dateArr?.toSpliced(2, 1, year).join("-");
};
