import { JBProjectProviderRoot } from "@/store/JBProjectProviders";
import { notFound } from "next/navigation";
import { ProjectQuery } from "@/generated/graphql";
import { RevnetDataProvider } from "@/store/RevnetDataContext";
import { headers } from "next/headers";
import { Metadata } from "next";
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
import { metadata, notFoundMetadata } from "@/lib/metadata";

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
  let projectData: ProjectQuery["project"] | null = null;
  try {
    config = parseSlug(slug); // throws if invalid
    projectData = await fetchProjectData({
      projectId: Number(config.projectId),
      chainId: config.chainId,
      version: config.version
    });
  } catch (err) {
    console.error(err);
  }

  if (!config || !projectData) {
    return notFoundMetadata;
  }

  const imgUrl =
    "https://cdn.inevitable.science/static/img/branding/seo_banner.png"; // used as fallback
  const projectLogo = await resolveIpfsLogo(projectData.metadataUri, imgUrl);

  return {
    title: `${projectData.name} | Inevitable Science`,
    description: metadata.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${projectData.name} | Inevitable Science`,
      description: metadata.description,
      siteName: metadata.siteName,
      images: [
        {
          url: projectLogo,
          width: 800,
          height: 800,
          alt: `Inevitable Science preview image`,
        },
      ],
      url,
      type: "website",
    },
    twitter: {
      title: `${projectData.name} | Inevitable Science`,
      description: metadata.description,
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

    // parseSlug.chainId can return a testnet's chainId - don't want that in prod
    if (!TransportChainIds.includes(config.chainId)) throw new Error();
  } catch (err) {
    return notFound();
  }

  const project = await fetchProjectData({
    projectId: Number(config.projectId),
    chainId: config.chainId,
    version: config.version
  });

  if (!slug || !config || !project) {
    return notFound();
  }

  const daoData = project.name ? await fetchDaoData(project.name) : null;
  const tokenName = daoData?.nativeToken.name;

  const treasuryPromise = (daoData && project.name)
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
