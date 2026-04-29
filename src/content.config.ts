import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({
		pattern: '**/[^_]*.{md,mdx}',
		base: './src/content/blog',
		generateId: ({ entry }: { entry: string }) => entry.replace(/\/index\.(md|mdx)$/, '').replace(/\.(md|mdx)$/, ''),
	}),
	schema: z
		.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).optional(),
			cover: z.string().optional(),
			coverAlt: z.string().optional(),
			layout: z.string().optional(),
		})
		.refine((data) => !data.cover || (data.coverAlt && data.coverAlt.trim().length > 0), {
			message: 'coverAlt is required when cover is set',
			path: ['coverAlt'],
		}),
});

export const collections = { blog };
