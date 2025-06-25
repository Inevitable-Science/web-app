import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  return {
    title: "Privacy Policy | Inevitable Protocol", 
    description: metadata.description,
    alternates: {
      canonical: url, 
    },
    openGraph: {
      title: "Privacy Policy | Inevitable Protocol", 
      description: metadata.description, 
      siteName: metadata.siteName, 
      images: [
        {
          url: imgUrl, 
          width: 700,
          height: 370,
          alt: "Inevitable preview image",
        },
      ],
      url: url,
      type: "website",
    },
    twitter: {
      title: "Privacy Policy | Inevitable Protocol",
      description: metadata.description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: metadata.manifest,
    keywords: metadata.keywords, 
  };
}

export default function Privacy() {

  const loremParagraph = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`;

  return (
    <section className="ctWrapper">
      <div className="mt-[128px] mb-[28px] flex flex-col gap-[18px]">
        <h1 className="sm:text-5xl text-3xl font-extralight text-primary">
          Privacy Policy
        </h1>
        
        <p>Updated 1 week ago</p>
      </div>

      <div className="[&_a]:text-light-gold [&_h2]:text-2xl">
        <ol>
          <li>Lorem ipsum dolor sit amet,</li>
          <li>consectetur adipiscing elit,</li>
          <li>sed do eiusmod tempor incididunt</li>
          <li>ut labore et dolore magna aliqua.</li>
        </ol>

        <br/>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation <a href="https://www.link.com">www.link.com</a> laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
          sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>

        <br/>

        <h2>Sub heading</h2>

        <br/>

        <p>{loremParagraph}</p>
        
        <br/>

        <ul>
          <li>m exercitationem ullam corporis</li>
          <li>suscipit laboriosam, nisi ut aliquid ex ea</li>
          <li>commodi consequatur? Quis autem vel</li>
          <li>eum iure reprehenderit qui in ea</li>
        </ul>

        <br/>

        {/* Repeat the lorem paragraph as per the image */}
        <p>{loremParagraph}</p><br/>
        <p>{loremParagraph}</p><br/>
        <p>{loremParagraph}</p>
      </div>

      <style>{`
      ul {
        list-style: disc inside;
      }
      ol {
        list-style: decimal inside;
      }
      `}</style>
    </section>
  );
}