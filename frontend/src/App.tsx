import { Route, Routes } from "react-router-dom";

import HomePage from "./routes/Home";
import { DatasetOverviewPage } from "./routes/DatasetOverviewPage";
import { DatasetExplorePage } from "./routes/DatasetExplorerPage";
import { DatasetLayout } from "./routes/DatasetLayout";
import { DatasetCleanPage } from "./routes/DatasetCleanPage";

export default function App() {
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
      </Route>
    </Routes>
  );
}