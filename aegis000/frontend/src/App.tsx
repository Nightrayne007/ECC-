import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import CallDetailPage from "./pages/CallDetailPage";
import CallListPage from "./pages/CallListPage";
import RadioMonitorPage from "./pages/RadioMonitorPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <header className="border-b px-6 py-4" style={{ borderColor: "var(--gridline)" }}>
          <h1 className="text-lg font-semibold">Aegis000 Supervisor Dashboard</h1>
          <nav className="mt-1 flex gap-4 text-sm">
            <Link to="/" style={{ color: "var(--seq-450)" }}>
              Calls
            </Link>
            <Link to="/radio" style={{ color: "var(--seq-450)" }}>
              Radio Monitor
            </Link>
          </nav>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<CallListPage />} />
            <Route path="/calls/:callId" element={<CallDetailPage />} />
            <Route path="/radio" element={<RadioMonitorPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
