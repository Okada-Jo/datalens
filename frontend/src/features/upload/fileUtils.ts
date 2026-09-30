const MAX_FILE_SIZE = 25 * 1024 * 1024;

export type FileValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateCsvFile(file: File): FileValidationResult {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return {
      valid: false,
      error: "Please select a CSV file.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "The file must be smaller than 25 MB.",
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "The file is empty.",
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));

  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}