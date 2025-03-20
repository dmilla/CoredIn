export const isEndDateAfterStart = (
  startDate: string,
  endDate: string | undefined
) => {
  if (endDate) {
    const startDateArr = startDate.split("-");
    const [startDay, startMonth, startYear] = startDateArr;
    const endDateArr = endDate.split("-");
    const [endDay, endMonth, endYear] = endDateArr;
    if (endYear === startYear && endMonth < startMonth) {
      return false;
    } else if (endYear < startYear) {
      return false;
    }
    return true;
  }
  // it will never reach this as that part is conditionally rendered depending on the hasEndDate boolean (I think)
  return false;
};
