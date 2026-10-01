import { DataError } from "../components/DataError";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart3,
  LoaderCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useDatasetChart,
  useDatasetRows,
} from "../features/datasets/queries";

import type {
  ChartAggregation,
} from "../schemas/chart";

type ChartType = "bar" | "line";

export function DatasetVisualizePage() {
  const { datasetId } = useParams();

  const [chartType, setChartType] =
    useState<ChartType>("bar");

  const [xColumn, setXColumn] =
    useState("");

  const [yColumn, setYColumn] =
    useState("");

  const [aggregation, setAggregation] =
    useState<ChartAggregation>("sum");

  const {
    data: rowsData,
    isLoading: isRowsLoading,
    error: rowsError,
    refetch: refetchRows,
    isFetching: isRowsFetching,
  } = useDatasetRows(
    datasetId!,
    1,
    1,
    null,
    [],
    "",
  );

  const {
    data: chart,
    isLoading: isChartLoading,
    isFetching: isChartFetching,
    error: chartError,
    refetch: refetchChart,
  } = useDatasetChart(
    datasetId,
    xColumn,
    yColumn,
    aggregation,
  );

  if (!datasetId) {
    return null;
  }

  const canRenderChart =
    Boolean(xColumn) &&
    (
      aggregation === "count" ||
      Boolean(yColumn)
    );

  const columns =
    rowsData?.columns ?? [];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          Visualize
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Build a chart from the current transformed
          dataset.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-surface p-4">
          <h3 className="font-medium text-zinc-900">
            Chart settings
          </h3>

          {isRowsLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
              Loading columns...
            </div>
          ) : rowsError ? (
            <div className="mt-4"><DataError title="Unable to load columns" error={rowsError}>
              <button type="button" className="underline" disabled={isRowsFetching} onClick={() => void refetchRows()}>Try again</button>
            </DataError></div>
          ) : (
            <div className="mt-4 space-y-4">
              <SelectField
                label="Chart type"
                value={chartType}
                onChange={(value) =>
                  setChartType(
                    value as ChartType,
                  )
                }
                options={[
                  {
                    value: "bar",
                    label: "Bar",
                  },
                  {
                    value: "line",
                    label: "Line",
                  },
                ]}
              />

              <SelectField
                label="X axis"
                value={xColumn}
                onChange={setXColumn}
                placeholder="Select a column"
                options={columns.map(
                  (column) => ({
                    value: column,
                    label: column,
                  }),
                )}
              />

              {aggregation !== "count" && (
                <SelectField
                  label="Y axis"
                  value={yColumn}
                  onChange={setYColumn}
                  placeholder="Select a column"
                  options={columns.map(
                    (column) => ({
                      value: column,
                      label: column,
                    }),
                  )}
                />
              )}

              <SelectField
                label="Aggregation"
                value={aggregation}
                onChange={(value) =>
                  setAggregation(
                    value as ChartAggregation,
                  )
                }
                options={[
                  {
                    value: "sum",
                    label: "Sum",
                  },
                  {
                    value: "average",
                    label: "Average",
                  },
                  {
                    value: "count",
                    label: "Count",
                  },
                ]}
              />
            </div>
          )}
        </div>

        <div className="min-h-[440px] rounded-xl border border-zinc-200 bg-surface p-5">
          {!canRenderChart ? (
            <EmptyChart />
          ) : isChartLoading ? (
            <div className="flex h-[390px] items-center justify-center">
              <LoaderCircle
                size={24}
                className="animate-spin text-zinc-400"
              />
            </div>
          ) : chartError ? (
            <DataError title="Unable to build this chart" error={chartError}>
              <button type="button" className="font-medium underline underline-offset-4" disabled={isChartFetching} onClick={() => void refetchChart()}>{isChartFetching ? "Retrying…" : "Try again"}</button>
            </DataError>
          ) : chart ? (
            <div
              className={
                isChartFetching
                  ? "opacity-60 transition-opacity"
                  : "opacity-100 transition-opacity"
              }
            >
              <div className="mb-5">
                <h3 className="font-medium text-zinc-900">
                  {chart.aggregation === "count"
                    ? `Count by ${chart.x}`
                    : `${formatAggregation(chart.aggregation)} of ${chart.y} by ${chart.x}`}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {chart.data.length} data points
                </p>
              </div>

              <Chart
                type={chartType}
                data={chart.data}
              />
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>
    </section>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-zinc-200 bg-surface px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400"
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface ChartProps {
  type: ChartType;
  data: Array<{
    x: string | number | null;
    y: number;
  }>;
}

function Chart({
  type,
  data,
}: ChartProps) {
  const normalizedData = data.map(
    (point) => ({
      ...point,
      x:
        point.x === null
          ? "Missing"
          : String(point.x),
    }),
  );

  if (type === "line") {
    return (
      <div className="h-[340px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={normalizedData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="x"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
            />

            <Tooltip contentStyle={{ background: "var(--surface)", borderColor: "var(--color-zinc-200)", borderRadius: 12, color: "var(--color-zinc-900)" }} itemStyle={{ color: "var(--accent-ink)" }} cursor={{ stroke: "var(--color-zinc-300)", fill: "var(--accent-soft)" }} />

            <Line
              type="monotone"
              dataKey="y"
              stroke="var(--accent-ink)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[340px]">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart data={normalizedData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="x"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            tick={{ fontSize: 12 }}
          />

          <Tooltip contentStyle={{ background: "var(--surface)", borderColor: "var(--color-zinc-200)", borderRadius: 12, color: "var(--color-zinc-900)" }} itemStyle={{ color: "var(--accent-ink)" }} cursor={{ stroke: "var(--color-zinc-300)", fill: "var(--accent-soft)" }} />

          <Bar
            dataKey="y"
            fill="var(--accent-ink)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[390px] flex-col items-center justify-center text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
        <BarChart3 size={20} />
      </div>

      <p className="mt-3 text-sm font-medium text-zinc-700">
        Configure your chart
      </p>

      <p className="mt-1 max-w-xs text-sm text-zinc-500">
        Select X and Y columns to visualize the
        transformed dataset.
      </p>
    </div>
  );
}

function formatAggregation(
  aggregation: ChartAggregation,
) {
  switch (aggregation) {
    case "sum":
      return "Sum";

    case "average":
      return "Average";

    case "count":
      return "Count";
  }
}