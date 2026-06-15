import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

{/** TODO: Add functionality */}

export function PaymentToggle() {
  const rulesetMetadata = useRevnetDataStore((state) => state.rulesetMetadata);
  const { toast } = useToast();

  function togglePaymentsPaused() {
    try {
      
    } catch (err) {
      console.log(err);
      toast({
        title: "Transaction Rejcted",
        description: "You rejected the transaction." 
      });
    }
  }

  return (
    <Button variant={"accent"}>
      {rulesetMetadata?.pausePay ? "Enable Payments" : "Disable Payments"}    
    </Button>
  )
}