import { CredentialDTO } from "@coredin/shared";
import { isEndDateAfterStart } from "./isEndDateAfterStart";

export const hasValidInput = (
  stateData: CredentialDTO,
  hasEndDate: boolean
): boolean => {
  const { title, issuer, establishment, startDate, endDate } = stateData;
  if (
    title.length < 2 ||
    issuer.length < 2 ||
    !establishment ||
    startDate.slice(3, 5) === "00" ||
    startDate.slice(6) === "0000" ||
    (hasEndDate &&
      (endDate === undefined ||
        endDate?.slice(3, 5) === "00" ||
        endDate?.slice(6) === "0000" ||
        !isEndDateAfterStart(startDate, endDate)))
  ) {
    return false;
  } else {
    return true;
  }
};
