import {
  TokenResponseSchema,
  TreasuryResponseSchema
} from "@/lib/types/AnalyticTypes";
import { Providers } from "./Providers";
import { IvxPageDataProvider } from "./DataProvider";
import { JBChainId } from "juice-sdk-react";
import { notFound } from "next/navigation";
import MainIvxLayout from "./components/Main";

async function fetchIvxData(){
  try {
    const [tokenRes, treasuryRes] = await Promise.all([
      fetch(`https://inev.profiler.bio/token/hydra`),
      fetch(`https://inev.profiler.bio/treasury/hydra`),
    ]);

    if (!tokenRes.ok || !treasuryRes.ok) {
      throw new Error("Unable to fetch data");
    }

    const [tokenData, treasuryData] = await Promise.all([
      tokenRes.json(),
      treasuryRes.json()
    ])

    return({
      tokenData: TokenResponseSchema.parse(tokenData),
      treasuryData: TreasuryResponseSchema.parse(treasuryData)
    });
  } catch (err) {
    console.log(err);
    return null;
  }
}

// export const revalidate = 300;

export default async function IvxTokenPage() {

  const pageData = await fetchIvxData();
  if (!pageData) return notFound();

  return (
    <>
      <Providers chainId={1 as JBChainId} projectId={64n as bigint} version={4}>
        <IvxPageDataProvider tokenData={pageData.tokenData} treasuryData={pageData.treasuryData}>
          <MainIvxLayout />
        </IvxPageDataProvider>
      </Providers>
      {/*<pre>
        {JSON.stringify(pageData, null, 2)}
      </pre>*/}
    </>
  );
}