import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({
		pattern: '**/[^_]*.{md,mdx}',
		base: './src/content/blog',
		generateId: ({ entry }: { entry: string }) => entry.replace(/\/index\.(md|mdx)$/, '').replace(/\.(md|mdx)$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(z.string()).optional(),
		cover: z.string().optional(),
		coverAlt: z.string().optional(),
		layout: z.string().optional(),
	}),
});

export const collections = { blog };
