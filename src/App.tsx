import { Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { NavTabs } from "./components/layout/NavTabs";
import { CalculatorPage } from "./pages/CalculatorPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { PrintersPage } from "./pages/PrintersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";
import { useData } from "./context/DataContext";
import { AuthPage } from "./pages/AuthPage";

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

function AppContent() {
  const { currentUser, isLoading } = useData();

  if (isLoading) return <main className="auth-page"><p>Đang tải dữ liệu...</p></main>;
  if (!currentUser) return <AuthPage />;

  return (
    <ToastProvider>
      <Header />
      <NavTabs />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-20 md:px-6 md:py-6 md:pb-6">
        <Routes>
          <Route path="/" element={<CalculatorPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/printers" element={<PrintersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </ToastProvider>
  );
}

export default App;
