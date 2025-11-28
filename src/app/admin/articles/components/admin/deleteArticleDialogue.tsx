"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { useArticleAuthContext } from "../../helpers/articleAuthContext";

interface ArticleProp {
  articleId: string;
  articleTitle: string;
}

export function DeleteArticleDialogue({
  article,
  organisationId,
  children,
}: {
  article: ArticleProp;
  organisationId: string;
  children: React.ReactNode;
}) {
  const { user, authToken, silentRevalidateUser } = useArticleAuthContext();
  const { toast } = useToast();
  const pathname = usePathname();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const deleteArticle = async () => {
    try {
      const userOrg = user?.organisations.find(
        (org) => org.organisationId === organisationId
      );
      if (!user?.user.isTopLevelAdmin && !userOrg?.userPermissions.canDelete) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "You Cannot Delete This Article",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/article/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            articleId: article.articleId,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.log(data);
        throw new Error();
      }

      const data = await response.json();
      console.log(data);

      if (pathname !== "/admin/articles") {
        window.location.href = "/admin/articles";
        return;
      }

      await silentRevalidateUser();
      setIsModalOpen(false);

      toast({
        title: "Success",
        description: "Article Deleted",
      });
      return;
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Error Deleting Article",
      });
      return;
    }
  };

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

        <Dialog.Content
          //className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg"
        >
          <Dialog.Title className="text-lg font-semibold">
            Confirm Action
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Are you sure you would like to delete
            <span className="text-color font-semibold">
              {" "}
              {article.articleTitle}
            </span>
          </Dialog.Description>

          <div className="mt-6 flex justify-end space-x-2">
            <Dialog.Close asChild>
              <Button className="background-color hover:background-color rounded-md">
                Cancel
              </Button>
            </Dialog.Close>

            <Button onClick={deleteArticle} variant={"destructive"}>
              Delete Article
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
