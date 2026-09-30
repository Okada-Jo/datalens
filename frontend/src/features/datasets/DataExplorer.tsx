import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { formatNumber } from "../../lib/format";
import { useDatasetRows } from "./queries";
import DataTable from "./DataTable";
import type { DatasetFilter, DatasetSort } from "../../lib/api";
import type { ColumnAnalysis } from "../../schemas/dataset";

interface DataExplorerProps {
  datasetId: string;
  columns: ColumnAnalysis[];
}

const PAGE_SIZE = 50;

export default function DataExplorer({
  datasetId,
  columns,
}: DataExplorerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] =
    useState(search);

  const page = Math.max(
    Number(searchParams.get("page")) || 1,
    1,
  );
  const sortColumn = searchParams.get("sort");
  const sortDirection =
    searchParams.get("direction") === "desc"
      ? "desc"
      : "asc";

  const sort: DatasetSort | null = sortColumn
    ? {
        column: sortColumn,
        direction: sortDirection,
      }
    : null;
  const filters = parseFilters(
    searchParams.get("filters"),
  );
  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useDatasetRows(
    datasetId,
    page,
    PAGE_SIZE,
    sort,
    filters,
    search,
  );

  function parseFilters(
    value: string | null,
  ): DatasetFilter[] {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  const updateSearchParams = useCallback((
    updates: Record<string, string | null>,
  ) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      for (const [key, value] of Object.entries(
        updates,
      )) {
        if (value === null) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }

      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      updateSearchParams({
        search:
          searchInput.trim() || null,
        page: null,
      });
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput, updateSearchParams]);

  function handlePageChange(nextPage: number) {
    updateSearchParams({
      page:
        nextPage === 1
          ? null
          : String(nextPage),
    });
  }

  function handleAddFilter(
    filter: DatasetFilter,
  ) {
    const nextFilters = [
      ...filters,
      filter,
    ];

    updateSearchParams({
      filters: JSON.stringify(nextFilters),
      page: null,
    });
  }

  function handleRemoveFilter(index: number) {
    const nextFilters = filters.filter(
      (_, filterIndex) =>
        filterIndex !== index,
    );

    updateSearchParams({
      filters:
        nextFilters.length > 0
          ? JSON.stringify(nextFilters)
          : null,
      page: null,
    });
  }

  function handleClearFilters() {
    updateSearchParams({
      filters: null,
      page: null,
    });
  }

  function handleSort(column: string) {
    if (!sort || sort.column !== column) {
      updateSearchParams({
        sort: column,
        direction: "asc",
        page: null,
      });

      return;
    }

    if (sort.direction === "asc") {
      updateSearchParams({
        sort: column,
        direction: "desc",
        page: null,
      });

      return;
    }

    updateSearchParams({
      sort: null,
      direction: null,
      page: null,
    });
  }

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
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Search all columns..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
          />

          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
              }}
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div
        className={[
          "transition-opacity",
          isFetching ? "opacity-60" : "opacity-100",
        ].join(" ")}
      >
        <DataTable
          columns={columns}
          rows={data.rows}
          sort={sort}
          filters={filters}
          onSort={handleSort}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
          onClearFilters={handleClearFilters}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {formatNumber(data.totalRows)}{" "}
          {filters.length > 0 || search
            ? "matching rows"
            : "rows"}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              handlePageChange(page - 1)
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
              handlePageChange(page + 1)
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