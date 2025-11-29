"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useArticleAuthContext } from "../../helpers/articleAuthContext";
import { CreateResponseType, CreateUserResponseZ } from "../../helpers/types";

export function CreateUserDialogue({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authToken, silentRevalidateUser } = useArticleAuthContext();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isTopLevelAdmin, setIsTopLevelAdmin] = useState(false);

  const [data, setData] = useState<CreateResponseType | null>(null);


  const createUser = async () => {
    try {
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
      await silentRevalidateUser();

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
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">
            Create User
          </Dialog.Title>

          {data ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex flex-col gap-1">
                <h4>User ID</h4>
                <p className="w-full background-color rounded p-2">{data.userId}</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4>Password</h4>
                <p className="w-full background-color rounded p-2">{data.password}</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4>TOTP Key</h4>
                <p className="w-full background-color rounded text-sm p-2">{data.mfaKey}</p>
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
                    <span className="text-xs text-muted-foreground">
                      (Currently Admin)
                    </span>
                  </span>
                ) : (
                  <span className="flex flex-col">
                    Grant Site Admin
                    <span className="text-xs text-muted-foreground">
                      (Currently Not Admin)
                    </span>
                  </span>
                )}
              </Button>
            </div>
          )}

          <Dialog.Description className="hidden"></Dialog.Description>

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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
