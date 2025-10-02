import * as React from "react";

import { cn } from "@/lib/utils";
import { PayOnSelect } from "./PayOnSelect";
import { ChainLogo } from "@/components/ChainLogo";

export interface PayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  withPayOnSelect?: boolean;
  currency?: string;
  inputClassName?: string;
}

const PayInput = React.forwardRef<HTMLInputElement, PayInputProps>(
  (
    {
      className,
      inputClassName,
      label,
      type,
      currency,
      withPayOnSelect,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          "h-30 flex w-full flex-col items-center justify-between px-2 py-4 shadow-sm",
          className
        )}
      >
        <div className="flex w-full justify-between gap-1">
          <label className="text-lg">{label}</label>
          {withPayOnSelect && <PayOnSelect />}
        </div>
        <div className="flex items-center justify-between">
          <input
            type={type}
            className={cn(
              "w-full border-0 bg-transparent pb-0 pl-0 pr-3 pt-1 text-2xl placeholder:text-zinc-400 focus:ring-transparent sm:leading-6",
              inputClassName
            )}
            ref={ref}
            placeholder="0.00"
            {...props}
          />

          <ChainLogo chainId={1} width={24} height={24} />
        </div>
      </div>
    );
  }
);
PayInput.displayName = "PayInput";

export { PayInput };
