import { Trash2 } from "lucide-react";

import { useDeleteTransformation } from "../hooks/useTransformations";

import type {
  Transformation,
} from "../schemas/transformation";

interface TransformationHistoryProps {
  datasetId: string;
  transformations: Transformation[];
}

export function TransformationHistory({
  datasetId,
  transformations,
}: TransformationHistoryProps) {
  const deleteTransformation =
    useDeleteTransformation(datasetId);

  if (transformations.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-500">
        No transformations have been applied yet.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      {transformations.map((transformation, index) => (
        <div
          key={transformation.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4"
        >
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {index + 1}.{" "}
              {getTransformationTitle(
                transformation,
              )}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              {getTransformationDescription(
                transformation,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              deleteTransformation.mutate(
                transformation.id,
              )
            }
            disabled={
              deleteTransformation.isPending
            }
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function getTransformationTitle(
  transformation: Transformation,
): string {
  switch (transformation.type) {
    case "fill_missing":
      return "Fill missing values";

    case "rename_column":
      return "Rename column";

    case "replace_value":
      return "Replace value";

    case "delete_column":
      return "Delete column";
  }
}

function getTransformationDescription(
  transformation: Transformation,
): string {
  const config = transformation.config;

  switch (transformation.type) {
    case "fill_missing":
      return `${String(config.column)} → ${String(
        config.value,
      )}`;

    case "rename_column":
      return `${String(config.column)} → ${String(
        config.new_name,
      )}`;

    case "replace_value":
      return `${String(config.column)}: ${String(
        config.old_value,
      )} → ${String(config.new_value)}`;

    case "delete_column":
      return String(config.column);
  }
}