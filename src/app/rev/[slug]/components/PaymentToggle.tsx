import { Button } from "@/components/ui/button";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

export function PaymentToggle() {
  const rulesetMetadata = useRevnetDataStore((state) => state.rulesetMetadata);
  
  return (
    <Button variant={"accent"}>
      {rulesetMetadata?.pausePay ? "Enable Payments" : "Disable Payments"}    
    </Button>
  )
}