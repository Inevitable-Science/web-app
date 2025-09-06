export function Stat({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div>
      <div className="text-xl font-bold">{label}</div>
      <div className="text-2xl">{children}</div>
    </div>
  );
}
