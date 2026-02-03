import { BookCheck, Check, Landmark, Loader2, Receipt, X } from "lucide-react";
import { BorrowStatus } from "./LoanActionButton";

export function LoanStepper({
  currentStep,
  userHasPermission,
  userHasApproved,
  baseTokenIsNative,
}: {
  currentStep: BorrowStatus;
  userHasPermission: boolean;
  userHasApproved: boolean;
  baseTokenIsNative: boolean;
}) {
  return (
    <div className="background-color my-4 overflow-y-auto rounded-xl p-4 text-sm">
      <ol className="text-body border-color relative mx-4 border-s-[1.5px]">
        <li className="ms-7 mb-10">
          {currentStep === "signing-permission" ? (
            <LoadingBubble />
          ) : currentStep === "rejected-permission" ? (
            <FailureBubble />
          ) : userHasPermission ? (
            <SuccessBubble />
          ) : (
            <div className="background-color absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full">
              <span className="ring-buffer ring-grey-450 relative flex h-8 w-8 items-center justify-center rounded-full bg-(--muted)/20 ring-2">
                <BookCheck height={18} width={18} />
              </span>
            </div>
          )}
          <h3 className="leading-tight font-medium">Grant Permissions</h3>
          <p className="text-muted-foreground text-sm">
            Gain permission from the smart contract to open a loan
          </p>
        </li>

        <li className="ms-7">
          {currentStep === "signing-borrow" ? (
            <LoadingBubble />
          ) : currentStep === "rejected-borrow" ? (
            <FailureBubble />
          ) : currentStep === "success" ? (
            <SuccessBubble />
          ) : (
            <div className="background-color absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full">
              <span className="ring-buffer ring-grey-450 relative flex h-8 w-8 items-center justify-center rounded-full bg-(--muted)/20 ring-2">
                <Landmark height={18} width={18} />
              </span>
            </div>
          )}
          <h3 className="leading-tight font-medium">Open Loan</h3>
          <p className="text-muted-foreground text-sm leading-[16px]">
            Open a loan using your collateral
          </p>
        </li>
      </ol>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="background-color absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full">
      <span className="ring-buffer relative flex h-8 w-8 items-center justify-center rounded-full bg-(--muted)/20 ring-2 ring-(--input)">
        <Loader2 className="animate-spin" height={18} width={18} />
      </span>
    </div>
  );
}

function SuccessBubble() {
  return (
    <div className="background-color absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full">
      <span className="ring-buffer relative flex h-8 w-8 items-center justify-center rounded-full bg-green-900/30 text-green-400 ring-2 ring-green-900">
        <Check height={18} width={18} />
      </span>
    </div>
  );
}

function FailureBubble() {
  return (
    <div className="background-color absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full">
      <span className="ring-buffer relative flex h-8 w-8 items-center justify-center rounded-full bg-(--destructive)/20 text-(--destructive) ring-2 ring-(--destructive)">
        <X height={18} width={18} />
      </span>
    </div>
  );
}
