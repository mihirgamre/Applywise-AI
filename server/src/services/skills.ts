const SKILLS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Node.js",
  "Express",
  "PostgreSQL",
  "Prisma",
  "Python",
  "Java",
  "C++",
  "AWS",
  "Docker",
  "Kubernetes",
  "REST",
  "GraphQL",
  "SQL",
  "MongoDB",
  "Redis",
  "CI/CD",
  "Git",
  "Testing",
  "Jest",
  "Tailwind",
  "Next.js",
  "Machine Learning",
  "OpenAI"
];

export function extractSkills(text: string) {
  const normalized = text.toLowerCase();
  return SKILLS.filter((skill) => normalized.includes(skill.toLowerCase()));
}
