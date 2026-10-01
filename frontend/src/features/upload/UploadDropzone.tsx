import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
} from "react";
import { FileSpreadsheet, Upload, X } from "lucide-react";

import {
  formatFileSize,
  validateCsvFile,
} from "./fileUtils";

interface UploadDropzoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  disabled?: boolean;
}

export default function UploadDropzone({
  file,
  onFileSelect,
  onFileClear,
  disabled = false,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] =
    useState<string | null>(null);

  function handleFile(file: File) {
    const result = validateCsvFile(file);

    if (!result.valid) {
      setValidationError(result.error);
      return;
    }

    setValidationError(null);
    onFileSelect(file);
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }

    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  }

  if (file) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <FileSpreadsheet size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-900">
              {file.name}
            </p>

            <p className="mt-0.5 text-sm text-zinc-500">
              {formatFileSize(file.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={onFileClear}
            disabled={disabled}
            className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Remove file"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Choose a CSV file"
        aria-disabled={disabled}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.click();
          }
        }}
        className={[
          "flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-12 text-center transition",
          isDragging
            ? "border-zinc-900 bg-zinc-50"
            : "border-zinc-300 bg-surface hover:border-zinc-400 hover:bg-zinc-50/50",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
          <Upload size={22} />
        </div>

        <p className="mt-5 font-medium text-zinc-900">
          Drop your CSV here
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          or click to choose a file
        </p>

        <p className="mt-5 text-xs text-zinc-400">
          CSV files up to 25 MB
        </p>
      </div>

      {validationError && (
        <p className="mt-3 text-sm text-red-600">
          {validationError}
        </p>
      )}
    </div>
  );
}