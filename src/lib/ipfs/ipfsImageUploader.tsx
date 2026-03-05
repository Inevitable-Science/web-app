"use client";

import { ipfsGatewayUrl } from "@/lib/ipfs/ipfs";
import Image from "next/image";
import React, { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { useMutation } from "wagmi/query";

export type InfuraPinResponse = {
  Hash: string;
};

export const pinFile = async (
  file: File | Blob | string,
  options?: { signal?: AbortSignal }
) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.juicebox.money/api/ipfs/file", {
    method: "POST",
    body: formData,
    signal: options?.signal,
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data: InfuraPinResponse = await res.json();
  return data;
};

export function useIpfsImageUpload({
  onUploadSuccess,
  disabled = false,
}: {
  onUploadSuccess: (cid: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const ipfsCid = await pinFile(file);
      onUploadSuccess(ipfsCid.Hash);
      return ipfsCid;
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    uploadFile.mutate(file);
  };

  const openFilePicker = () => {
    if (!disabled && !uploadFile.isPending) {
      inputRef.current?.click();
    }
  };

  const HiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png"
      className="hidden"
      onChange={handleFileChange}
      disabled={disabled || uploadFile.isPending}
    />
  );

  return {
    HiddenInput,
    openFilePicker,
    isPending: uploadFile.isPending,
    error: uploadFile.error,
    data: uploadFile.data,
  };
}

export function IpfsImageUploader({
  children,
  setCID,
  disabled = false,
  showMessages = false,
  showPreview = false,
}: {
  children: React.ReactElement<{ onClick?: () => void; disabled?: boolean }>;
  setCID: (cid: string) => void;
  disabled?: boolean;
  showMessages?: boolean;
  showPreview?: boolean;
}) {
  const { HiddenInput, openFilePicker, isPending, error, data } =
    useIpfsImageUpload({
      onUploadSuccess: setCID,
      disabled,
    });

  const trigger = React.cloneElement(children, {
    onClick: openFilePicker,
    disabled: disabled || isPending,
  });

  return (
    <div>
      {HiddenInput}
      {trigger}
      {showMessages && isPending && (
        <div className="text-muted-foreground mt-1 text-sm">Uploading...</div>
      )}
      {showMessages && error && (
        <div className="mt-1 text-sm text-red-500">
          Logo upload failed, try again.
        </div>
      )}
      {showPreview && data && (
        <div className="mt-3 overflow-hidden">
          <Image
            src={ipfsGatewayUrl(data.Hash)}
            alt="Uploaded file"
            width={80}
            height={200}
          />
        </div>
      )}
    </div>
  );
}
