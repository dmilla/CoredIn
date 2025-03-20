export const credentialLabels = {
  EducationCredential: {
    titleLabel: "Add a degree title",
    titlePlaceholder: "Example: BA Spatial Design",
    establishmentLabel: "Add an institution",
    establishmentPlaceholder: "Example: University of the Arts London",
    hasEndDateLabel: "I am currently studying here"
  },
  ProfessionalExperience: {
    titleLabel: "Add a job title",
    titlePlaceholder: "Example: Software engineer",
    establishmentLabel: "Add a company name",
    establishmentPlaceholder: "Example: cored.in",
    hasEndDateLabel: "I am currently working in this role"
  },
  EventAttendance: {
    titleLabel: "Add an event name",
    titlePlaceholder: "Example: EBC Hackathon",
    establishmentLabel: "Add an event organizer",
    establishmentPlaceholder: "Example: European Blockchain Convention",
    hasEndDateLabel: "The end date of the event is the same as its start"
  }
} as const;
