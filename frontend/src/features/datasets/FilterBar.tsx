import { gettext as t, useLocale } from "../../i18n";
import { Filter, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import type {
  DatasetFilter,
  FilterOperator,
} from "../../lib/api";
import type {
  ColumnAnalysis,
} from "../../schemas/dataset";

interface FilterBarProps {
  columns: ColumnAnalysis[];
  filters: DatasetFilter[];
  onAddFilter: (filter: DatasetFilter) => void;
  onRemoveFilter: (index: number) => void;
  onClearFilters: () => void;
}

export default function FilterBar({
  columns,
  filters,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
}: FilterBarProps) {
  useLocale();
  const [columnName, setColumnName] = useState(
    columns[0]?.name ?? "",
  );

  const selectedColumn = columns.find(
    (column) => column.name === columnName,
  );

  const operators = useMemo(
    () => getOperators(selectedColumn),
    [selectedColumn],
  );

  const [operator, setOperator] =
    useState<FilterOperator>(
      operators[0]?.value ?? "contains",
    );

  const [value, setValue] = useState("");

  useEffect(() => {
    if (
      !operators.some(
        (option) => option.value === operator,
      )
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOperator(
        operators[0]?.value ?? "contains",
      );
    }
  }, [operators, operator]);

  const requiresValue =
    operator !== "is_missing" &&
    operator !== "is_not_missing";

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!columnName) {
      return;
    }

    const trimmedValue = value.trim();

    if (requiresValue && !trimmedValue) {
      return;
    }

    onAddFilter({
      column: columnName,
      operator,
      ...(requiresValue
        ? { value: trimmedValue }
        : {}),
    });

    setValue("");
  }

  return (
    <div className="mb-4 space-y-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-2"
      >
        <div className="mr-1 flex items-center gap-2 text-sm text-zinc-500">
          <Filter size={15} />
          {t("Filter")}</div>

        <select
          value={columnName}
          onChange={(event) =>
            setColumnName(event.target.value)
          }
          className="rounded-lg border border-zinc-200 bg-surface px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
        >
          {columns.map((column) => (
            <option
              key={column.name}
              value={column.name}
            >
              {column.name}
            </option>
          ))}
        </select>

        <select
          value={operator}
          onChange={(event) =>
            setOperator(
              event.target.value as FilterOperator,
            )
          }
          className="rounded-lg border border-zinc-200 bg-surface px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
        >
          {operators.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {t(option.label)}
            </option>
          ))}
        </select>

        {requiresValue && (
          <input
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
            placeholder={t("Value")}
            className="w-48 rounded-lg border border-zinc-200 bg-surface px-3 py-2 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
          />
        )}

        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          {t("Add filter")}</button>
      </form>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter, index) => (
            <FilterChip
              key={`${filter.column}-${filter.operator}-${filter.value ?? ""}-${index}`}
              filter={filter}
              onRemove={() => onRemoveFilter(index)}
            />
          ))}

          {filters.length > 1 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-2 py-1 text-xs text-zinc-400 transition hover:text-zinc-700"
            >
              {t("Clear all")}</button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  filter,
  onRemove,
}: {
  filter: DatasetFilter;
  onRemove: () => void;
}) {
  useLocale();
  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-3 pr-1 text-xs text-zinc-600">
      <span>
        <span className="font-medium text-zinc-800">
          {filter.column}
        </span>{" "}
        {t(operatorLabel(filter.operator))}
        {filter.value !== undefined && (
          <>
            {" "}
            <span className="font-medium text-zinc-800">
              {filter.value}
            </span>
          </>
        )}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="flex size-5 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700"
        aria-label={t("Remove {column} filter", { column: filter.column })}
      >
        <X size={12} />
      </button>
    </div>
  );
}

function getOperators(
  column: ColumnAnalysis | undefined,
): {
  value: FilterOperator;
  label: string;
}[] {
  const missingOperators = [
    {
      value: "is_missing" as const,
      label: "is missing",
    },
    {
      value: "is_not_missing" as const,
      label: "is not missing",
    },
  ];

  if (column?.type === "number") {
    return [
      { value: "equals", label: "=" },
      { value: "gt", label: ">" },
      { value: "gte", label: "≥" },
      { value: "lt", label: "<" },
      { value: "lte", label: "≤" },
      ...missingOperators,
    ];
  }

  return [
    {
      value: "contains",
      label: "contains",
    },
    {
      value: "equals",
      label: "equals",
    },
    ...missingOperators,
  ];
}

function operatorLabel(
  operator: FilterOperator,
): string {
  const labels: Record<FilterOperator, string> = {
    contains: "contains",
    equals: "=",
    gt: ">",
    gte: "≥",
    lt: "<",
    lte: "≤",
    is_missing: "is missing",
    is_not_missing: "is not missing",
  };

  return labels[operator];
}