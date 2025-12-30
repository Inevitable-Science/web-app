import { useAdminArticleQuery } from "@/hooks/queries/admin/useFetchAdminArticle";
import {
  useArticleIsHidden,
  useArticleIsShownOnMainSite,
  useAttachments,
  useKeywords,
  useLandingImage,
  useOrganisation,
  useTags,
  useTitle,
} from "@/store/ArticleEditorStore";
import { useEffect } from "react";

export function LoadState() {
  const { data: article, isLoading } = useAdminArticleQuery();

  const { setTitle } = useTitle();
  const { setLandingImage } = useLandingImage();
  const { setOrganisation } = useOrganisation();
  const { setKeywords } = useKeywords();
  const { setTags } = useTags();
  const { setAttachments } = useAttachments();
  const { setArticleIsHidden } = useArticleIsHidden();
  const { setArticleShownOnMainSite } = useArticleIsShownOnMainSite();

  useEffect(() => {
    const initializeEditor = () => {
      if (isLoading) return;

      setLandingImage(article?.content.landingImage || "");
      setKeywords(article?.content.keywords ?? []);
      setTags(article?.content.tags ?? []);
      setTitle(article?.title ?? "");
      setAttachments(article?.content.attachments ?? []);
      setOrganisation(article?.organisation.organisationId ?? "");
      setArticleIsHidden(article?.displayRules.hidden ?? false);
      setArticleShownOnMainSite(article?.displayRules.showOnMainSite ?? true);

      return;
    };

    initializeEditor();
  }, [article, isLoading]);

  return null;
}
