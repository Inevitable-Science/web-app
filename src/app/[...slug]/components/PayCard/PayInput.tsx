/*import * as React from "react";

import { cn } from "@/lib/utils";
import { PayOnSelect } from "./PayOnSelect";

export interface PayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  withPayOnSelect?: boolean;
  currency?: string;
  inputClassName?: string;
}

const PayInput = React.forwardRef<HTMLInputElement, PayInputProps>(
  ({ className, inputClassName, label, type, currency, withPayOnSelect, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-30 px-4 py-4 w-full items-center justify-between shadow-sm",
          className
        )}
      >
        <div className="flex flex-col">
          <div className="flex flex-row justify-between w-full gap-1">
            <label className="text-md">
              {label}
            </label>
            {withPayOnSelect && (
              <PayOnSelect />
            )}
          </div>
          <input
            type={type}
            className={cn(
              "border-0 bg-transparent pl-0 pr-3 pt-1 pb-0 text-2xl w-full placeholder:text-zinc-400 sm:leading-6 focus:ring-transparent",
              inputClassName
            )}
            ref={ref}
            placeholder="0.00"
            {...props}
          />
        </div>
        <span className="text-right select-none text-lg">{currency}</span>
      </div>
    );
  }
);
PayInput.displayName = "PayInput";

export { PayInput };*/

import * as React from "react";

import { cn } from "@/lib/utils";
import { PayOnSelect } from "./PayOnSelect";

export interface PayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  withPayOnSelect?: boolean;
  currency?: string;
  inputClassName?: string;
}

const PayInput = React.forwardRef<HTMLInputElement, PayInputProps>(
  ({ className, inputClassName, label, type, currency, withPayOnSelect, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex flex-col h-30 px-2 py-4 w-full items-center justify-between shadow-sm",
          className
        )}
      >
        <div className="flex justify-between w-full gap-1">
          <label className="text-lg">
            {label}
          </label>
          {withPayOnSelect && (
            <PayOnSelect />
          )}
        </div>
        <div className="flex justify-between items-center">
          <input
            type={type}
            className={cn(
              "border-0 bg-transparent pl-0 pr-3 pt-1 pb-0 text-2xl w-full placeholder:text-zinc-400 sm:leading-6 focus:ring-transparent",
              inputClassName
            )}
            ref={ref}
            placeholder="0.00"
            {...props}
          />
          
          <span className="text-right select-none text-lg">{currency}</span>
        </div>
      </div>
    );
  }
);
PayInput.displayName = "PayInput";

export { PayInput };