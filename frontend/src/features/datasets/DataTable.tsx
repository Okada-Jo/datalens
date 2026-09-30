import { useMemo } from "react";
import {
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";

import type {
  DatasetCell,
  DatasetRow,
} from "../../schemas/datasetRows";

const features = tableFeatures({});

type TableFeatures = typeof features;

interface DataTableProps {
  columns: string[];
  rows: DatasetRow[];
}

export default function DataTable({
  columns,
  rows,
}: DataTableProps) {
  const tableColumns = useMemo<
    ColumnDef<TableFeatures, DatasetRow>[]
  >(
    () =>
      columns.map((columnName) => ({
        id: columnName,

        accessorFn: (row) => row[columnName],

        header: columnName,

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
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
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
                      <table.FlexRender header={header} />
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
            No rows to display.
          </div>
        )}
      </div>
    </div>
  );
}

function CellValue({
  value,
}: {
  value: DatasetCell;
}) {
  if (value === null) {
    return (
      <span className="italic text-zinc-300">
        null
      </span>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span className="font-mono text-xs">
        {value ? "true" : "false"}
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