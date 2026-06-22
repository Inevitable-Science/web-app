import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const OFAC_ENDPOINT = 'https://api.wewantjusticedao.org/donation/validate';

export const AddressZ = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/);

const OfacResponseZ = z.object({
  isGoodAddress: z.boolean()
});

function returnBadReq(status: number) {
  return NextResponse.json(
    { isGoodAddress: false },
    { status }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }>; }
) {
  try {
    const { address } = await params;
    console.log(address)
    const parsedAddress = AddressZ.safeParse(address);
   
    if (!parsedAddress.success) 
      return returnBadReq(400);

    const res = await fetch(`${OFAC_ENDPOINT}?address=${parsedAddress.data}`);
    if (!res.ok)
      return returnBadReq(502);

    const data = await res.json();

    const parsedResponse = OfacResponseZ.safeParse(data);
    if (!parsedResponse.success)
      return returnBadReq(502);
    
    const { isGoodAddress } =  parsedResponse.data;
    return NextResponse.json(
      { isGoodAddress },
      { headers: { "Cache-Control": "public, max-age=86400" } }     // cache for a day 
    );
  } catch (err) {
    console.error(`[API ERROR] Error in OFAC validation: ${err}`);
    Sentry.captureException(err);
    return returnBadReq(500);
  };
};
