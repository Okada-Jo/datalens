import { gettext as t, getLocale, translateMessage, useLocale } from "../../i18n";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Bike, Coffee, Film, LoaderCircle, ShoppingBag, Sparkles, Wind } from "lucide-react";
import { getSamples } from "../../lib/api";
import { formatFileSize } from "./fileUtils";

const icons = { retail: ShoppingBag, bikes: Bike, energy: Wind, cafes: Coffee, streaming: Film };

interface Props {
  disabled: boolean;
  pendingId?: string;
  onSelect: (id: string) => void;
}

export function SampleDatasets({ disabled, pendingId, onSelect }: Props) {
  useLocale();
  const samples = useQuery({ queryKey: ["samples"], queryFn: getSamples, staleTime: Infinity });

  return (
    <section className="mt-6 border-t border-zinc-200 pt-6" aria-labelledby="sample-heading" aria-busy={Boolean(pendingId)}>
      <div className="flex items-center gap-2">
        <Sparkles size={17} className="accent-text" />
        <h2 id="sample-heading" className="text-sm font-semibold text-zinc-900">{t("No file handy? Follow your curiosity.")}</h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{t("Try a fictional dataset. Each opens a fresh, editable copy for 24 hours, with a few missing values to tidy up.")}</p>
      {samples.isPending && <p role="status" className="mt-4 text-sm text-zinc-500">{t("Loading sample datasets…")}</p>}
      {samples.isError && <div role="alert" className="mt-4 text-sm text-red-700">
        <p>{translateMessage(samples.error.message)}</p>
        <button type="button" onClick={() => void samples.refetch()} className="mt-2 underline" disabled={samples.isFetching}>{t("Try again")}</button>
      </div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {samples.data?.map((sample) => {
          const Icon = icons[sample.id as keyof typeof icons] ?? Sparkles;
          const pending = pendingId === sample.id;
          return <button type="button" key={sample.id} disabled={disabled} onClick={() => onSelect(sample.id)}
            className="sample-card group rounded-xl border border-zinc-200 bg-surface p-4 text-left transition disabled:cursor-wait disabled:opacity-60"
            aria-label={t("Explore {name}, {count} rows", { name: t(sample.name), count: sample.rowCount.toLocaleString(getLocale()) })}>
            <div className="flex items-center justify-between gap-3">
              <span className="sample-icon"><Icon size={18} /></span>
              <span className="text-xs text-zinc-500">{t(sample.topic)}</span>
              {pending ? <LoaderCircle size={16} className="accent-text animate-spin" /> : <ArrowUpRight size={16} className="text-zinc-400" />}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900">{t(sample.name)}</h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{t(sample.description)}</p>
            <p className="mt-3 text-xs font-medium text-zinc-600">{t("{rows} rows · {columns} columns · {size}", { rows: sample.rowCount.toLocaleString(getLocale()), columns: sample.columnCount, size: formatFileSize(sample.fileSize) })}</p>
          </button>;
        })}
      </div>
      {pendingId && <p role="status" className="mt-3 text-sm accent-text">{t("Preparing your copy. Larger datasets may take a moment…")}</p>}
    </section>
  );
}
