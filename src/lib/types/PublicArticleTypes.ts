import z from "zod";

export const SingleArticleResponseZ = z.object({
  title: z.string(),
  overview: z.string(),
  content: z.object({
    keywords: z.array(z.string()),
    tags: z.array(z.string()),
    landingImage: z.string().nullable(),
    content: z.string(),
  }),
  author: z.object({
    username: z.string(),
    profilePicture: z.string(),
    dateWritten: z.string(),
  }),
  organisation: z.object({
    name: z.string(),
    organisationId: z.string(),
    logo: z.string().nullable(),
  }),
});

export type SingleArticleResponse = z.infer<typeof SingleArticleResponseZ>;

export const LatestArticlesResponseZ = z.array(
  z.object({
    title: z.string(),
    articleId: z.string(),
    landingImage: z.string(),
    overview: z.string()
  })
);

export type LatestArticlesResponse = z.infer<typeof LatestArticlesResponseZ>;

export const AllArticlesResponseZ = z.array(
  z.object({
    title: z.string(),
    datePublished: z.string(),
    articleId: z.string(),

    landingImage: z.string(),

    keywords: z.array(z.string()),
    tags: z.array(z.string()),
    overview: z.string().nullable(),

    organisation: z.object({
      organisationName: z.string(),
      organisationId: z.string(),

      metadata: z.object({
        logo: z.string(),
        description: z.string(),
        website: z.string(),
        x: z.string(),
        discord: z.string(),
      }),
    }),
  })
);

export type AllArticlesResponse = z.infer<typeof AllArticlesResponseZ>;