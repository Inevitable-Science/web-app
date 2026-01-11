import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DynamicArticleCarousel } from "../ArticleCarousel";
import { LatestArticlesResponse, LatestArticlesResponseZ, SingleArticleResponse, SingleArticleResponseZ } from "@/lib/types/PublicArticleTypes";

interface ParamsProp {
  params: Promise<{
    article: string;
  }>;
}

const fetchArticle = async (
  articleId: string
): Promise<SingleArticleResponse | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/public/article/id/${articleId}`
    );

    const data = await response.json();
    const parsedData = SingleArticleResponseZ.parse(data);

    return parsedData;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const fetchLatestArticles = async (
  articleId: string
): Promise<LatestArticlesResponse | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/public/articles/latest`
    );

    const data = await response.json();
    const parsedData = LatestArticlesResponseZ.parse(data);
    const filteredArticles = parsedData.filter(a => a.articleId.toLowerCase() !== articleId.toLowerCase());

    return filteredArticles;
  } catch (err) {
    console.error(err);
    return null;
  }
};


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
        images: [
          "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
        ],
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

  return {
    title: `${article.title} | Inevitable Science`,
    description: article.overview,
    alternates: { canonical: url },
    openGraph: {
      title: `${article.title} | Inevitable Science`,
      description: article.overview,
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
      description: article.overview,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: "/manifest/manifest.json",
  };
}

export default async function ArticlePage(props: ParamsProp) {
  const params = await props.params;
  const articleId = params.article;

  const [article, latestArticles] = await Promise.all([
    fetchArticle(articleId),
    fetchLatestArticles(articleId)
  ]);

  if (!article) {
    return notFound();
  }

  const keywords = article.content.keywords
    .map(k => k.trim())
    .filter(k => k.length > 0);

  return (
    <div className="ctWrapper">
      <div className="mx-auto max-w-[960px]">
        <div className="mt-28">
          <h1 className="text-primary text-3xl font-extralight sm:text-5xl">
            {article.title}
          </h1>

          <div className="mt-4 flex items-center gap-2 font-light">
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
              {article.author.username} |{" "}
              {formatDate(article.author.dateWritten, true)}
            </p>
          </div>

          {keywords.length > 0 && (
            <div className="flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap mt-4">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="bg-gunmetal rounded-full px-[12px] py-[6px] text-sm focus:outline-hidden"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
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

      {latestArticles && (
        <div className="mt-16 sm:mt-24 md:pt-12">
          <DynamicArticleCarousel
            category="More articles"
            slides={latestArticles}
          />
        </div>
      )}

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
