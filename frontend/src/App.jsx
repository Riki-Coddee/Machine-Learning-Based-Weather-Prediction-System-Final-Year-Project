import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PredictionPage from "./pages/PredictionPage";
import HistoricalData from "./pages/HistoricalData";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/historical" element={<HistoricalData />} />
      </Routes>
    </ScrollToTop>
  );
}

export default App;
