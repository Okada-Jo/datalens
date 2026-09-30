import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { useState } from "react";

import { formatNumber } from "../../lib/format";
import { useDatasetRows } from "./queries";
import DataTable from "./DataTable";

interface DataExplorerProps {
  datasetId: string;
}

const PAGE_SIZE = 50;

export default function DataExplorer({
  datasetId,
}: DataExplorerProps) {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useDatasetRows(datasetId, page, PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <LoaderCircle
          size={22}
          className="animate-spin text-zinc-400"
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Dataset rows could not be loaded.
      </div>
    );
  }

  return (
    <div>
      <div
        className={[
          "transition-opacity",
          isFetching ? "opacity-60" : "opacity-100",
        ].join(" ")}
      >
        <DataTable
          columns={data.columns}
          rows={data.rows}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {formatNumber(data.totalRows)} rows
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.max(current - 1, 1))
            }
            disabled={page === 1 || isFetching}
            className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <span className="min-w-24 text-center text-sm text-zinc-500">
            Page {data.page} of {data.totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setPage((current) =>
                Math.min(current + 1, data.totalPages),
              )
            }
            disabled={
              page >= data.totalPages || isFetching
            }
            className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}