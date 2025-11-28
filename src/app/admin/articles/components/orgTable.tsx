import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { CreateOrgDialogue } from "./admin/createOrgDialogue";
import { EditOrgDialogue } from "./admin/editOrgDialogue";
import { CreateUserDialogue } from "./admin/createUserDialogue";
import {
  AllUsersResponse,
  AllUsersResponseZ,
  Organisation,
} from "../helpers/types";
import { useArticleAuthContext } from "../helpers/articleAuthContext";
import { CircleUserRound, Pencil, Plus } from "lucide-react";

export function OrganisationTable({
  organisations,
}: {
  organisations: Organisation[];
}) {
  const { user, authToken } = useArticleAuthContext();

  const [allUsers, setAllUsers] = useState<AllUsersResponse | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        if (!user?.user.isTopLevelAdmin || !authToken) {
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/all`,
          {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();
        console.log(data);
        const parsed = AllUsersResponseZ.parse(data.users);

        setAllUsers(parsed);
        return;
      } catch (err) {
        console.log(err);
        return;
      }
    };

    fetchAllUsers();
  }, []);

  return (
    <div className="flex flex-col gap-[12px] rounded-2xl bg-grey-450 p-[12px]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl">Organisations</h3>
        <div className="flex items-center gap-2">
          {user?.user.isTopLevelAdmin && (
            <CreateUserDialogue>
              <Button variant={"secondary"} className="flex items-center gap-1">
                Create User
                <Plus height={20} width={20} />
              </Button>
            </CreateUserDialogue>
          )}
          {user?.user.isTopLevelAdmin && allUsers && (
            <CreateOrgDialogue allUsers={allUsers}>
              <Button variant={"secondary"} className="flex items-center gap-1">
                Create Organisation
                <Plus height={20} width={20} />
              </Button>
            </CreateOrgDialogue>
          )}
        </div>
      </div>

      {organisations.length > 0 ? (
        <>
          {organisations.map((org) => (
            <div
              key={org.organisationId}
              className="background-color mb-2 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {org.metadata.logo ? (
                    <Image
                      src={org.metadata.logo}
                      className="rounded-full"
                      alt={"Org Logo"}
                      height={28}
                      width={28}
                    />
                  ) : (
                    <CircleUserRound height={28} width={28} />
                  )}
                  <p>{org.organisationName}</p>
                </div>

                {allUsers !== null &&
                  (user?.user.isTopLevelAdmin ||
                    org.userPermissions.isAdmin) && (
                    <EditOrgDialogue
                      allUsers={allUsers}
                      organisationId={org.organisationId}
                    >
                      <Button className="flex h-[34px] items-center gap-2">
                        Edit Organisation
                        <Pencil height={16} width={16} />
                      </Button>
                    </EditOrgDialogue>
                  )}
              </div>

              <div className="mt-2 text-sm">
                {org.metadata.description ? (
                  <p>{org.metadata.description}</p>
                ) : (
                  <p className="text-muted-foreground">No Description</p>
                )}
                {org.metadata.website && (
                  <p>
                    Website:{" "}
                    <a href={org.metadata.website}>{org.metadata.website}</a>
                  </p>
                )}
                {org.metadata.x && <p>X: {org.metadata.x}</p>}
                {org.metadata.discord && <p>Discord: {org.metadata.discord}</p>}
              </div>

              <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-2">
                {(
                  ["isAdmin", "canCreate", "canEdit", "canDelete"] as const
                ).map((role) => (
                  <div key={role} className="flex flex-col gap-0.5">
                    <p className="text-sm capitalize">
                      {role.replace(/([A-Z])/g, " $1")}
                    </p>
                    {org.userPermissions[role] ? "True" : "False"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="flex h-[44px] items-center justify-center">
          <p className="text-muted-foreground">No Organisations</p>
        </div>
      )}
    </div>
  );
}
