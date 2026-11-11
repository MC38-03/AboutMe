export const site = {
  name: "Muhammed Çetinkaya",
  shortName: "Muhammed",
  initials: "MC",
  location: "Amsterdam",
  email: "muhammedc38@hotmail.com",
  cvPath: "/cv-muhammed-cetinkaya.pdf",
  sourceUrl: "https://github.com/MC38-03/AboutMe",
  socials: {
    github: "https://github.com/MC38-03",
    linkedin: "https://www.linkedin.com/in/muhammed-cetinkaya",
  },
  spokenLanguages: [
    { code: "nl", level: "native" },
    { code: "en", level: "fluent" },
    { code: "tr", level: "fluent" },
    { code: "ar", level: "beginner" },
  ],
} as const;

export type Site = typeof site;
