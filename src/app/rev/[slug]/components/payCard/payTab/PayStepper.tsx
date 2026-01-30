import { Check, Landmark, Loader2, Receipt, X } from "lucide-react";
import { PaymentStatusType } from "./PayActionButton";


export function PayStepper({
  currentStep,
  userHasApproved,
  baseTokenIsNative,
} : {
  currentStep: PaymentStatusType;
  userHasApproved: boolean;
  baseTokenIsNative: boolean;
}) {
  return (
    <div className="background-color my-4 overflow-y-auto rounded-xl p-4 text-sm">
      <ol className="relative text-body border-s-[1.5px] border-color mx-4">
        {!baseTokenIsNative && (
          <li className="mb-10 ms-7">
            {currentStep === "signing-approval" ? (
              <LoadingBubble />
            ) : currentStep === "rejected-approval" ? (
              <FailureBubble />
            ) : userHasApproved ? (
              <SuccessBubble />
            ) : (
              <div className="absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 background-color">
                <span className="relative flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-buffer ring-grey-450 bg-(--muted)/20">
                  <Receipt height={18} width={18} />
                </span>
              </div>
            )}
            <h3 className="font-medium leading-tight">Approve Allowance</h3>
            <p className="text-sm text-muted-foreground">Allow the revnet to spend USDC allowing it to send tokens.</p>
          </li>
        )}

        <li className="ms-7">
          {currentStep === "signing-pay" ? (
            <LoadingBubble />
          ) : currentStep === "rejected-pay" ? (
            <FailureBubble />
          ) : currentStep === "success" ? (
            <SuccessBubble />
          ) : (
          <div className="absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 background-color">
            <span className="relative flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-buffer ring-grey-450 bg-(--muted)/20">
              <Landmark height={18} width={18} />
            </span>
          </div>
          )}
          <h3 className="font-medium leading-tight">Open Loan</h3>
          <p className="text-sm leading-[16px] text-muted-foreground">Open a loan using your collateral</p>
        </li>
      </ol>
    </div>
  )
};

function LoadingBubble() {
  return (
    <div className="absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 background-color">
      <span className="relative flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-buffer ring-(--input) bg-(--muted)/20">
        <Loader2 className="animate-spin" height={18} width={18} />
      </span>
    </div>
  )
}

function SuccessBubble() {
  return (
    <div className="absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 background-color">
      <span className="relative flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-buffer text-green-400 ring-green-900 bg-green-900/30">
        <Check height={18} width={18} />
      </span>
    </div>
  )
}

function FailureBubble() {
  return (
    <div className="absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 background-color">
      <span className="relative flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-buffer text-(--destructive) ring-(--destructive) bg-(--destructive)/20">
        <X height={18} width={18} />
      </span>
    </div>
  )
}