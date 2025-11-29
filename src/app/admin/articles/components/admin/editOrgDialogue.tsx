"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";
import { uploadImage } from "../../helpers/uploadHelper";
import {
  AllUsersResponse,
  FetchOrganisationResponse,
  FetchOrganisationResponseZ,
  OrgCreateEditBody,
} from "../../helpers/types";
import { useArticleAuthContext } from "../../helpers/articleAuthContext";
import { CircleUserRound, Loader2, Pencil, X } from "lucide-react";

interface SelectedUser {
  userId: string;
  profilePicture: string;
  username: string;
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

interface SingleUser {
  userId: string;
  profilePicture: string;
  username: string;
}

export function EditOrgDialogue({
  allUsers,
  organisationId,
  children,
}: {
  allUsers: AllUsersResponse;
  organisationId: string;
  children: React.ReactNode;
}) {
  const { user, authToken, silentRevalidateUser } = useArticleAuthContext();
  const { toast } = useToast();

  const [data, setData] = useState<FetchOrganisationResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  const [organisationName, setOrganisationName] = useState("");
  const [orgLogo, setOrgLogo] = useState<string | null>(null);

  const [socialWebsite, setSocialWebsite] = useState("");
  const [socialX, setSocialX] = useState("");
  const [socialDiscord, setSocialDiscord] = useState("");
  const [description, setDescription] = useState("");

  const [orgUsers, setOrgUsers] = useState<SelectedUser[]>([]);
  const [searchUsers, setSearchUsers] = useState<AllUsersResponse>(allUsers);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        if (!isModalOpen) return;

        const userOrg = user?.organisations.find(
          (org) => org.organisationId === organisationId
        );
        if (!user?.user.isTopLevelAdmin && !userOrg?.userPermissions.isAdmin)
          throw new Error();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/organisation/${organisationId}`,
          {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          console.log(data);
          throw new Error();
        }

        const data = await response.json();
        console.log(data);
        const parsed = FetchOrganisationResponseZ.parse(data);
        setData(parsed);

        setOrganisationName(parsed.organisationName);
        setOrgLogo(parsed.metadata.logo || null);
        setDescription(parsed.metadata.description || "");
        setSocialWebsite(parsed.metadata.website || "");
        setSocialX(parsed.metadata.x || "");
        setSocialDiscord(parsed.metadata.discord || "");
        setOrgUsers(parsed.orgUsers || []);
        setIsSaving(false);

        return;
      } catch (err) {
        console.log(err);
        toast({
          title: "Error",
          variant: "destructive",
          description: "An Error Occured Fetching Organisation.",
        });
        setIsModalOpen(false);
      }
    };

    fetchOrg();
  }, [organisationId, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen && data) {
      setData(null);
    }
  }, [isModalOpen]);

  useEffect(() => {
    console.log(orgLogo);
  }, [orgLogo]);

  const uploadOrgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      console.log("uploading");
      const url = await uploadImage(file, "organisation", authToken);

      console.log(url);
      setOrgLogo(url);
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

  const addUserToOrg = (user: SingleUser) => {
    const addUser = {
      ...user,
      isAdmin: false,
      canEdit: false,
      canDelete: false,
      canCreate: false,
    };
    setOrgUsers([...orgUsers, addUser]);
    return;
  };

  const removeUserFromOrg = (userId: string) => {
    const filteredUsers = orgUsers.filter((u) => u.userId !== userId);
    setOrgUsers(filteredUsers);
  };

  const searchUsersQuery = (username: string) => {
    const lowercase = username.toLowerCase();
    const userArray = allUsers.filter((u) =>
      u.username.toLocaleLowerCase().includes(lowercase)
    );
    setSearchUsers(userArray);
  };

  const toggleUserRole = (
    userId: string,
    role: "isAdmin" | "canCreate" | "canDelete" | "canEdit"
  ) => {
    setOrgUsers((prev) =>
      prev.map((user) => {
        if (user.userId !== userId) return user;

        const newValue = !user[role];

        if (role === "isAdmin" && newValue === true) {
          return {
            ...user,
            isAdmin: true,
            canCreate: true,
            canDelete: true,
            canEdit: true,
          };
        }

        if (role !== "isAdmin" && newValue === false) {
          return {
            ...user,
            isAdmin: false,
            [role]: false,
          };
        }

        return {
          ...user,
          [role]: newValue,
        };
      })
    );
  };

  const editOrg = async () => {
    try {
      if (!organisationName) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "An Organisation Name Is Required",
        });
        return;
      }

      const websiteRegex = /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/;
      const discordRegex = /^https:\/\/discord\.gg\/[A-Za-z0-9]+$/;

      if (socialWebsite && !websiteRegex.test(socialWebsite)) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Please Enter A Valid Website (https:// Included)",
        });
        return;
      }

      if (socialDiscord && !discordRegex.test(socialDiscord)) {
        toast({
          title: "Error",
          variant: "destructive",
          description:
            "Please Enter A Valid Discord (https://discord.gg/ Included)",
        });
        return;
      }

      setIsSaving(true);

      const body: OrgCreateEditBody = {
        organisationName,
        users: orgUsers,
        metadata: {
          logo: orgLogo ?? "",
          description,
          website: socialWebsite,
          x: socialX,
          discord: socialDiscord,
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/organisation/edit/${organisationId}`,
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
        throw new Error();
      }

