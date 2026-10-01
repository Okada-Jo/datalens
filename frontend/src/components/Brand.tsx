import { useLocale } from "../i18n";
import { ScanLine } from "lucide-react";
import { Link } from "react-router-dom";

export function Brand() {
  useLocale();
  return <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-zinc-900">
    <span className="brand-mark"><ScanLine size={21} /></span>DataLens<span className="brand-dot" />
  </Link>;
}
