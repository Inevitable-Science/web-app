import Image from "next/image";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useUser } from "@/store/AdminAuthStore";
import { useOrganisation } from "@/store/ArticleEditorStore";


export function OrganisationSelect() {
  const { user } = useUser();
  const { organisation, setOrganisation } = useOrganisation();

  const userCanCreateOrg =
    user?.organisations.filter(
      (org) => org.userPermissions.canCreate || org.userPermissions.isAdmin
  ) ?? [];
  const currentOrg = userCanCreateOrg.find(org => org.organisationId === organisation);

  console.log(currentOrg);

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border-none bg-grey-450 p-2 font-light">
      <h4>Organisation</h4>

      <Select
        value={organisation}
        onValueChange={(orgId) => {
          setOrganisation(orgId);
        }}
      >
        <SelectTrigger
          className="text-color background-color rounded-lg border-none px-3 py-1"
          aria-label="Select Organisation"
        >
          {currentOrg ? (
            <div className="flex select-none items-center font-light">
              <div className="mr-1 flex items-end">
                <div className="h-fit w-fit rounded-full border-[1.5px] border-grey-450 bg-grey-450 shadow-md">
                  {currentOrg.metadata.logo ? (
                    <Image
                      src={currentOrg.metadata.logo}
                      alt={`Org Logo`}
                      width={18}
                      height={18}
                      className="min-h-[24px] min-w-[24px] shrink-0 rounded-full"
                    />
                  ) : (
                    <Building2 width={18} height={18} />
                  )}
                </div>
              </div>
              <p className="mr-1">{currentOrg.organisationName}</p>
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
                    className="min-h-[24px] min-w-[24px] shrink-0 rounded-full"
                  />
                ) : (
                  <Building2 width={18} height={18} />
                )}
                <span className="ml-2 grow">
                  {org.organisationName}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  )
}