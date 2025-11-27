"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Building2, ChevronRight, Trash, Upload } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, } from "@/components/ui/select";

import Editor from "./editor";
import { DeleteArticleDialogue } from "../../components/admin/deleteArticleDialogue";
import { ArticleCreateBodyType, ArticleCreateBodyZ, ArticleResponse, Organisation } from "../../helpers/types";
import { useArticleAuthContext } from "../../helpers/articleAuthContext";
import { uploadImage } from "../../helpers/uploadHelper";


interface DisplayRules {
  hidden: boolean;
  onMainSite: boolean;
}

export function ArticleEditor({ article }: { article?: ArticleResponse; }) {
  const { authToken, user } = useArticleAuthContext();
  const { toast } = useToast();

  // Hooks first
  const [editorValue, setEditorValue] = useState(article?.content.content || "");
  const [landingImage, setLandingImage] = useState(article?.content.landingImage || "");
  const [keywords, setKeywords] = useState<string[]>(article?.content.keywords ?? []);
  const [tags, setTags] = useState<string[]>(article?.content.tags ?? []);
  const [attachments, setAttachments] = useState<string[]>(article?.content.attachments ?? []);
  const [title, setTitle] = useState<string>(article?.title ?? "");
  const [displayRules, setDisplayRules] = useState<DisplayRules>({
    hidden: article?.displayRules.hidden ?? false,
    onMainSite: article?.displayRules.showOnMainSite ?? true,
  });

  const [saveState, setSaveState] = useState<boolean>(false);
  const [revertButton, setRevertButton] = useState(false);

  // You can set initial organisation based on derived value
  const defaultUserOrg = user?.organisations.find(
    org => org.organisationId === article?.organisation.organisationId
  );
  const [organisation, setOrganisation] = useState<Organisation | null>(defaultUserOrg || null);

  const landingImgInputRef = useRef<HTMLInputElement>(null);

  // Derived values
  const userCanCreateOrg = user?.organisations.filter(
    org => org.userPermissions.canCreate || org.userPermissions.isAdmin
  ) ?? [];

  const arraysAreEqual = (a: any[], b: any[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

  useEffect(() => {
    if (!article) {
      setSaveState(
        (editorValue !== "" && editorValue !== "<p><br></p>") ||
        keywords.length > 0 ||
        tags.length > 0 ||
        title !== "" ||
        attachments.length > 0 ||
        displayRules.hidden !== false ||
        displayRules.onMainSite !== true
      );
      return;
    }

    const contentChanged =
      article.content.content !== editorValue ||
      !arraysAreEqual(article.content.keywords, keywords) ||
      !arraysAreEqual(article.content.tags, tags) ||
      !arraysAreEqual(article.content.attachments, attachments) ||
      article.title !== title ||
      article.displayRules.hidden !== displayRules.hidden ||
      article.displayRules.showOnMainSite !== displayRules.onMainSite;

    setSaveState(contentChanged);
  }, [editorValue, keywords, tags, attachments, title, displayRules, article]);

  // Conditional rendering or early return
  if (!authToken || !user) return null;

  const handleLandingImgClick = () => {
    landingImgInputRef.current?.click();
  };

  const buttonResetState = () => {
    if (!revertButton) {
      setRevertButton(true);
      return;
    };
    
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
    setOrganisation(null); // or set to a default org if needed
    setDisplayRules({
      hidden: article?.displayRules.hidden ?? false,
      onMainSite: article?.displayRules.showOnMainSite ?? true,
    });
  };


  const editDisplayRules = (
    rule: "hidden" | "onMainSite" | "organisation",
    value: boolean | string,
  ) => {
    setDisplayRules(prev => ({
      ...prev,
      [rule]: value,
    }));
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
    };
  };


  const saveArticle = async () => {
    try {
      if (!organisation) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Please Select An Organisation"
        });
        return;
      } else if (
        !title ||
        (!editorValue || editorValue === "<p><br></p>")
      ) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Please Add A Title & Content"
        });
        return;
      };

      let endpoint;
      if (article) {
        endpoint = `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/article/edit/${article.articleId}`;
      } else {
        endpoint = `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/article/create`;
      };

      const body: ArticleCreateBodyType = {
        title,
        organisationId: organisation.organisationId,
        displayRules: {
          hidden: displayRules.hidden,
          showOnMainSite: displayRules.onMainSite,
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
          authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data);
        throw new Error();
      };

      const data = await response.json();
      console.log(data);

      toast({
        title: "Success",
        description: "Changes Successfully Saved"
      });
      return;

    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Couldn't Save Changes"
      });
      return;
    }
  };


  const hasKeywordEmpty = keywords.find(keyword => keyword === "");
  const hasTagEmpty = tags.find(tag => tag === "");

  return (
    <>
    <div className="absolute h-screen w-screen top-0 left-0 z-90 cursor-wait hidden" /> {/* Toggle during image upload or article save */}
    
    <div className="ctWrapper">
      <div className="flex items-center gap-1 mt-28 mb-4 text-md text-muted-foreground font-light">
        <Link href="/admin/articles" className="flex items-start border-b border-transparent hover:border-[var(--text-muted-foreground)] leading-[18px]">
          Admin Articles
          <ArrowUpRight height={14} width={14} />
        </Link>
        <ChevronRight height={18} width={18} />
        <p>Editor</p>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-2 w-full">
          <input
            type="text"
            className="bg-grey-450 w-full rounded-lg border-none p-2 text-lg font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full w-full"> {/* Review this skewing the screen */}
              {article && (
                <div className="flex w-max flex-col gap-1 mb-2 bg-grey-450 rounded-lg p-2 font-light">
                  <p className="text-xs">Written By</p>
                  <div className="flex items-center gap-1">
                    {article.metadata.author.profilePicture && (
                      <Image
                        src={article.metadata.author.profilePicture}
                        alt={`Org Logo`}
                        width={18}
                        height={18}
                        className="min-w-[18px] min-h-[18px] shrink-0 rounded-full"
                      />
                    )}
                    <p className="text-sm">
                      {article?.metadata.author.username}
                    </p>
                  </div>
                </div>
              )}

              {(article?.metadata.editors?.length ?? 0) > 0 && (
                <div className="flex w-max flex-col gap-1 bg-grey-450 rounded-lg p-2 font-light">
                  <p className="text-xs">Edited By</p>
                  {article?.metadata.editors.map(editor => (
                    <div className="flex items-center gap-1">
                      {editor.profilePicture && (
                        <Image
                          src={editor.profilePicture}
                          alt={`Org Logo`}
                          width={18}
                          height={18}
                          className="min-w-[24px] min-h-[24px] shrink-0 rounded-full"
                        />
                      )}
                      <p>
                        {editor.username}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Editor
              editorValue={editorValue}
              setEditorValue={setEditorValue}
              attachments={attachments}
              setAttachments={setAttachments}
              authToken={authToken}
            />
          </div>
        </div>

        <div className="flex flex-col w-[320px] gap-2">
          <div className="flex flex-col gap-2 bg-grey-450 w-full rounded-lg border-none p-2 font-light">
            <h4>{landingImage && "Current "}Landing Image</h4>

            {landingImage && (
              <Image width={320} height={280} src={landingImage} alt="Landing Image" />
            )}

            <Button onClick={handleLandingImgClick} className="background-color flex items-center gap-2 hover:background-color">
              Upload Landing Image
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

          <div className="flex flex-col gap-2 bg-grey-450 w-full rounded-lg border-none p-2 font-light">
            <h4>Organisation</h4>

            <Select
              onValueChange={(orgId) => {
                const org = user.organisations.find(org => org.organisationId === orgId);
                setOrganisation(org || null);
              }}
            >
              <SelectTrigger
                className="text-color border-none background-color rounded-lg px-3 py-1"
                aria-label="Select Organisation"
              >
                {organisation ? (
                  <div className="flex select-none items-center font-light">
                    <div className="mr-1 flex items-end">
                      <div className="h-fit w-fit rounded-full border-[1.5px] border-grey-450 bg-grey-450 shadow-md">
                        {organisation.metadata.logo ? (
                        <Image
                          src={organisation.metadata.logo}
                          alt={`Org Logo`}
                          width={18}
                          height={18}
                          className="min-w-[24px] min-h-[24px] shrink-0 rounded-full"
                        />
                      ) : (
                        <Building2 width={18} height={18} />
                      )}
                      </div>
                    </div>
                    <p className="mr-1">{organisation.organisationName}</p>
                  </div>
                ) : (
                  <span>Select Organisation</span>
                )}
              </SelectTrigger>
              <SelectContent align="end">
                {userCanCreateOrg.map((org) => {
                  return (
                    <SelectItem
                      key={org.organisationId}
                      value={org.organisationId}
                      className="[&>span]:flex [&>span]:items-center"
                    >
                      {org.metadata.logo ? (
                        <Image
                          src={org.metadata.logo}
                          alt={`Org Logo`}
                          width={24}
                          height={24}
                          className="min-w-[24px] min-h-[24px] shrink-0 rounded-full"
                        />
                      ) : (
                        <Building2 width={18} height={18} />
                      )}
                      <span className="ml-2 grow">{org.organisationName}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

          </div>

          <div className="flex flex-col gap-2 bg-grey-450 w-full rounded-lg border-none p-2 font-light">
            <h4 className="">Display Rules</h4>
            <Button
              onClick={() => editDisplayRules("hidden", !displayRules.hidden)}
              className="background-color hover:background-color"
            >
              {displayRules.hidden ? (
                <span className="flex flex-col">
                  Show Article
                  <span className="text-xs text-muted-foreground">
                    (Currently Hidden)
                  </span>
                </span>
              ) : (
                <span className="flex flex-col">
                  Hide Article
                  <span className="text-xs text-muted-foreground">
                    (Currently Visible)
                  </span>
                </span>
              )}
            </Button>

            <Button
              onClick={() => editDisplayRules("onMainSite", !displayRules.onMainSite)}
              className="background-color hover:background-color"
            >
              {displayRules.onMainSite ? (
                <span className="flex flex-col">
                  Hide On Inev Site
                  <span className="text-xs text-muted-foreground">
                    (Currently Visible)
                  </span>
                </span>
              ) : (
                <span className="flex flex-col">
                  Show On Inev Site
                  <span className="text-xs text-muted-foreground">
                    (Currently Hidden)
                  </span>
                </span>
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-2 bg-grey-450 w-full rounded-lg border-none p-2 font-light">
            <h4>Keywords</h4>
            {keywords.map((keyword, index) => (
              <input
                key={index}
                className="background-color w-full rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                type="text"
                placeholder={`Keyword ${index + 1}`}
                value={keyword}
                onChange={(e) =>
                  setKeywords((prev) => {
                    const newKeywords = [...prev];
                    newKeywords[index] = e.target.value;
                    return newKeywords;
                  })
                }
              />
            ))}
            <Button 
              className="background-color hover:background-color"
              onClick={() => setKeywords((prev) => [...prev, ""])} disabled={hasKeywordEmpty !== undefined || keywords.length >= 4}
            >
              Add Keyword
            </Button>
          </div>

          <div className="flex flex-col gap-2 bg-grey-450 w-full rounded-lg border-none p-2 font-light">
            <h4>Tags</h4>
            {tags.map((tag, index) => (
              <input
                key={index}
                className="background-color w-full rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                type="text"
                placeholder={`Tag ${index + 1}`}
                value={tag}
                onChange={(e) =>
                  setTags((prev) => {
                    const newTags = [...prev];
                    newTags[index] = e.target.value;
                    return newTags;
                  })
                }
              />
            ))}
            <Button 
              className="background-color hover:background-color"
              onClick={() => setTags((prev) => [...prev, ""])} disabled={hasTagEmpty !== undefined || tags.length >= 3} 
            >
              Add Tag
            </Button>
          </div>

          <div className="flex flex-col gap-2 bg-grey-450 w-full rounded-lg border-none p-2 text-lg font-light">
            {article?.organisation.userPerms.isAdmin && // is automatically true if user is a top level admin
              <DeleteArticleDialogue article={{ articleId: article.articleId, articleTitle: article.title }} organisationId={article.organisation.organisationId}>
                <Button className="w-full gap-1" variant="destructive">
                  <Trash height={18} width={18} />
                  Delete
                </Button>
              </DeleteArticleDialogue>
            }

            <Button onClick={buttonResetState} className="w-full" variant={"secondary"} disabled={!saveState}>
              {revertButton ? "Are You Sure?" : "Revert Changes"}
            </Button>
            
            <Button onClick={saveArticle} className="w-full" variant={"accent"} disabled={!saveState}>
              {article ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}