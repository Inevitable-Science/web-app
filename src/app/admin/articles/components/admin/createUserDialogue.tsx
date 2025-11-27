"use client"
import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useArticleAuthContext } from "../../helpers/articleAuthContext";
import { useToast } from "@/components/ui/use-toast";

export function CreateUserDialogue({ children }: { children: React.ReactNode; }) {
  const { user, authToken, silentRevalidateUser } = useArticleAuthContext();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [isTopLevelAdmin, setIsTopLevelAdmin] = useState(false);
 
  const createUser = async () => {
    try {
      if (!user?.user.isTopLevelAdmin) throw new Error();
      if (!walletAddress) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Wallet Address Required"
        });
        return;
      };

      setIsSaving(true);

      const body = {
        user: {
          walletAddress,
          isTopLevelAdmin,
          organisations: [],
        }
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data);
        toast({
          title: "Error",
          variant: "destructive",
          description: "An Error Occured"
        });
        return;
      };

      await silentRevalidateUser();
      resetModalState();

      toast({
        title: "Success",
        description: "User Created"
      });
      return;

    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        variant: "destructive",
        description: "An Error Occured"
      });
    } finally {
      setIsSaving(false);
    };
  };

  const resetModalState = () => {
    setWalletAddress("");
    setIsTopLevelAdmin(false);
    setIsModalOpen(false);
    setIsSaving(false);
  };

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-grey-450 p-6 shadow-lg"
        >
          <Dialog.Title className="text-lg font-semibold">
            Create User
          </Dialog.Title>

          <div className="flex flex-col gap-2 mt-4">
            <input
              type="text"
              className="background-color w-full text-[19px] rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
              placeholder="Wallet Address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />

            <Button
              onClick={() => setIsTopLevelAdmin(prev => !prev)}
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

          <Dialog.Description className="hidden">
          </Dialog.Description>



          <div className="mt-6 flex justify-end space-x-2">
            <Button onClick={resetModalState}>
              Cancel
            </Button>

            <Button onClick={createUser} disabled={isSaving || !walletAddress} variant={"secondary"}>
              Create User
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};