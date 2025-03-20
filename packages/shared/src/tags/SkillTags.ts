export const SkillTags = [
  "AI",
  "Blockchain",
  "Branding",
  "Cloud",
  "Design",
  "DevOps",
  "Engineering",
  "Infrastructure",
  "Java",
  "JavaScript",
  "Marketing",
  "NestJS",
  "NextJS",
  "Python",
  "R",
  "React",
  "Rust",
  "Scala",
  "Solidity",
  "TypeScript",
  "WebAssembly",
  "Writing"
] as const;

export type SkillTag = (typeof SkillTags)[number];