      const data = await response.json();
      console.log(data);
      await silentRevalidateUser();

      resetModalState();
      toast({
        title: "Success",
        description: "Changes Saved",
      });
      return;
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        variant: "destructive",
        description: "An Error Occured",
      });
      return;
    } finally {
      if (!isSaving) return;
      setIsSaving(false);
    }
  };

  const resetModalState = () => {
    setIsModalOpen(false);
    setData(null);
    setOrganisationName("");
    setOrgLogo(null);
    setSocialWebsite("");
    setSocialX("");
    setSocialDiscord("");
    setDescription("");
    setOrgUsers([]);
    setSearchUsers(allUsers);
    setIsSaving(false);
  };

  return (
    <>
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />

          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-grey-450 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Edit Organisation
              </Dialog.Title>

              <Button onClick={resetModalState} variant={"ghost"} size={"icon"}>
                <X />
              </Button>
            </div>

            <Dialog.Description className="hidden"></Dialog.Description>

            {data ? (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className="group relative h-[48px] min-w-[48px] max-w-[48px] overflow-hidden">
                    {orgLogo ? (
                      <Image
                        src={orgLogo}
                        alt="profile picture"
                        className="h-[48px] w-[48px] cursor-pointer rounded-full object-cover"
                        height={200}
                        width={200}
                      />
                    ) : (
                      <CircleUserRound
                        className="cursor-pointer opacity-80"
                        width={48}
                        height={48}
                      />
                    )}

                    <div className="pointer-events-none absolute inset-0 rounded-full bg-black opacity-0 transition-opacity duration-200 group-hover:opacity-50" />
                    <Pencil
                      className="pointer-events-none absolute inset-0 m-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      width={24}
                      height={24}
                      color="white"
                    />
                    <input
                      id="org-edit-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={uploadOrgImage}
                      className="hidden"
                    />
                    <label
                      htmlFor="org-edit-image-upload"
                      className="absolute inset-0 cursor-pointer rounded-full"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      className="background-color h-[28px] w-full rounded-lg border-none p-2 text-[19px] text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                      placeholder="Organisation Name"
                      value={organisationName}
                      onChange={(e) => setOrganisationName(e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="background-color h-[28px] w-full rounded-lg border-none p-2 text-[19px] text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                        placeholder="Website"
                        value={socialWebsite}
                        onChange={(e) => setSocialWebsite(e.target.value)}
                      />
                      <input
                        type="text"
                        className="background-color h-[28px] w-full rounded-lg border-none p-2 text-[19px] text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                        placeholder="X/Twitter @"
                        value={socialX}
                        onChange={(e) => setSocialX(e.target.value)}
                      />
                      <input
                        type="text"
                        className="background-color h-[28px] w-full rounded-lg border-none p-2 text-[19px] text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                        placeholder="Discord URL"
                        value={socialDiscord}
                        onChange={(e) => setSocialDiscord(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <textarea
                  placeholder="Add Description"
                  className="background-color mt-2 h-[90px] w-full resize-none rounded-lg border-none p-2 text-[19px] text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="background-color mt-2 rounded-lg p-3">
                  <h3>Users</h3>

                  <div className="mb-6 mt-2">
                    {orgUsers.length > 0 ? (
                      <>
                        {orgUsers.map((u) => (
                          <div
                            key={u.userId}
                            className="rounded-lg bg-grey-450 p-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {u.profilePicture ? (
                                  <Image
                                    src={u.profilePicture}
                                    className="rounded-full"
                                    alt={"User PFP"}
                                    height={28}
                                    width={28}
                                  />
                                ) : (
                                  <CircleUserRound height={28} width={28} />
                                )}
                                <p>{u.username}</p>
                              </div>

                              <Button
                                onClick={() => removeUserFromOrg(u.userId)}
                                variant={"secondary"}
                                className="h-[28px]"
                              >
                                Remove
                              </Button>
                            </div>

                            <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-2">
                              <div className="flex flex-col gap-0.5">
                                <p className="text-sm">Is Admin</p>
                                <Button
                                  onClick={() =>
                                    toggleUserRole(u.userId, "isAdmin")
                                  }
                                  variant={"secondary"}
                                  className="h-[28px]"
                                >
                                  {u.isAdmin ? "True" : "False"}
                                </Button>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <p className="text-sm">Can Create</p>
                                <Button
                                  onClick={() =>
                                    toggleUserRole(u.userId, "canCreate")
                                  }
                                  variant={"secondary"}
                                  className="h-[28px]"
                                >
                                  {u.canCreate ? "True" : "False"}
                                </Button>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <p className="text-sm">Can Edit</p>
                                <Button
                                  onClick={() =>
                                    toggleUserRole(u.userId, "canEdit")
                                  }
                                  variant={"secondary"}
                                  className="h-[28px]"
                                >
                                  {u.canEdit ? "True" : "False"}
                                </Button>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <p className="text-sm">Can Delete</p>
                                <Button
                                  onClick={() =>
                                    toggleUserRole(u.userId, "canDelete")
                                  }
                                  variant={"secondary"}
                                  className="h-[28px]"
                                >
                                  {u.canDelete ? "True" : "False"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex h-[44px] items-center justify-center">
                        <p className="text-muted-foreground">
                          No Users Selected
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <h3>Add Users</h3>
                    <input
                      type="text"
                      className="h-[28px] w-full max-w-[150px] rounded-lg border-none bg-grey-450 p-2 text-[19px] text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                      placeholder="Search..."
                      onChange={(e) => searchUsersQuery(e.target.value)}
                    />
                  </div>

                  <div className="mt-2 flex flex-col gap-2">
                    {searchUsers.map((u) => (
                      <div
                        key={u.userId}
                        className="flex items-center justify-between rounded-lg bg-grey-450 p-2"
                      >
                        <div className="flex items-center gap-2">
                          {u.profilePicture ? (
                            <Image
                              src={u.profilePicture}
                              className="rounded-full"
                              alt={"User PFP"}
                              height={28}
                              width={28}
                            />
                          ) : (
                            <CircleUserRound height={28} width={28} />
                          )}
                          <p>{u.username}</p>
                        </div>

                        <Button
                          disabled={
                            orgUsers.filter((orgU) => orgU.userId === u.userId)
                              .length === 1
                          }
                          onClick={() => addUserToOrg(u)}
                          variant={"secondary"}
                          className="h-[28px]"
                        >
                          {orgUsers.filter((orgU) => orgU.userId === u.userId)
                            .length === 1
                            ? "Added"
                            : "Add"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 height={32} width={32} className="animate-spin" />
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-2">
              <Button onClick={resetModalState} variant={"ghost"}>
                Cancel
              </Button>

              <Button
                disabled={isSaving}
                onClick={editOrg}
                variant={"secondary"}
              >
                Save Changes
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
