import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import z from "zod";

interface ParamsProp {
  params: Promise<{
    article: string;
  }>
}

const fetchArticle = async (articleId: string): Promise<ArticleResponse | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/public/article/id/${articleId}`);
    
    const data = await response.json();
    const parsedData = ArticleResponseZ.parse(data);

    return parsedData;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export function htmlToText(html: string): string {
  let text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Optional: normalize multiple newlines/spaces
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  
  return text;
}

function sliceToWord(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;

  return text
    .slice(0, maxLength)
    .replace(/\s+\S*$/, "") // remove partial word at the end
    .trim();
}

// Generate dynamic metadata based on the article
export async function generateMetadata(props: ParamsProp): Promise<Metadata> {
  const params = await props.params;
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  // Find the article by slug
  const article = await fetchArticle(params.article);

  // Default metadata if article not found
  if (!article) {
    return {
      title: "Article Not Found | Inevitable Science",
      description: "The requested article could not be found.",
      alternates: { canonical: `${origin}/articles` },
      openGraph: {
        title: "Article Not Found | Inevitable Science",
        description: "The requested article could not be found.",
        siteName: "Inevitable Science",
        images: [
          {
            url: "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
            width: 700,
            height: 370,
            alt: "Inevitable preview image",
          },
        ],
        url: `${origin}/articles`,
        type: "website",
      },
      twitter: {
        title: "Article Not Found | Inevitable Science",
        description: "The requested article could not be found.",
        card: "summary_large_image",
        images: ["https://cdn.inevitable.science/static/img/branding/seo_banner.png"],
      },
      manifest: "/manifest/manifest.json",
    };
  }

  // Dynamic metadata for the found article
  const fullPath = `/articles/${params.article}`;
  const url = new URL(fullPath, origin);

  const imgUrl = article.content.landingImage
    ? article.content.landingImage
    : "https://cdn.inevitable.science/static/img/branding/seo_banner.png";

  const overview = `${sliceToWord(
    htmlToText(article.content.content),
    130
  )}...`;

  return {
    title: `${article.title} | Inevitable Science`,
    description: overview,
    alternates: { canonical: url },
    openGraph: {
      title: `${article.title} | Inevitable Science`,
      description: overview,
      siteName: "Inevitable Science",
      images: [
        {
          url: imgUrl,
          width: 700,
          height: 370,
          alt: `${article.title} preview image`,
        },
      ],
      url,
      type: "article",
    },
    twitter: {
      title: `${article.title} | Inevitable Science`,
      description: overview,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: "/manifest/manifest.json",
  };
}

const ArticleResponseZ = z.object({
  title: z.string(),
  content: z.object({
    keywords: z.array(z.string()),
    tags: z.array(z.string()),
    landingImage: z.string().nullable(),
    content: z.string()
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

type ArticleResponse = z.infer<typeof ArticleResponseZ>;

export default async function ArticlePage(props: ParamsProp) {
  const params = await props.params;
  const articleId = params.article;

  const article = await fetchArticle(articleId);

  if (!article) {
    return notFound();
  };

  return (
     <div className="ctWrapper">
      <div className="mx-auto max-w-[960px]">
        <div className="mt-28">
          <h1 className="text-3xl font-extralight text-primary sm:text-5xl">
            {article.title}
          </h1>

          <div className="flex font-light my-4 gap-2 items-center">
              {article.author.profilePicture && (
                <Image
                  className="rounded-full"
                  src={article.author.profilePicture}
                  alt="Author Profile Picture"
                  height={24}
                  width={24}
                />
              )}
            
            <p>
              {article.author.username} | {formatDate(article.author.dateWritten, true)}
             </p>
          </div>

          <div className="flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap">
            {article.content.keywords.map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-gunmetal px-[12px] py-[6px] text-sm focus:outline-hidden"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <section>
          {article.content.landingImage && (
            <div className="h-auto w-full">
              <img
                className="my-4 h-auto w-full rounded"
                src={article.content.landingImage}
                alt={`${article.title} image`}
              />
            </div>
          )}

          <div className="flex flex-col gap-6 font-light">
            <div
              className="articleParent"
              dangerouslySetInnerHTML={{ __html: article.content.content }}
            />
          </div>
        </section>
      </div>

      <div className="mt-16 sm:mt-24 md:pt-12">
        {/*<DynamicArticleCarousel
          category="More articles"
          slides={relatedArticles}
        />*/}
      </div>

      <style>{`
        .articleParent p {
          font-size: 18px;
        }

        .articleParent h1 {
          font-size: 30px;
        }

        .articleParent h2 {
          font-size: 24px;
        }

        .articleParent h3 {
          font-size: 20px;
        }

        .articleParent h4 {
          font-size: 16px;
        }

        .articleParent a {
          text-decoration: underline;
          color: var(--cerulean);
          font-weight: 400;
        }

        .articleParent img {
          border-radius: 8px;
        }

        .articleParent ol [data-list="ordered"] {
          list-style: decimal;
          padding-left: 0.5em;
          margin-left: 1.5em;
        }

        .articleParent ol [data-list="bullet"] {
          list-style: disc;
          padding-left: 0.5em;
          margin-left: 1.5em;
        }

        .articleParent strong {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}