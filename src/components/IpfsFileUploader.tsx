import { ipfsGatewayUrl } from "@/lib/ipfs";
import axios from "axios";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useMutation } from "wagmi/query";

// todo: archive + remove axios

export type InfuraPinResponse = {
  Hash: string;
};

export const pinFile = async (
  file: File | Blob | string,
  options?: { signal?: AbortSignal }
) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post<InfuraPinResponse>(
    "https://api.juicebox.money/api/ipfs/file",
    formData,
    {
      maxContentLength: Infinity,
      signal: options?.signal,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export function IpfsImageUploader({
  onUploadSuccess,
  disabled = false,
}: {
  onUploadSuccess: (cid: string) => void;
  disabled?: boolean;
}) {
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const ipfsCid = await pinFile(file);
      onUploadSuccess(ipfsCid.Hash);

      return ipfsCid;
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadFile.mutate(file);
  };

  return (
    <div className="mb-5">
      <label
        htmlFor="file_input"
        className="inline-flex h-11 h-9 cursor-pointer items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground ring-offset-white transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:ring-offset-zinc-950 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
      >
        Upload File
      </label>

      <input
        id="file_input"
        type="file"
        className="hidden"
        disabled={disabled || uploadFile.isPending}
        onChange={handleFileChange}
      />
      {uploadFile.isPending && (
        <div className="text-md text-muted-foreground">Uploading...</div>
      )}
      {uploadFile.error && (
        <div className="text-md text-red-500">
          Logo upload failed, try again.
        </div>
      )}
      {uploadFile.data && (
        <div className="mt-3 max-h-[200px] overflow-hidden">
          <Image
            src={ipfsGatewayUrl(uploadFile.data.Hash)}
            className="rounded"
            alt="Uploaded file"
            width={80}
            height={200}
          />
        </div>
      )}
    </div>
  );
}
