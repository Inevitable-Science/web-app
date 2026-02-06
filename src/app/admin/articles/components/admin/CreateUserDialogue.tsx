"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  CreateResponseType,
  CreateUserResponseZ,
} from "@/lib/types/AdminArticleTypes";
import { useArticleAuth, useAuthToken, useUser } from "@/store/AdminAuthStore";

export function CreateUserDialogue({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { authToken } = useAuthToken();
  const { silentRevalidateUser, revalidateUser } = useArticleAuth();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isTopLevelAdmin, setIsTopLevelAdmin] = useState(false);

  const [data, setData] = useState<CreateResponseType | null>(null);

  const createUser = async () => {
    try {
      if (!authToken) {
        await revalidateUser();
        return;
      }

      if (!user?.user.isTopLevelAdmin) throw new Error();

      setIsSaving(true);

      const body = {
        user: {
          isTopLevelAdmin,
          organisations: [],
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.log(data);
        toast({
          title: "Error",
          variant: "destructive",
          description: "An Error Occured",
        });
        return;
      }

      const data = await response.json();
      const parsed = CreateUserResponseZ.parse(data);
      setData(parsed);
      await silentRevalidateUser(authToken);

      toast({
        title: "Success",
        description: "User Created",
      });
      return;
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        variant: "destructive",
        description: "An Error Occured",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetModalState = () => {
    setIsTopLevelAdmin(false);
    setIsModalOpen(false);
    setIsSaving(false);
    setData(null);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogTitle>
            Create User
          </DialogTitle>

          {data ? (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <h4>User ID</h4>
                <p className="background-color w-full rounded p-2">
                  {data.userId}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h4>Password</h4>
                <p className="background-color w-full rounded p-2">
                  {data.password}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h4>TOTP Key</h4>
                <p className="background-color w-full rounded p-2 text-sm">
                  {data.mfaKey}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <Button
                onClick={() => setIsTopLevelAdmin((prev) => !prev)}
                className="background-color hover:background-color"
              >
                {isTopLevelAdmin ? (
                  <span className="flex flex-col">
                    Revoke Site Admin
                    <span className="text-muted-foreground text-xs">
                      (Currently Admin)
                    </span>
                  </span>
                ) : (
                  <span className="flex flex-col">
                    Grant Site Admin
                    <span className="text-muted-foreground text-xs">
                      (Currently Not Admin)
                    </span>
                  </span>
                )}
              </Button>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            <Button onClick={resetModalState}>Cancel</Button>

            <Button
              onClick={createUser}
              disabled={isSaving || data !== null}
              variant={"secondary"}
            >
              Create User
            </Button>
          </div>
        </DialogContent>
    </Dialog>
  );
}
