import z from "zod";

export interface Article {
  title: string;
  article_id: string;
  organisation_id: string;
  display_rules: {
    hidden: boolean;
    deleted: boolean;
    show_on_main_site: boolean;
  };
  metadata: {
    date_written: string;
    authors: string[];
  };
  canEdit: boolean;
  canDelete: boolean;
};

export interface Organisation {
  organisation_id: string;
  organisation_name: string;
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
};

export interface User {
  isTopLevelAdmin: boolean;
  userId: string;
  organisations: Organisation[];
  user_metadata: {
    username: string;
    //handle: string;
    profile_picture: string;
    socials: {
      x: string;
      linked_in: string;
      website: string;
    };
  };
};

export const UserSchema = z.object({
  user: z.object({
    isTopLevelAdmin: z.boolean(),
    userId: z.string(),
    organisations: z.array(z.object({
      organisation_id: z.string(),
      organisation_name: z.string(),
      isAdmin: z.boolean(),
      canEdit: z.boolean(),
      canDelete: z.boolean(),
      canCreate: z.boolean(),
    })),
    user_metadata: z.object({
      username: z.string(),
      //handle: z.string(),
      profile_picture: z.string(),
      socials: z.object({
        x: z.string(),
        linked_in: z.string(),
        website: z.string(),
      }),
    })
  }),
  articles: z.array(z.object({
    title: z.string(),
    article_id: z.string(),
    organisation_id: z.string(),
    display_rules: z.object({
      hidden: z.boolean(),
      deleted: z.boolean(),
      show_on_main_site: z.boolean()
    }),
    metadata: z.object({
      date_written: z.string(),
      authors: z.array(z.string())
    }),
    canEdit: z.boolean(),
    canDelete: z.boolean()
  }))
});

export type UserResponseType = z.infer<typeof UserSchema>;


export const ArticleSchema = z.object({
  userCanDelete: z.boolean(),
  article: z.object({
    title: z.string(),
    article_id: z.string(),
    organisation_id: z.string(),
    metadata: z.object({
      date_written: z.string(),
      authors: z.array(z.string()),
    }),
    isHidden: z.boolean(),
    content: z.object({
      keywords: z.array(z.string()),
      tags: z.array(z.string()),
      attachments: z.array(z.string()), // array of strings
      landingImage: z.string(),
      content: z.string(),
    }),
  }),
});

export type ArticleType = z.infer<typeof ArticleSchema>;