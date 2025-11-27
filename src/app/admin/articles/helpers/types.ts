/*import z from "zod";

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
    showOnMainSite: z.boolean(),
    content: z.object({
      keywords: z.array(z.string()),
      tags: z.array(z.string()),
      attachments: z.array(z.string()), // array of strings
      landingImage: z.string(),
      content: z.string(),
    }),
  }),
});

export type ArticleType = z.infer<typeof ArticleSchema>;*/

import { C } from "@upstash/redis/zmscore-Cq_Bzgy4";
import z from "zod";

// ---- Auth Rotues ----

export const NonceResponseZ = z.object({
  nonce: z.number(),
});

export const LoginResponseZ = z.object({
  key: z.string(),
});



// ---- User Rotues ----

export const UserMetadataZ = z.object({
  socials: z.object({
    x: z.string(),
    linkedIn: z.string(),
    website: z.string(),
  }),
  username: z.string(),
  profilePicture: z.string(),
});

export const UserZ = z.object({
  //_id: z.string(),
  walletAddress: z.string(),
  userId: z.string(),
  currentNonce: z.number(),
  isTopLevelAdmin: z.boolean(),
  attachments: z.array(z.string()),  // array of strings
  userMetadata: UserMetadataZ,
});

export const OrganisationZ = z.object({
  organisationName: z.string(),
  organisationId: z.string(),
  metadata: z.object({
    logo: z.string(),
    description: z.string(),
    website: z.string(),
    x: z.string(),
    discord: z.string(),
  }),
  userPermissions: z.object({
    isAdmin: z.boolean(),
    canEdit: z.boolean(),
    canDelete: z.boolean(),
    canCreate: z.boolean(),
  })
});

export const PreviewArticleZ = z.object({
  title: z.string(),
  articleId: z.string(),
  organisationId: z.string(),
});

export const UserResponseZ = z.object({
  user: UserZ,
  organisations: z.array(OrganisationZ),
  writtenArticles: z.array(PreviewArticleZ),
  editedArticles: z.array(PreviewArticleZ),
  editableArticles: z.array(PreviewArticleZ),
});

export type ArticlePreview = z.infer<typeof PreviewArticleZ>;

export type Organisation = z.infer<typeof OrganisationZ>;

export type User = z.infer<typeof UserZ>;

export type UserResponseType = z.infer<typeof UserResponseZ>;

// ---- Article Rotues ----


/*
const constructedArticle = {
      metadata: {
        dateWritten: article.metadata.dateWritten,
        author: {
          username: author?.userMetadata.username,
          profilePicture: author?.userMetadata.profilePicture
        },
        editors: editorProfiles
      }
    };
*/

export const ArticleOrgZ = z.object({
  organisationName: z.string(),
  organisationId: z.string(),
  userPerms: z.object({
    isAdmin: z.boolean(),
    canCreate: z.boolean(),
    canEdit: z.boolean(),
    canDelete: z.boolean(),
  }),
});

export const ArticleResponseZ = z.object({
  title: z.string(),
  articleId: z.string(),
  content: z.object({
    keywords: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    attachments: z.array(z.string()).default([]),
    landingImage: z.string().optional(),
    content: z.string(),
  }),
  displayRules: z.object({
    hidden: z.boolean(),
    showOnMainSite: z.boolean(),
  }),
  organisation: ArticleOrgZ,
  metadata: z.object({
    dateWritten: z.string(),
    author: z.object({
      username: z.string(),
      profilePicture: z.string(),
    }),
    editors: z.array(z.object({
      username: z.string(),
      profilePicture: z.string(),
    }))
  }),
});

export type ArticleResponse = z.infer<typeof ArticleResponseZ>;



export const ArticleCreateBodyZ = z.object({
  title: z.string(),
  organisationId: z.string(),
  displayRules: z.object({
    hidden: z.boolean().default(false),
    showOnMainSite: z.boolean().default(true),
  }),
  content: z.object({
    keywords: z.array(z.string()),
    tags: z.array(z.string()),
    attachments: z.array(z.string()),
    landingImage: z.string(),
    content: z.string(),
  }),
});

export type ArticleCreateBodyType = z.infer<typeof ArticleCreateBodyZ>;


export const AllUsersResponseZ = z.array(z.object({
  userId: z.string(),
  username: z.string(),
  profilePicture: z.string(),
}));

export type AllUsersResponse = z.infer<typeof AllUsersResponseZ>;


export const UserPermissionsZ = z.object({
  userId: z.string(),
  isAdmin: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canCreate: z.boolean(),
});

export const OrgCreateEditBodyZ = z.object({
  organisationName: z.string(),
  users: z.array(UserPermissionsZ),
  metadata: z.object({
    logo: z.string(),
    description: z.string(),
    website: z.string().regex(/^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/),
    x: z.string(),
    discord: z.string().regex(/^https:\/\/discord\.gg\/[A-Za-z0-9]+$/),
  }),
});

export type OrgCreateEditBody = z.infer<typeof OrgCreateEditBodyZ>;




// Schema for users inside orgUsers
const OrgUserZ = z.object({
  userId: z.string(),
  username: z.string(),
  profilePicture: z.string(),
  isAdmin: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canCreate: z.boolean(),
});

// Schema for users inside nonOrgUsers
const NonOrgUserZ = z.object({
  userId: z.string(),
  username: z.string(),
  profilePicture: z.string(),
});

// Schema for articles
const ArticleZ = z.object({
  title: z.string(),
  articleId: z.string(),
});

// Main organisation schema
export const FetchOrganisationResponseZ = z.object({
  organisationName: z.string(),
  organisationId: z.string(),
  metadata: z.object({
    logo: z.string(),          // allow empty string
    description: z.string(),
    website: z.string(),
    x: z.string(),
    discord: z.string(),
  }),
  orgUsers: z.array(OrgUserZ),
  nonOrgUsers: z.array(NonOrgUserZ),
  articles: z.array(ArticleZ),
});

export type FetchOrganisationResponse = z.infer<typeof FetchOrganisationResponseZ>;