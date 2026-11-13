// Digits with an optional single decimal point (no "e", "+", "-", ",")
const NUMERIC_REGEX = /^\d*\.?\d*$/;
const MAX_INPUT_LENGTH = 16;

// Blocks pasting/dropping anything that isn't a plain number (e.g. "1e5", "-2", "abc")
export const preventInvalidPaste = (
  e: React.ClipboardEvent<HTMLInputElement> | React.DragEvent<HTMLInputElement>
) => {
  const data = "clipboardData" in e ? e.clipboardData : e.dataTransfer;
  const text = data.getData("text").trim();

  if (!NUMERIC_REGEX.test(text) || text.length > MAX_INPUT_LENGTH) {
    e.preventDefault();
  }
};

export const preventMinusKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow shortcuts: copy/paste/cut/select-all/undo
  if (e.metaKey || e.ctrlKey) return;

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
  if (next.length > MAX_INPUT_LENGTH) {
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
      onChange={(e) => {
        if (onChangeFunction) {
          onChangeFunction(e.target.value);
          return;
        }
      }}
      onKeyDown={preventMinusKey}
      onPaste={preventInvalidPaste}
      onDrop={preventInvalidPaste}
      disabled={disabled}
    />
  );
}
