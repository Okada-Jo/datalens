import { useLocale } from "./i18n";
import { Route, Routes } from "react-router-dom";

import HomePage from "./routes/Home";
import { DatasetOverviewPage } from "./routes/DatasetOverviewPage";
import { DatasetExplorePage } from "./routes/DatasetExplorerPage";
import { DatasetLayout } from "./routes/DatasetLayout";
import { DatasetCleanPage } from "./routes/DatasetCleanPage";
import { DatasetExportPage } from "./routes/DatasetExportPage";
import { DatasetVisualizePage } from "./routes/DataVisualizePage";

export default function App() {
  useLocale();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/datasets/:datasetId"
        element={<DatasetLayout />}
      >
        <Route
          index
          element={<DatasetOverviewPage />}
        />

        <Route
          path="explore"
          element={<DatasetExplorePage />}
        />
        <Route
          path="clean"
          element={<DatasetCleanPage />}
        />
        <Route
          path="export"
          element={<DatasetExportPage />}
        />
        <Route
          path="visualize"
          element={<DatasetVisualizePage />}
        />
      </Route>
    </Routes>
  );
}