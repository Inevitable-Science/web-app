import { type FC } from "react";
import DynamicArticleCarousel from "../ArticleCarousel";
import articleSchema, { Article } from "../Articles"; // Adjust path as needed
import { headers } from "next/headers";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    article: string;
  }>;
}

// Generate dynamic metadata based on the article
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  // Find the article by slug
  const article = articleSchema.articles.find((a) =>
    a.title.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "") === params.article
  );

  // Default metadata if article not found
  if (!article) {
    return {
      title: "Article Not Found | Inevitable Protocol",
      description: "The requested article could not be found.",
      alternates: { canonical: `${origin}/articles` },
      openGraph: {
        title: "Article Not Found | Inevitable Protocol",
        description: "The requested article could not be found.",
        siteName: "Inevitable Protocol",
        images: [{ url: `${origin}/assets/img/branding/seo_banner.png`, width: 700, height: 370, alt: "Inevitable preview image" }],
        url: `${origin}/articles`,
        type: "website",
      },
      twitter: {
        title: "Article Not Found | Inevitable Protocol",
        description: "The requested article could not be found.",
        card: "summary_large_image",
        images: [`${origin}/assets/img/branding/seo_banner.png`],
      },
      manifest: "/manifest/manifest.json",
    };
  }

  // Dynamic metadata for the found article
  const fullPath = `/articles/${params.article}`;
  const url = new URL(fullPath, origin);


  const imgUrl = article.image.startsWith("http") ? article.image : `${origin}${article.image}`;


  return {
    title: `${article.title} | Inevitable Protocol`,
    description: article.overview,
    alternates: { canonical: url },
    openGraph: {
      title: `${article.title} | Inevitable Protocol`,
      description: article.overview,
      siteName: "Inevitable Protocol",
      images: [{ url: imgUrl, width: 700, height: 370, alt: `${article.title} preview image` }],
      url,
      type: "article",
    },
    twitter: {
      title: `${article.title} | Inevitable Protocol`,
      description: article.overview,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: "/manifest/manifest.json",
  };
}

const ArticlePage: FC<Props> = async props => {
  const params = await props.params;
  console.log(params.article);

  const article = articleSchema.articles.find((a) =>
    a.title.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "") === params.article
  );

  if (!article) {
    return (
      <div className="text-white text-center h-screen flex items-center justify-center flex-col">
        <div className="flex gap-2 items-center">
          <h1 className="text-5xl font-semibold">404</h1>
          <div className="border-l border-color h-16 w-1" />
          <p>Article Not Found</p>
        </div>

        <style>{`
          footer {
            display: none !important;
          }
        `}</style>
      </div>
    );
  }

  const date = new Date(article.date);
  const relativeDate = (() => {
    const diffMs = new Date().getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "today";
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  })();

  const relatedArticles = articleSchema.articles
    .filter((a) => a !== article && a.category.some((cat) => article.category.includes(cat)))
    .slice(0, 4) // Limit to 4 related articles
    .map((a: Article) => ({
      img: a.image,
      title: a.title,
      description: a.overview,
    }));

  return (
    <div className="ctWrapper">
      <div className="max-w-[960px] mx-auto">
        <div className="mt-28">
          <h1 className="sm:text-5xl text-3xl font-extralight text-primary">
            {article.title}
          </h1>

          <p className="capitalize font-light my-4">
            {article.author} | {relativeDate}
          </p>

          <div className="flex items-center gap-2 max-w-full overflow-x-auto whitespace-nowrap">
            {article.category.map((cat) => (
              <span
                key={cat}
                className="bg-gunmetal focus:outline-none py-[6px] px-[12px] text-sm rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <section>
          <div className="w-full h-auto">
            <img
              className="w-full h-auto my-4 rounded"
              src={article.image}
              alt={`${article.title} image`}
            />
          </div>

          <div className="flex flex-col gap-6 font-light">
            <p className="sm:text-xl">
              {article.overview}
            </p>

            <div
              className="sm:text-xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </section>
      </div>

      <div className="mt-16 sm:mt-24 md:pt-12">
        <DynamicArticleCarousel category="More articles" slides={relatedArticles} />
      </div>
    </div>
  );
};

export default ArticlePage;