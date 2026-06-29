import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function TopBar({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        className="rounded-full p-2 text-foreground hover:bg-surface-2"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      {title && <h2 className="font-serif text-base">{title}</h2>}
      <div className="ml-auto">{right}</div>
    </header>
  );
}
