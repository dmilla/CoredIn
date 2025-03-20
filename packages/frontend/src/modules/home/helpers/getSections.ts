import { CredentialDTO } from "@coredin/shared";

export const getSections = (credentials: CredentialDTO[]) => {
  return [
    {
      section: "Education",
      credentials: credentials.filter((c) => c.type === "EducationCredential")
    },
    {
      section: "Experience",
      credentials: credentials.filter(
        (c) => c.type === "ProfessionalExperience"
      )
    },
    {
      section: "Events",
      credentials: credentials.filter((c) => c.type === "EventAttendance")
    }
  ];
};
