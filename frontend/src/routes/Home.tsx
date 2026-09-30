import UploadDataset from "../features/upload/UploadDataset";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <span className="text-lg font-semibold tracking-tight text-zinc-900">
            DataLens
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-500">
            CSV DATA EXPLORER
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
            Understand your data in seconds.
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-zinc-500">
            Upload a CSV to inspect its structure, uncover
            data quality issues, and explore your data
            visually.
          </p>
        </div>

        <div className="mt-10">
          <UploadDataset />
        </div>

        <div className="mt-5 flex justify-center gap-6 text-xs text-zinc-400">
          <span>No account required</span>
          <span>•</span>
          <span>Runs locally</span>
          <span>•</span>
          <span>CSV only</span>
        </div>
      </div>
    </main>
  );
}