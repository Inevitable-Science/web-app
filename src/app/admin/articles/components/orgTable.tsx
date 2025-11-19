import { User } from "../types";


export function OrganisationTable({ user }: { user: User }) {
  return(
    <div className="flex flex-col gap-[12px] bg-grey-450 p-[12px] rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl">Organisations</h3>
        {user.isTopLevelAdmin && <p className="text-muted-foreground text-sm">You have full access to all orgs</p>}
      </div>
      
      <p>ToDo</p>
    </div>
  )
}