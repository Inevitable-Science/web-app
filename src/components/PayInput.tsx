
export const preventMinusKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const invalidKeys = ["e", "E", "+", "-", "ArrowUp", "ArrowDown"];
  const key = e.key;

  // Allow all control/navigation keys:
  const controlKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "Home",
    "End",
    "ArrowLeft",
    "ArrowRight",
  ];

  if (controlKeys.includes(key)) {
    return; // allow
  }

  // Block invalid characters
  if (invalidKeys.includes(key)) {
    e.preventDefault();
    return;
  }

  // Key is a single character. Ensure it's a digit or decimal point.
  if (!/[\d.]/.test(key)) {
    e.preventDefault();
    return;
  }

  const current = e.currentTarget.value;
  const next = current + key;

  // Limit total length to 16
  if (next.length > 16) {
    e.preventDefault();
  }
};

export function PayInput({
  value,
  disabled,
  onChangeFunction,
}: {
  value: string;
  disabled?: boolean;
  onChangeFunction?: (arg: string) => void;
}) {

  return (
    <input
      type="number"
      className="focus:placeholder:text-muted-foreground w-full border-none bg-transparent p-0 text-2xl shadow-none ring-0 outline-hidden placeholder:text-white focus:ring-0 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-80"
      placeholder="0.00"
      value={value}
      onChange={(e) =>
        onChangeFunction ? onChangeFunction(e.target.value) : undefined
      }
      onKeyDown={preventMinusKey}
      disabled={disabled}
    />
  );
}
