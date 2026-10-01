import { useMutation } from "@tanstack/react-query";
import { useSample } from "../../lib/api";
import { queryClient } from "../../lib/queryClient";
import { SampleDatasets } from "./SampleDatasets";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import UploadDropzone from "./UploadDropzone";
import { useUploadDataset } from "./mutations";

export default function UploadDataset() {
  const [file, setFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const upload = useUploadDataset();
  const sample = useMutation({
    mutationFn: useSample,
    onSuccess: (dataset) => {
      queryClient.setQueryData(["datasets", dataset.id], dataset);
      void queryClient.invalidateQueries({ queryKey: ["datasets"] });
      navigate(`/datasets/${dataset.id}`);
    },
  });
  const busy = upload.isPending || sample.isPending;

  function handleUpload() {
    if (!file || busy) {
      return;
    }

    upload.mutate(file, {
      onSuccess: (dataset) => {
        navigate(`/datasets/${dataset.id}`);
      },
    });
  }

  function handleFileSelect(selectedFile: File) {
    upload.reset();
    sample.reset();
    setFile(selectedFile);
  }

  function handleFileClear() {
    upload.reset();
    sample.reset();
    setFile(null);
  }

  return (
    <div className="w-full">
      <UploadDropzone
        file={file}
        onFileSelect={handleFileSelect}
        onFileClear={handleFileClear}
        disabled={busy}
      />

      {upload.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {upload.error.message}
        </div>
      )}

      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {upload.isPending ? (
            <>
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
              Analyzing dataset...
            </>
          ) : (
            "Explore dataset"
          )}
        </button>
      )}
      {sample.error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{sample.error.message}</p>}
      <SampleDatasets disabled={busy} pendingId={sample.isPending ? sample.variables : undefined}
        onSelect={(id) => { if (!busy) { upload.reset(); sample.mutate(id); } }} />
    </div>
  );
}