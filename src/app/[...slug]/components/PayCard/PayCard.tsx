import { SelectedSuckerProvider } from "./SelectedSuckerContext";
import { TransactionCard } from "./TransactionCard";

export function PayCard() {
  return (
    <div className="flex flex-col rounded-xl w-full">
      <SelectedSuckerProvider>
        <TransactionCard />
      </SelectedSuckerProvider>
    </div>
  );
}
