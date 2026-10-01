import { gettext as t, useLocale } from "../../i18n";
import { useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";

import type { DatasetFilter, DatasetSort } from "../../lib/api";
import {
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";

import type {
  DatasetCell,
  DatasetRow,
} from "../../schemas/datasetRows";
import type { ColumnAnalysis } from "../../schemas/dataset";
import FilterBar from "./FilterBar";

const features = tableFeatures({});

type TableFeatures = typeof features;

interface DataTableProps {
  columns: ColumnAnalysis[];
  rows: DatasetRow[];
  sort: DatasetSort | null;
  filters: DatasetFilter[];
  onSort: (column: string) => void;
  onAddFilter: (filter: DatasetFilter) => void;
  onRemoveFilter: (index: number) => void;
  onClearFilters: () => void;
}

export default function DataTable({
  columns,
  rows,
  sort,
  filters,
  onSort,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
}: DataTableProps) {
  useLocale();
  const tableColumns = useMemo<
    ColumnDef<TableFeatures, DatasetRow>[]
  >(
    () =>
      columns.map((column) => ({
        id: column.name,
        accessorFn: (row) => row[column.name],
        header: column.name,
        cell: (info) => {
          const value = info.getValue() as DatasetCell;

          return <CellValue value={value} />;
        },
      })),
    [columns],
  );

  const table = useTable({
    features,
    data: rows,
    columns: tableColumns,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-surface">
      <FilterBar
        columns={columns}
        filters={filters}
        onAddFilter={onAddFilter}
        onRemoveFilter={onRemoveFilter}
        onClearFilters={onClearFilters}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-4 py-3 text-xs font-medium text-zinc-500"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={() => onSort(header.column.id)}
                        className="flex w-full items-center gap-2 text-left transition hover:text-zinc-900"
                      >
                        <table.FlexRender header={header} />

                        <SortIcon
                          column={header.column.id}
                          sort={sort}
                        />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-zinc-50"
              >
                {row.getAllCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="max-w-64 whitespace-nowrap px-4 py-3 text-zinc-700"
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-zinc-400">
            {t("No rows to display.")}</div>
        )}
      </div>
    </div>
  );
}

function SortIcon({
  column,
  sort,
}: {
  column: string;
  sort: DatasetSort | null;
}) {
  useLocale();
  if (!sort || sort.column !== column) {
    return (
      <ArrowUpDown
        size={13}
        className="text-zinc-300"
      />
    );
  }

  if (sort.direction === "asc") {
    return (
      <ArrowUp
        size={13}
        className="text-zinc-700"
      />
    );
  }

  return (
    <ArrowDown
      size={13}
      className="text-zinc-700"
    />
  );
}

function CellValue({
  value,
}: {
  value: DatasetCell;
}) {
  useLocale();
  if (value === null) {
    return (
      <span className="italic text-zinc-300">
        {t("null")}</span>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span className="font-mono text-xs">
        {value ? t("true") : t("false")}
      </span>
    );
  }

  if (typeof value === "number") {
    return (
      <span className="tabular-nums">
        {value}
      </span>
    );
  }

  return (
    <span
      className="block max-w-64 truncate"
      title={value}
    >
      {value}
    </span>
  );
}