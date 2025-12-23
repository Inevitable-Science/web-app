import { SelectedSuckerProvider } from "./SelectedSuckerContext";
import { TransactionCard } from "./TransactionCard";

export function PayCard() {
  return (
    <div className="flex w-full flex-col rounded-xl">
      <SelectedSuckerProvider>
        <TransactionCard />
      </SelectedSuckerProvider>
    </div>
  );
}
