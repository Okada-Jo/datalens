import { Route, Routes } from "react-router-dom";

import HomePage from "./routes/Home";
import DatasetPage from "./routes/DataSet";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/datasets/:datasetId"
        element={<DatasetPage />}
      />
    </Routes>
  );
}