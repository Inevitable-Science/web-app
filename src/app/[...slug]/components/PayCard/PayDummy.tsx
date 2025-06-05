import * as React from "react";

import { cn } from "@/lib/utils";
import { PayOnSelect } from "./PayOnSelect";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";

export interface PayInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  withPayOnSelect?: boolean;
  currency?: string;
  inputClassName?: string;
}

const PayDummy = React.forwardRef<HTMLInputElement, PayInputProps>(
  ({ className, inputClassName, label, type, currency, withPayOnSelect, ...props }, ref) => {
    return (
      <div className="bg-grey-450 flex flex-col p-[12px] rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button className="bg-transparent h-[35px] border-b-[1.5px] border-cerulean rounded-t font-light hover:bg-transparent">
              Buy
            </Button>
            <Button className="bg-transparent h-[35px] border-b-[1.5px] border-transparent rounded-t font-light hover:bg-transparent">
              Withdraw
            </Button>
          </div>

          <h1>select</h1>
        </div>

        <div className="flex flex-col gap-2 my-4">
          <div className="background-color flex items-center justify-between p-[16px] rounded-xl">
            <div className="flex flex-col gap-[2px]">
              <p className="text-sm text-muted-foreground font-light">PAY</p>
              <input
                className="bg-transparent max-w-[130px] shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                placeholder="0.00"
              />
              <p className="text-sm text-muted-foreground font-light">US$0.00</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex w-fit bg-grey-450 rounded-full py-1 px-3 gap-2 items-center justify-end">
                <h1>E</h1>
                <p className="text-lg font-light">ETH</p>
              </div>
              <p className="text-sm text-muted-foreground font-light">Balance: 0.00</p>
            </div>
          </div>

          <div className="background-color flex items-center justify-between p-[16px] rounded-xl">
            <div className="flex flex-col gap-[2px]">
              <p className="text-sm text-muted-foreground font-light">RECIEVE</p>
              <input
                className="bg-transparent max-w-[130px] shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex w-fit bg-grey-450 rounded-full py-1 px-3 gap-2 items-center">
                <h1>H</h1>
                <p className="text-lg font-light">HYDRA</p>
              </div>
              <p className="text-sm text-muted-foreground font-light">Balance: 0.00</p>
            </div>
          </div>
        </div>

        <Button className="w-full rounded-full bg-cerulean hover:bg-cerulean">
          BUY
        </Button>

        <div className="background-color flex flex-col gap-[2px] p-[16px] rounded-xl mt-4">
          <p className="text-sm font-light">1 ETH = 7000 HYDRA</p>
          <p className="text-xs text-muted-foreground font-light">Total token supply: 18,631,450.79</p>
          <p className="text-xs text-muted-foreground font-light">Redemption rate: 100%</p>
        </div>
      </div>
    );
  }
);
PayDummy.displayName = "PayDummy";

export { PayDummy };