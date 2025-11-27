import z from "zod";

export async function uploadImage(file: File, uploadType: "article" | "profile" | "organisation", authToken: string | null) {
  if (!authToken) throw new Error("AuthToken Required");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`http://localhost:3001/upload/${uploadType}`, {
    method: "POST",
    body: formData,
    headers: {
      authorization: `Bearer ${authToken}`
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const parsedUrl = z.string().parse(data.url);

  return parsedUrl;
}