import type {
  BlogPosting,
  BreadcrumbList,
  CollectionPage,
  ImageObject,
  WithContext,
} from 'schema-dts';
import { PERSON_ID, SITE_CONFIG, generateCanonicalUrl } from './seo';

export interface BlogPostingInput {
  title: string;
  description: string;
  image: string | { url: string; width: number; height: number };
  canonicalUrl: string;
  pubDate?: string;
  updatedDate?: string;
}

export function buildBlogPostingSchema(input: BlogPostingInput): BlogPosting {
  const image: ImageObject | string =
    typeof input.image === 'string'
      ? input.image
      : {
          '@type': 'ImageObject',
          url: input.image.url,
          width: { '@type': 'QuantitativeValue', value: input.image.width, unitCode: 'E37' },
          height: { '@type': 'QuantitativeValue', value: input.image.height, unitCode: 'E37' },
        };
  return {
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.canonicalUrl },
    headline: input.title,
    description: input.description,
    image,
    datePublished: input.pubDate,
    dateModified: input.updatedDate || input.pubDate,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export interface BlogPostBreadcrumbInput {
  title: string;
  canonicalUrl: string;
  site?: URL | string;
}

export function buildBlogPostBreadcrumb(input: BlogPostBreadcrumbInput): BreadcrumbList {
  const siteBase = (input.site || SITE_CONFIG.siteUrl).toString().replace(/\/$/, '');
  return buildBreadcrumbSchema([
    { name: 'Home', item: siteBase },
    { name: 'Blog', item: `${siteBase}/blog` },
    { name: input.title, item: input.canonicalUrl },
  ]);
}

export interface CollectionPageInput {
  name: string;
  description: string;
  url: string;
  hasPart?: { name: string; url: string; datePublished?: string }[];
}

export function buildCollectionPageSchema(input: CollectionPageInput): CollectionPage {
  return {
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.hasPart && {
      hasPart: input.hasPart.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.name,
        url: p.url,
        ...(p.datePublished && { datePublished: p.datePublished }),
        author: { '@id': PERSON_ID },
      })),
    }),
  };
}

export function asGraph(...nodes: object[]): WithContext<BlogPosting> | object {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

export function buildBlogPostGraph(
  post: BlogPostingInput,
  pathname: string,
  site?: URL | string,
): object {
  const canonicalUrl = post.canonicalUrl || generateCanonicalUrl(pathname, site);
  return asGraph(
    buildBlogPostingSchema({ ...post, canonicalUrl }),
    buildBlogPostBreadcrumb({ title: post.title, canonicalUrl, site }),
  );
}
