import { useState } from "react";

import type { TransformationType } from "../schemas/transformation";
import { useCreateTransformation } from "../hooks/useTransformations";

interface TransformationFormProps {
  datasetId: string;
  columns: string[];
}

export function TransformationForm({
  datasetId,
  columns,
}: TransformationFormProps) {
  const createTransformation = useCreateTransformation(datasetId);

  const [type, setType] =
    useState<TransformationType>("fill_missing");

  const [columnName, setColumnName] = useState("");
  const [value, setValue] = useState("");
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");

  function resetFields() {
    setColumnName("");
    setValue("");
    setOldValue("");
    setNewValue("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!columnName) {
      return;
    }

    let config: Record<string, unknown>;

    switch (type) {
      case "fill_missing":
        config = {
          column: columnName,
          value,
        };
        break;

      case "rename_column":
        config = {
          column: columnName,
          new_name: newValue,
        };
        break;

      case "replace_value":
        config = {
          column: columnName,
          old_value: oldValue,
          new_value: newValue,
        };
        break;

      case "delete_column":
        config = {
          column: columnName,
        };
        break;
    }

    await createTransformation.mutateAsync({
      type,
      config,
    });

    resetFields();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 rounded-lg border border-zinc-200 p-4"
    >
      <div>
        <label
          htmlFor="transformation-type"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Operation
        </label>

        <select
          id="transformation-type"
          value={type}
          onChange={(event) => {
            setType(event.target.value as TransformationType);
            resetFields();
          }}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="fill_missing">Fill missing values</option>
          <option value="rename_column">Rename column</option>
          <option value="replace_value">Replace value</option>
          <option value="delete_column">Delete column</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="column"
          className="mb-1 block text-sm font-medium text-zinc-700"
        >
          Column
        </label>

        <select
          id="column"
          value={columnName}
          onChange={(event) => setColumnName(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">Select a column</option>

          {columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>

      {type === "fill_missing" && (
        <TextField
          label="Replacement value"
          value={value}
          onChange={setValue}
        />
      )}

      {type === "rename_column" && (
        <TextField
          label="New column name"
          value={newValue}
          onChange={setNewValue}
        />
      )}

      {type === "replace_value" && (
        <>
          <TextField
            label="Value to replace"
            value={oldValue}
            onChange={setOldValue}
          />

          <TextField
            label="New value"
            value={newValue}
            onChange={setNewValue}
          />
        </>
      )}

      {type === "delete_column" && (
        <p className="text-sm text-zinc-500">
          The selected column will be removed from the transformed dataset.
        </p>
      )}

      <button
        type="submit"
        disabled={!columnName || createTransformation.isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {createTransformation.isPending
          ? "Applying..."
          : "Apply transformation"}
      </button>
    </form>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TextField({
  label,
  value,
  onChange,
}: TextFieldProps) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-zinc-700"
      >
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
    </div>
  );
}