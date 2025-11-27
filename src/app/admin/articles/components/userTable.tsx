import { Button } from "@/components/ui/button";
import { Check, CircleUserRound, Crown, Link, Pencil, X } from "lucide-react";
import Image from "next/image";
import { User } from "../helpers/types";
import { useEffect, useState } from "react";
import { uploadImage } from "../helpers/helpers";
import { useArticleAuthContext } from "../helpers/articleAuthContext";
import { useToast } from "@/components/ui/use-toast";


export function UserTable() {

  const { user: data, authToken, silentRevalidateUser } = useArticleAuthContext();
  if (!data) return;
  const user = data.user;

  const { toast } = useToast();


  const [editingValue, setEditingValue] = useState("");

  const [username, setUsername] = useState(user.userMetadata.username);
  const [profilePicture, setProfilePicture] = useState(user.userMetadata.profilePicture);

  const [socialX, setSocialX] = useState(user.userMetadata.socials.x);
  const [socialLinkedIn, setSocialLinkedIn] = useState(user.userMetadata.socials.linkedIn);
  const [socialWebsite, setSocialWebsite] = useState(user.userMetadata.socials.website);

  const [saveState, setSaveState] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profilePicture) {
      checkState();
    }
  }, [profilePicture]);

  useEffect(() => {
    if (isSaving === false) {
      checkState();
      return;
    };

    return;
  }, [isSaving]);

  function resetValues() {
    setUsername(user.userMetadata.username);
    setProfilePicture(user.userMetadata.profilePicture);

    setSocialX(user.userMetadata.socials.x);
    setSocialLinkedIn(user.userMetadata.socials.linkedIn);
    setSocialWebsite(user.userMetadata.socials.website);

    setSaveState(false);
  }

  function checkState() {
    if (
      username !== user.userMetadata.username ||
      profilePicture !== user.userMetadata.profilePicture ||
      socialX !== user.userMetadata.socials.x ||
      socialLinkedIn !== user.userMetadata.socials.linkedIn ||
      socialWebsite !== user.userMetadata.socials.website
    ) {
      setSaveState(true);
    } else {
      setSaveState(false);
    }

    setEditingValue("");
  };

  function resetUserState(field: string) {
    switch (field) {
      case "username":
        setUsername(user.userMetadata.username);
        break;
      case "profilePicture":
        setProfilePicture(user.userMetadata.profilePicture);
        break;
      case "twitter":
        setSocialX(user.userMetadata.socials.x);
        break;
      case "linkedIn":
        setSocialLinkedIn(user.userMetadata.socials.linkedIn);
        break;
      case "website":
        setSocialWebsite(user.userMetadata.socials.website);
        break;
      default:
        console.warn(`Unknown field: ${field}`);
    };
    setEditingValue("");
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setProfilePicture(url);
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

  const saveChanges = async () => {
    try {
      if (!saveState) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please Make Changes Before Trying To Save",
        });
        return;
      };
      
      if (username.length < 5) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Username Must Be >5 Characters",
        });
        return;
      };
      
      const websiteRegexQuery = /^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,24}\/?$/;
      if (socialWebsite && !websiteRegexQuery.test(socialWebsite)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please Enter Full Personal Website URL (Including https://)",
        });
        return;
      };

      setIsSaving(true);

      const reqBody = JSON.stringify({
        username,
        profilePicture,
        socials: {
          x: socialX,
          linkedIn: socialLinkedIn,
          website: socialWebsite,
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`
        },
        body: reqBody
      });

      if (!response.ok) throw new Error();

      await silentRevalidateUser();

      toast({
        title: "Success",
        description: "Changes Successfully Saved",
      });
      return;

    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Couldn't Save Your Changes",
      });
      return;
    } finally {
      setIsSaving(false);
    };
  };


  return (
    <div className="flex flex-col gap-[12px] bg-grey-450 p-[12px] rounded-2xl">
      <div className="flex items-center justify-between gap-4 background-color rounded-xl p-[16px]">
        <div className="flex items-center gap-4">
          <div className="relative group w-[48px] h-[48px]">
            {profilePicture ? (
              <Image
                src={profilePicture}
                alt="profile picture"
                className="max-h-[48px] max-w-[48px] rounded-full cursor-pointer"
                height={48}
                width={48}
              />
            ) : (
              <CircleUserRound
                className="opacity-80 cursor-pointer"
                width={48}
                height={48}
              />
            )}

            <div
              className="
                absolute inset-0 rounded-full
                bg-black opacity-0 group-hover:opacity-60
                transition-opacity duration-200
                pointer-events-none
              "
            />
            <Pencil
              className="
                absolute inset-0 m-auto
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                pointer-events-none
              "
              width={24}
              height={24}
              color="white"
            />
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="profile-image-upload"
              className="absolute inset-0 cursor-pointer rounded-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {user?.isTopLevelAdmin && <Crown height={22} width={22} />}
              
              {editingValue === "username" ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    className="bg-grey-450 w-full h-[28px] text-[19px] rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                    placeholder="@..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  <div className="flex items-center bg-grey-450 h-[28px] rounded-lg p-1">
                    <Button
                      className="h-[28px] w-[28px] opacity-70 hover:opacity-100"
                      onClick={() => resetUserState("username")}
                      variant="ghost"
                      size="icon"
                    >
                      <X height={18} width={18} />
                    </Button>
                    <div className="h-full border-l border-color" />
                    <Button 
                      className="h-[28px] w-[28px] opacity-70 hover:opacity-100"
                      onClick={checkState}
                      variant="ghost"
                      size="icon"
                    >
                      <Check height={18} width={18} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <h3 className="text-xl">{username}</h3>
                  <Button 
                    className="h-7 w-7 p-1 opacity-50 hover:opacity-100"
                    onClick={() => setEditingValue("username")}
                    variant="ghost"
                  >
                    <Pencil height={14} width={14} />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user?.userId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveState && (
            <Button onClick={resetValues}>
              Reset
            </Button>
          )}
          <Button onClick={saveChanges} variant={"accent"} disabled={!saveState || isSaving || editingValue !== ""}>
            Save Changes
          </Button>
        </div>
      </div>


      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
        <div className="flex items-center gap-4 background-color rounded-xl p-[16px]">
          <Image src="/assets/img/logo/socials/x.svg" alt="X Logo" height={24} width={24} />
          <div className="flex flex-col gap-1">
            <p className="font-light text-muted-foreground uppercase">X/Twitter Handle</p>
            {editingValue === "twitter" ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  className="bg-grey-450 w-full h-[32px] rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                  placeholder="@..."
                  value={socialX}
                  onChange={(e) => setSocialX(e.target.value)}
                />

                <div className="flex items-center bg-grey-450 h-[32px] rounded-lg p-1">
                  <Button
                    className="h-[32px] w-[32px] opacity-70 hover:opacity-100"
                    onClick={() => resetUserState("twitter")}
                    variant="ghost"
                    size="icon"
                  >
                    <X height={18} width={18} />
                  </Button>
                  <div className="h-full border-l border-color" />
                  <Button
                    className="h-[32px] w-[32px] opacity-70 hover:opacity-100"
                    onClick={checkState}
                    variant="ghost"
                    size="icon"
                  >
                    <Check height={18} width={18} />
                  </Button>
                </div>
              </div>
            ) : (
              <>
              {socialX ? (
                <div className="flex items-center gap-1">
                  <h4 className="max-w-[155px] leading-[32px] truncate overflow-hidden text-ellipsis">@{socialX}</h4>
                  <Button 
                    className="h-7 w-7 p-1 opacity-50 hover:opacity-100"
                    onClick={() => setEditingValue("twitter")}
                    variant="ghost"
                  >
                    <Pencil height={14} width={14} />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditingValue("twitter")} className="h-[32px]">Add X Handle</Button>
              )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 background-color rounded-xl p-[16px]">
          <Image src="/assets/img/logo/socials/linked_in.svg" alt="X Logo" height={28} width={28} />
          <div className="flex flex-col gap-1">
            <p className="font-light text-muted-foreground uppercase">Linked In Username</p>
            {editingValue === "linkedIn" ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  className="bg-grey-450 w-full h-[32px] rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                  placeholder="@..."
                  value={socialLinkedIn}
                  onChange={(e) => setSocialLinkedIn(e.target.value)}
                />

                <div className="flex items-center bg-grey-450 h-[32px] rounded-lg p-1">
                  <Button
                    className="h-[32px] w-[32px] opacity-70 hover:opacity-100"
                    onClick={() => resetUserState("linkedIn")}
                    variant="ghost"
                    size="icon"
                  >
                    <X height={18} width={18} />
                  </Button>
                  <div className="h-full border-l border-color" />
                  <Button 
                    className="h-[32px] w-[32px] opacity-70 hover:opacity-100"
                    onClick={checkState}
                    variant="ghost"
                    size="icon"
                  >
                    <Check height={18} width={18} />
                  </Button>
                </div>
              </div>
            ) : (
              <>
              {socialLinkedIn ? (
                <div className="flex items-center gap-1">
                  <h4 className="max-w-[155px] leading-[32px] truncate overflow-hidden text-ellipsis">@{socialLinkedIn}</h4>
                  <Button 
                    className="h-7 w-7 p-1 opacity-50 hover:opacity-100"
                    onClick={() => setEditingValue("linkedIn")}
                    variant="ghost"
                  >
                    <Pencil height={14} width={14} />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditingValue("linkedIn")} className="h-[32px]">Add Linked In</Button>
              )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 background-color rounded-xl p-[16px]">
          <Link height={28} width={28} />
          <div className="flex flex-col gap-1">
            <p className="font-light text-muted-foreground uppercase">Personal Website</p>
            {editingValue === "website" ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  className="bg-grey-450 w-full h-[32px] rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
                  placeholder="www.mysite.com"
                  value={socialWebsite}
                  onChange={(e) => setSocialWebsite(e.target.value)}
                />

                <div className="flex items-center bg-grey-450 h-[32px] rounded-lg p-1">
                  <Button
                    className="h-[32px] w-[32px] opacity-70 hover:opacity-100"
                    onClick={() => resetUserState("website")}
                    variant="ghost"
                    size="icon"
                  >
                    <X height={18} width={18} />
                  </Button>
                  <div className="h-full border-l border-color" />
                  <Button
                    className="h-[32px] w-[32px] opacity-70 hover:opacity-100"
                    onClick={checkState}
                    variant="ghost"
                    size="icon"
                  >
                    <Check height={18} width={18} />
                  </Button>
                </div>
              </div>
            ) : (
              <>
              {socialWebsite ? (
                <div className="flex items-center gap-1">
                  <h4 className="max-w-[155px] leading-[32px] items-center truncate overflow-hidden text-ellipsis">{socialWebsite}</h4>
                  <Button 
                    className="h-7 w-7 p-1 opacity-50 hover:opacity-100"
                    onClick={() => setEditingValue("website")}
                    variant="ghost"
                  >
                    <Pencil height={14} width={14} />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditingValue("website")} className="h-[32px]">Add Site</Button>
              )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
};