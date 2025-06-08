import { SelectedSuckerProvider } from "./SelectedSuckerContext";
import { TransactionCard } from "./TransactionCard";

export function PayCard() {
  return (
    <div className="flex flex-col rounded-xl w-full">
      {/* <h2 className="mb-4">Join network</h2> */}
      <SelectedSuckerProvider>
        <TransactionCard />
      </SelectedSuckerProvider>
    </div>
  );
}
