import type { ImageMetadata } from 'astro';

export const SITE_CONFIG = {
  siteName: 'Sun Envidiado',
  authorName: 'Sun Envidiado',
  defaultDescription: 'Personal website where I share my thoughts about anything and everything.',
  defaultImage: '/default.png',
  siteUrl: 'https://sun-envidiado.com',
} as const;

export const PERSON_ID = `${SITE_CONFIG.siteUrl}/#person`;
export const WEBSITE_ID = `${SITE_CONFIG.siteUrl}/#website`;

export const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE_CONFIG.authorName,
  url: SITE_CONFIG.siteUrl,
  image: `${SITE_CONFIG.siteUrl}${SITE_CONFIG.defaultImage}`,
  jobTitle: 'Software Developer',
  description:
    'Software developer from Manila, Philippines, focused on Flutter app development.',
  knowsAbout: [
    'Flutter',
    'Dart',
    'Swift',
    'iOS App Development',
    'JavaScript',
    'TypeScript',
    'React',
    'Vue',
    'Web Development',
    'Mobile Development',
    'C#',
    '.NET',
    'PHP',
    'Laravel',
  ],
  sameAs: ['https://github.com/photosunthesis', 'https://www.linkedin.com/in/sunenvidiado/'],
} as const;

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE_CONFIG.siteUrl,
  name: SITE_CONFIG.siteName,
  alternateName: ['sun-envidiado.com', 'sun envidiado'],
  description: SITE_CONFIG.defaultDescription,
  inLanguage: 'en-US',
  publisher: { '@id': PERSON_ID },
} as const;

export interface SEOMetadata {
  title: string;
  description: string;
  canonical: string;
  imageUrl: string;
  type: 'website' | 'article';
  noIndex?: boolean;
  author?: string;
  pubDate?: string;
  tags?: string[];
}

export function generateCanonicalUrl(pathname: string, site?: URL | string): string {
  const baseUrl = site || SITE_CONFIG.siteUrl;
  return new URL(pathname, baseUrl).toString();
}

export function buildTitle(rawTitle: string, pathname: string): string {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return SITE_CONFIG.siteName;
  if (!rawTitle || rawTitle === SITE_CONFIG.siteName) return SITE_CONFIG.siteName;
  if (rawTitle.includes(`— ${SITE_CONFIG.siteName}`)) return rawTitle;
  return `${rawTitle} — ${SITE_CONFIG.siteName}`;
}

export function generateImageUrl(imageSrc: string, site?: URL | string): string {
  const baseUrl = site || SITE_CONFIG.siteUrl;
  return new URL(imageSrc, baseUrl).toString();
}

export function buildSEOMetadata(params: {
  frontmatter?: Record<string, unknown>;
  pathname: string;
  site?: URL | string;
  coverImage?: ImageMetadata;
}): SEOMetadata {
  const { frontmatter = {}, pathname, site, coverImage } = params;

  const rawTitle = (frontmatter.title as string) || SITE_CONFIG.siteName;
  const pubDate = frontmatter.pubDate as string | undefined;
  const title = buildTitle(rawTitle, pathname);

  const description = (frontmatter.description as string) || SITE_CONFIG.defaultDescription;
  const rawCanonical = (frontmatter.url as string) || generateCanonicalUrl(pathname, site);
  const canonical = rawCanonical.startsWith('http')
    ? rawCanonical
    : generateCanonicalUrl(rawCanonical, site);
  const tags = (frontmatter.tags as string[]) || [];
  const noIndex = (frontmatter.noIndex as boolean) || false;
  const explicitType = frontmatter.type as 'website' | 'article' | undefined;
  const type = explicitType || (pubDate ? 'article' : 'website');

  // Generate image URL
  let imageUrl: string;
  if (coverImage) {
    imageUrl = generateImageUrl(coverImage.src, site);
  } else if (frontmatter.image) {
    // If image is already a full URL, use it directly
    const imageValue = frontmatter.image as string;
    imageUrl = imageValue.startsWith('http') ? imageValue : generateImageUrl(imageValue, site);
  } else {
    imageUrl = generateImageUrl(SITE_CONFIG.defaultImage, site);
  }

  const author = pubDate ? SITE_CONFIG.authorName : undefined;

  return {
    title,
    description,
    canonical,
    imageUrl,
    type,
    noIndex,
    author,
    pubDate,
    tags,
  };
}
