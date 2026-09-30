import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  ColumnAnalysis,
} from "../schemas/dataset";

import { useCreateTransformation } from "../hooks/useTransformations";

interface FillMissingFormProps {
  datasetId: string;
  columns: ColumnAnalysis[];
}

export function FillMissingForm({
  datasetId,
  columns,
}: FillMissingFormProps) {
  const [columnName, setColumnName] = useState(
    columns[0]?.name ?? "",
  );

  const [value, setValue] = useState("");

  const createTransformation =
    useCreateTransformation(datasetId);

  useEffect(() => {
    if (!columnName && columns.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColumnName(columns[0].name);
    }
  }, [columns, columnName]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!columnName || value === "") {
      return;
    }

    const selectedColumn = columns.find(
      (column) => column.name === columnName,
    );

    let parsedValue: string | number = value;

    if (selectedColumn?.type === "number") {
      const number = Number(value);

      if (Number.isNaN(number)) {
        return;
      }

      parsedValue = number;
    }

    createTransformation.mutate(
      {
        type: "fill_missing",
        config: {
          column: columnName,
          value: parsedValue,
        },
      },
      {
        onSuccess: () => {
          setValue("");
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-5"
    >
      <div>
        <h3 className="font-medium text-zinc-900">
          Fill missing values
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Replace empty values in a column with a constant value.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">
            Column
          </span>

          <select
            value={columnName}
            onChange={(event) =>
              setColumnName(event.target.value)
            }
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
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
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">
            Replacement value
          </span>

          <input
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
            placeholder="e.g. 0"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        {createTransformation.isError && (
          <p className="text-sm text-red-600">
            Transformation could not be applied.
          </p>
        )}

        <button
          type="submit"
          disabled={
            !columnName ||
            value === "" ||
            createTransformation.isPending
          }
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createTransformation.isPending
            ? "Applying..."
            : "Apply"}
        </button>
      </div>
    </form>
  );
}