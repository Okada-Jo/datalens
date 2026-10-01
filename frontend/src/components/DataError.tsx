import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  error?: Error | null;
  children?: ReactNode;
}

export function DataError({ title, error, children }: Props) {
  const message = error instanceof TypeError
    ? "Could not reach the server. Check your connection and try again."
    : error?.message || "Please try again.";
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
    <div className="flex items-start gap-3">
      <AlertTriangle size={19} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 whitespace-pre-wrap break-words leading-6">{message}</p>
        {children && <div className="mt-3 flex flex-wrap items-center gap-4">{children}</div>}
      </div>
    </div>
  </div>;
}
