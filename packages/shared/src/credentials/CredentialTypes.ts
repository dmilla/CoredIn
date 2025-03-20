export const CredentialTypes = [
  "EducationCredential",
  "ProfessionalExperience",
  "EventAttendance"
] as const;

export type CredentialType = (typeof CredentialTypes)[number];
