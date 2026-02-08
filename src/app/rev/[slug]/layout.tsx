import { JBProjectProviderRoot } from "@/store/JBProjectProviders";
import { notFound } from "next/navigation";
import { ProjectQuery } from "@/generated/graphql";
import { RevnetDataProvider } from "@/store/RevnetDataContext";
import { headers } from "next/headers";
import { Metadata } from "next";
import { metadata } from "@/lib/metadata";
import { parseSlug, resolveIpfsLogo } from "./ProjectHelpers";
import { fetchDaoData } from "@/lib/helpers/fetchDaoData";
import { fetchTreasuryData } from "@/lib/helpers/fetchTreasuryData";
import { fetchTokenData } from "@/lib/helpers/fetchTokenData";
import { fetchProjectData } from "@/lib/helpers/getProjectBendystraw";
import { Header } from "./components/layout/Header";
import { TabSelectorLG, TabSelectorSM } from "./components/layout/TabSelector";
import { TransactionCard } from "./components/payCard/TransactionCard";
import { OtherDaosCarousel } from "@/components/OtherDaosCarousel";
import { TransportChainIds } from "@/lib/wagmiConfig";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = `/${decodeURIComponent(slug || "")}`;
  const url = new URL(fullPath, origin);

  let config;
  let projectData: ProjectQuery["project"] | null;
  try {
    config = parseSlug(slug);
    projectData = await fetchProjectData(config);
  } catch (err) {
    console.error(err);
    return notFound();
  }

  if (!config || !projectData) {
    return notFound();
  }

  const imgUrl =
    "https://cdn.inevitable.science/static/img/branding/seo_banner.png"; // used as fallback
  const projectLogo = await resolveIpfsLogo(projectData.metadataUri, imgUrl);

  return {
    title: `${projectData.name} | Inevitable Science`,
    description: "Begin your journey. Build the future of life—together.",
    alternates: { canonical: url },
    openGraph: {
      title: `${projectData.name} | Inevitable Science`,
      description: "Begin your journey. Build the future of life—together.",
      siteName: "Inevitable Science",
      images: [
        {
          url: projectLogo,
          width: 800,
          height: 800,
          alt: `${projectData.name} | Inevitable Science preview image`,
        },
      ],
      url,
      type: "website",
    },
    twitter: {
      title: `${projectData.name} | Inevitable Science`,
      description: "Begin your journey. Build the future of life—together.",
      card: "summary_large_image",
      images: [projectLogo],
    },
  };
}

export default async function RevnetPageLayout({ children, params }: Props) {
  const { slug } = await params;

  let config: ReturnType<typeof parseSlug>;
  try {
    config = parseSlug(slug);

    // parseSlug.chainId can return a testnet's chainId
    if (!TransportChainIds.includes(config.chainId)) throw new Error();
  } catch {
    return notFound();
  }

  const project = await fetchProjectData(config);
  if (!slug || !project || !project?.name) {
    return notFound();
  }

  const daoData = await fetchDaoData(project.name);
  const tokenName = daoData?.nativeToken.name;

  const treasuryPromise = daoData
    ? fetchTreasuryData(project.name)
    : Promise.resolve(null);

  const tokenPromise = tokenName
    ? fetchTokenData(tokenName)
    : Promise.resolve(null);

  const [treasuryData, tokenData] = await Promise.all([
    treasuryPromise,
    tokenPromise,
  ]);

  return (
    <JBProjectProviderRoot {...config}>
      <RevnetDataProvider
        projectData={project}
        treasuryAnalytics={treasuryData}
        tokenAnalytics={tokenData}
        slug={decodeURIComponent(slug)}
      >
        <div className="relative w-full">
          <div className="absolute inset-0 -z-10 w-full bg-[url('https://cdn.inevitable.science/static/img/dao_landing.webp')] bg-cover bg-center"></div>
          <Header />
        </div>
        <div className="ctWrapper mb-10 flex flex-wrap gap-8 px-4 pb-5 sm:mb-24 md:flex-nowrap">
          <TabSelectorLG />

          {/* Column 1 */}
          <div className="flex-1">
            <div className="block md:hidden">
              <div className="mt-1 mb-4">
                <TransactionCard />
              </div>
            </div>

            <div className="mx-auto max-w-4xl">
              <section className="mb-10">
                <TabSelectorSM />

                {children}
              </section>
            </div>
          </div>

          <div className="hidden w-full md:block md:w-[340px] lg:w-[400px]">
            <div className="mb-4">
              <TransactionCard />
            </div>
          </div>
        </div>

        <OtherDaosCarousel />
      </RevnetDataProvider>
    </JBProjectProviderRoot>
  );
}
