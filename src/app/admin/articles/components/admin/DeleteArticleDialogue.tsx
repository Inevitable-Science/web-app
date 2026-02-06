"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useArticleAuth, useAuthToken, useUser } from "@/store/AdminAuthStore";

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
  const { user } = useUser();
  const { authToken } = useAuthToken();
  const { silentRevalidateUser, revalidateUser } = useArticleAuth();
  const { toast } = useToast();
  const pathname = usePathname();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const deleteArticle = async () => {
    try {
      if (!authToken) {
        await revalidateUser();
        return;
      }

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

      await silentRevalidateUser(authToken);
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
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogTitle>
            Confirm Action
          </DialogTitle>
          <DialogDescription>
            Are you sure you would like to delete
            <span className="text-color font-semibold">
              {" "}
              {article.articleTitle}
            </span>
          </DialogDescription>

          <div className="mt-6 flex justify-end space-x-2">
            <DialogClose />

            <Button onClick={deleteArticle} variant={"destructive"}>
              Delete Article
            </Button>
          </div>
        </DialogContent>
    </Dialog>
  );
}
