import { gettext as t, useLocale } from "../../i18n";
import {
  CalendarDays,
  Hash,
  Tags,
  Text,
  ToggleLeft,
} from "lucide-react";

import type {
  ColumnAnalysis,
  ColumnType,
} from "../../schemas/dataset";
import {
  formatDate,
  formatDecimal,
  formatNumber,
} from "../../lib/format";

interface ColumnCardProps {
  column: ColumnAnalysis;
  rowCount: number;
}

const typeConfig: Record<
  ColumnType,
  {
    label: string;
    icon: React.ReactNode;
  }
> = {
  number: {
    label: "Number",
    icon: <Hash size={14} />,
  },
  date: {
    label: "Date",
    icon: <CalendarDays size={14} />,
  },
  category: {
    label: "Category",
    icon: <Tags size={14} />,
  },
  text: {
    label: "Text",
    icon: <Text size={14} />,
  },
  boolean: {
    label: "Boolean",
    icon: <ToggleLeft size={14} />,
  },
};

export default function ColumnCard({
  column,
}: ColumnCardProps) {
  useLocale();
  const type = typeConfig[column.type];

  return (
    <div className="rounded-xl border border-zinc-200 bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-zinc-900">
            {column.name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
              {type.icon}
              {t(type.label)}
            </span>

            <span className="text-xs text-zinc-400">
              {t("{count} unique", { count: formatNumber(column.unique_count) })}</span>
          </div>
        </div>

        <MissingIndicator column={column} />
      </div>

      <div className="mt-5 border-t border-zinc-100 pt-4">
        <ColumnStatistics column={column} />
      </div>
    </div>
  );
}

function MissingIndicator({
  column,
}: {
  column: ColumnAnalysis;
}) {
  useLocale();
  if (column.missing_count === 0) {
    return (
      <span className="text-xs text-zinc-400">
        {t("Complete")}</span>
    );
  }

  return (
    <span className="text-xs font-medium text-amber-600">
      {t("{percent}% missing", { percent: formatDecimal(column.missing_percentage) })}</span>
  );
}

function ColumnStatistics({
  column,
}: {
  column: ColumnAnalysis;
}) {
  useLocale();
  if (!column.statistics) {
    return (
      <p className="text-sm text-zinc-400">
        {t("No additional statistics")}</p>
    );
  }

  if (column.type === "number") {
    const stats = column.statistics;

    if (!("mean" in stats)) {
      return null;
    }

    return (
      <div className="grid grid-cols-3 gap-4">
        <Statistic
          label={t("Min")}
          value={formatDecimal(stats.min)}
        />
        <Statistic
          label={t("Average")}
          value={formatDecimal(stats.mean)}
        />
        <Statistic
          label={t("Max")}
          value={formatDecimal(stats.max)}
        />
      </div>
    );
  }

  if (column.type === "date") {
    const stats = column.statistics;

    if (!("min" in stats) || !("max" in stats)) {
      return null;
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <Statistic
          label={t("Earliest")}
          value={formatDate(String(stats.min))}
        />
        <Statistic
          label={t("Latest")}
          value={formatDate(String(stats.max))}
        />
      </div>
    );
  }

  if (column.type === "category") {
    const stats = column.statistics;

    if (!("top_values" in stats)) {
      return null;
    }

    const values = stats.top_values.slice(0, 3);

    return (
      <div className="space-y-2">
        {values.map((item) => (
          <div
            key={item.value}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="truncate text-zinc-600">
              {item.value}
            </span>

            <span className="shrink-0 tabular-nums text-zinc-400">
              {formatNumber(item.count)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="text-sm text-zinc-400">
      {t("{count} distinct values", { count: formatNumber(column.unique_count) })}</p>
  );
}

function Statistic({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  useLocale();
  return (
    <div>
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-zinc-700">
        {value}
      </p>
    </div>
  );
}