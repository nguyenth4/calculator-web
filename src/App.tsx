import { Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { NavTabs } from "./components/layout/NavTabs";
import { CalculatorPage } from "./pages/CalculatorPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { PrintersPage } from "./pages/PrintersPage";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <Header />
        <NavTabs />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-20 md:px-6 md:py-6 md:pb-6">
          <Routes>
            <Route path="/" element={<CalculatorPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/printers" element={<PrintersPage />} />
          </Routes>
        </main>
      </ToastProvider>
    </DataProvider>
  );
}

export default App;
