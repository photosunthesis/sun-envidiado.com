export const SITE = {
  name: "Sun Envidiado",
  url: "https://sun-envidiado.com",
  defaultDescription:
    "Personal website of Sun Envidiado — programmer, gamer, karaoke enthusiast.",
  defaultImage: "/default.png",
  locale: "en_US",
  themeColor: "#0a0a0a",
} as const;

export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.name,
  url: SITE.url,
  jobTitle: "Software Developer",
  description: SITE.defaultDescription,
  knowsAbout: ["Software Development", "Gaming", "Karaoke"],
  sameAs: [
    "https://github.com/photosunthesis",
    "https://www.linkedin.com/in/sunenvidiado/",
  ],
} as const;

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE.url,
  name: SITE.name,
  description: SITE.defaultDescription,
  inLanguage: "en-US",
  publisher: { "@id": PERSON_ID },
} as const;

export function absoluteUrl(path: string, site?: URL | string): string {
  return new URL(path, site ?? SITE.url).toString();
}

export function buildTitle(rawTitle?: string): string {
  if (!rawTitle || rawTitle === SITE.name) return SITE.name;
  if (rawTitle.includes(`— ${SITE.name}`)) return rawTitle;
  return `${rawTitle} — ${SITE.name}`;
}
