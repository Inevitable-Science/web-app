import { useState } from "react";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteArticleDialogue } from "../../../components/admin/DeleteArticleDialogue";
import { ArticleCreateBodyType, ArticleCreateBodyZ, ArticleResponse } from "@/lib/types/AdminArticleTypes";
import { useToast } from "@/components/ui/use-toast";
import { useAuthToken } from "@/store/AdminAuthStore";
import { useArticleIsHidden, useArticleIsShownOnMainSite, useAttachments, useEditorValue, useKeywords, useLandingImage, useOrganisation, useTags, useTitle } from "@/store/ArticleEditorStore";


export function ActionButtonsTable({ article }: { article?: ArticleResponse }) {
  const { toast } = useToast();
  const { authToken } = useAuthToken();

  const { title, setTitle } = useTitle();
  const { editorValue, setEditorValue } = useEditorValue();
  const { landingImage, setLandingImage } = useLandingImage();
  const { organisation, setOrganisation } = useOrganisation();
  const { keywords, setKeywords } = useKeywords();
  const { tags, setTags } = useTags();
  const { attachments, setAttachments } = useAttachments();
  const { articleIsHidden, setArticleIsHidden } = useArticleIsHidden();
  const { articleIsShownOnMainSite, setArticleShownOnMainSite } = useArticleIsShownOnMainSite();


  const [revertButton, setRevertButton] = useState(false);

  const buttonResetState = () => {
    if (!revertButton) {
      setRevertButton(true);
      return;
    }

    resetState();
    setRevertButton(false);
  };

  const resetState = () => {
    setEditorValue(article?.content.content || "");
    setLandingImage(article?.content.landingImage || "");
    setKeywords(article?.content.keywords ?? []);
    setTags(article?.content.tags ?? []);
    setTitle(article?.title ?? "");
    setAttachments(article?.content.attachments ?? []);
    setOrganisation(article?.organisation.organisationId ?? "");
    setArticleIsHidden(article?.displayRules.hidden ?? false);
    setArticleShownOnMainSite(article?.displayRules.showOnMainSite ?? true);
  };

  const saveArticle = async () => {
    try {
      if (!organisation) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Please Select An Organisation",
        });
        return;
      } else if (!title || !editorValue || editorValue === "<p><br></p>") {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Please Add A Title & Content",
        });
        return;
      }

      let endpoint;
      if (article) {
        endpoint = `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/article/edit/${article.articleId}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/article/create`;
      }

      const body: ArticleCreateBodyType = {
        title,
        organisationId: organisation,
        displayRules: {
          hidden: articleIsHidden,
          showOnMainSite: articleIsShownOnMainSite,
        },
        content: {
          keywords,
          tags,
          attachments,
          landingImage,
          content: editorValue,
        },
      };

      const parsed = ArticleCreateBodyZ.parse(body);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data);
        throw new Error();
      }

      const data = await response.json();
      console.log(data);

      toast({
        title: "Success",
        description: "Changes Successfully Saved",
      });
      return;
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Couldn't Save Changes",
      });
      return;
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border-none bg-grey-450 p-2 text-lg font-light">
      {article?.organisation.userPerms.isAdmin && ( // is automatically true if user is a top level admin
        <DeleteArticleDialogue
          article={{
            articleId: article.articleId,
            articleTitle: article.title,
          }}
          organisationId={article.organisation.organisationId}
        >
          <Button className="w-full gap-1" variant="destructive">
            <Trash height={18} width={18} />
            Delete
          </Button>
        </DeleteArticleDialogue>
      )}

      <Button
        onClick={buttonResetState}
        className="w-full"
        variant={"secondary"}
      >
        {revertButton ? "Are You Sure?" : "Revert Changes"}
      </Button>

      <Button
        onClick={saveArticle}
        className="w-full"
        variant={"accent"}
      >
        {article ? "Save" : "Create"}
      </Button>
    </div>
  )
}