import { defineCollection, z } from 'astro:content';

const items = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    kind: z.enum(['article', 'talk']),
    date: z.string(),
    url: z.string(),
    mediumUrl: z.string().optional(),
    summary: z.string(),
    tags: z.array(z.string()),
    group: z.string().optional(),
  }),
});

export const collections = { items };
