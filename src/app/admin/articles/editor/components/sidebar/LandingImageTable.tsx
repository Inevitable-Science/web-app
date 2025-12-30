import { useRef } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAttachments, useLandingImage } from "@/store/ArticleEditorStore"
import { uploadImage } from "../../../UploadHelper";
import { useArticleAuth, useAuthToken } from "@/store/AdminAuthStore";


export function LandingImageTable() {
  const { authToken } = useAuthToken();
  const { revalidateUser } = useArticleAuth();
  const { landingImage, setLandingImage } = useLandingImage();
  const { attachments, setAttachments } = useAttachments();
  const { toast } = useToast();

  const landingImgInputRef = useRef<HTMLInputElement>(null);

  const handleLandingImgClick = () => {
    landingImgInputRef.current?.click();
  };

  const uploadLandingImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];

      // Optional: Only accept images
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select an image file",
        });
        return;
      }

      if (!authToken) {
        revalidateUser();
        throw new Error();
      };

      const url = await uploadImage(file, "profile", authToken);

      setLandingImage(url);
      setAttachments([...attachments, url]);
      return;
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error Uploading File",
      });
      return;
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border-none bg-grey-450 p-2 font-light">
      <h4>{landingImage && "Current "}Landing Image</h4>

      {landingImage && (
        <Image
          width={320}
          height={280}
          src={landingImage}
          alt="Landing Image"
        />
      )}

      <Button
        onClick={handleLandingImgClick}
        className={`background-color hover:background-color flex items-center gap-2 ${landingImage && 'text-xs'}`}
      >
        Upload {landingImage && "New "}Landing Image
        <Upload height={16} width={16} />
      </Button>

      <input
        ref={landingImgInputRef}
        type="file"
        accept="image/*"
        onChange={uploadLandingImage}
        className="hidden"
      />
    </div>
  )
}