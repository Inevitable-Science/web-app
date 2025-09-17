import { useTokenA } from "@/hooks/useTokenA";
import { FixedInt } from "fpnum";
import { getTokenAToBQuote, getTokenBtoAQuote } from "juice-sdk-core";
import { Field, Formik } from "formik";
import {
  useJBContractContext,
  useJBRulesetContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useState } from "react";
import { formatUnits, parseEther, parseUnits } from "viem";
import { PayDialog } from "./PayDialog";
import { PayInput } from "./PayInput";
import { formatTokenSymbol } from "@/lib/utils";

export function PayForm() {
  const tokenA = useTokenA();
  const { token } = useJBTokenContext();
  const [memo, setMemo] = useState<string>();

  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [amountC, setAmountC] = useState<string>("");

  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  const tokenB = token?.data;

  if (
    token.isLoading ||
    ruleset.isLoading ||
    rulesetMetadata.isLoading ||
    !tokenB
  ) {
    return "Loading...";
  }

  const _amountA = {
    amount: new FixedInt(parseEther(amountA), tokenA.decimals),
    symbol: tokenA.symbol,
  };
  const _amountB = {
    amount: new FixedInt(parseEther(amountB), tokenB.decimals),
    symbol: formatTokenSymbol(token),
  };

  function resetForm() {
    setAmountA("");
    setAmountB("");
    setAmountC("");
  }

  return (
    <div className="max-w-[550px] rounded-2xl bg-grey-450 p-[8px]">
      <div className="flex flex-col items-center justify-center">
        <PayInput
          withPayOnSelect
          label="Buy"
          type="number"
          onChange={(e) => {
            const valueRaw = e.target.value;
            setAmountA(valueRaw);

            if (!valueRaw) {
              resetForm();
              return;
            }

            if (!ruleset?.data || !rulesetMetadata?.data) return;

            const value = parseUnits(
              `${parseFloat(valueRaw)}` as `${number}`,
              tokenA.decimals
            );
            const amountBQuote = getTokenAToBQuote(
              new FixedInt(value, tokenA.decimals),
              {
                weight: ruleset.data.weight,
                reservedPercent: rulesetMetadata.data.reservedPercent,
              }
            );

            setAmountB(formatUnits(amountBQuote.payerTokens, tokenB.decimals));
            setAmountC(
              formatUnits(amountBQuote.reservedTokens, tokenB.decimals)
            );
          }}
          value={amountA}
          currency={tokenA?.symbol}
        />
        <PayInput
          label="You get"
          type="number"
          className=""
          onChange={(e) => {
            const valueRaw = e.target.value;
            setAmountB(valueRaw);

            if (!valueRaw) {
              resetForm();
              return;
            }

            const value = FixedInt.parse(valueRaw, tokenB.decimals);

            if (!ruleset?.data || !rulesetMetadata?.data) return;

            const amountAQuote = getTokenBtoAQuote(value, tokenA.decimals, {
              weight: ruleset.data.weight,
              reservedPercent: rulesetMetadata.data.reservedPercent,
            });

            setAmountA(amountAQuote.format());
          }}
          value={amountB}
          currency={formatTokenSymbol(token)}
        />
        <div className="border-color text-md mb-4 flex w-full gap-1 overflow-x-auto whitespace-nowrap rounded-b border-l border-r bg-[var(--primary)] p-3 text-primary-foreground">
          Splits get {amountC || 0} {formatTokenSymbol(tokenB.symbol)}
        </div>
      </div>

      <div className="flex flex-row">
        {/*<Formik
          initialValues={{ }}
          onSubmit={() => {}}
        >
          <Field
            component="textarea"
            id="memo"
            name="memo"
            rows={2}
            className={
              "flex w-full border border-zinc-200 bg-white px-3 py-1.5 text-md ring-offset-white file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 z-10"
            }
            onChange={(e: any) => setMemo?.(e.target.value)}
            placeholder="Leave a note"
          />
        </Formik>*/}
        <div className="flex w-full">
          {primaryNativeTerminal?.data ? (
            <PayDialog
              amountA={_amountA}
              amountB={_amountB}
              memo={memo}
              primaryTerminalEth={primaryNativeTerminal?.data}
              disabled={!amountA}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
