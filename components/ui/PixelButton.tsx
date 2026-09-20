export function PixelButton({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <a className={`pixel-button${secondary ? " secondary" : ""}`} href={href}>
      {children}
    </a>
  );
}
