import { useFormikContext } from "formik";
import { useState, useEffect } from "react";
import { RevnetFormData } from "../types";
import { FieldGroup } from "./Fields";
import { IpfsImageUploader } from "@/components/IpfsFileUploader";
import { ipfsUri } from "@/lib/ipfs";

export function DetailsPage({
  disabled = false
}: {
  disabled?: boolean
}) {
  const { setFieldValue } =
    useFormikContext<RevnetFormData>();

  const [tokenSymbol, setTokenSymbol] = useState("TOKEN");

  // Set Formik field value on component mount
  useEffect(() => {
    setFieldValue("tokenSymbol", tokenSymbol);
  }, [setFieldValue, tokenSymbol]);

  return (
    <>
      <h1 className="mb-2 text-3xl md:col-span-3 font-semibold">
        Design and deploy a fundraise
      </h1>
      <div className="md:col-span-1">
        <h2 className="font-bold text-lg mb-2">1. Look</h2>
      </div>
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr] sm:gap-6">
          <FieldGroup id="name" placeholder="Project Name" name="name" label="Name" disabled={disabled} />
          <FieldGroup
            id="tokenSymbol"
            name="tokenSymbol"
            label="Ticker"
            value={tokenSymbol}
            onChange={(e: any) => {
              setTokenSymbol(e.target.value);
              setFieldValue("tokenSymbol", e.target.value);
            }} // Updates state
            prefix="$"
            disabled={disabled}
          />
          <div>
            <label
              className="block mb-1 text-md font-semibold dark:text-white"
              htmlFor="file_input"
            >
              Logo
            </label>
            <IpfsImageUploader
              onUploadSuccess={(cid) => {
                setFieldValue("logoUri", ipfsUri(cid));
              }}
              disabled={disabled}
            />
          </div>
        </div>
        <FieldGroup
          id="description"
          name="description"
          label="About"
          component="textarea"
          rows={4}
          className="max-w-lg resize-none"
          placeholder="What is the gist?"
          disabled={disabled}
        />
      </div>
    </>
  );
}
