import { CredentialDTO } from "@coredin/shared";
import { defaultDate } from "./defaultDate";

export const defaultState: CredentialDTO = {
  id: "",
  subjectDid: "",
  type: "EducationCredential",
  title: "",
  establishment: "",
  startDate: defaultDate,
  endDate: undefined,
  issuer: "",
  issuerWallet: "",
  issuerUsername: "",
  verified: false
};
