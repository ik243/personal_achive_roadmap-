import { cn } from "@/lib/utils";

interface NotebookSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function NotebookSection({ title, children, className }: NotebookSectionProps) {
  return (
    <section className={cn("border-b border-border pb-8 last:border-b-0", className)}>
      {title && (
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h2>
      )}
      {children}
    </section>
  );
}
