import { BrowserRouter, Route, Routes } from "react-router-dom";
import CallDetailPage from "./pages/CallDetailPage";
import CallListPage from "./pages/CallListPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <header className="border-b px-6 py-4" style={{ borderColor: "var(--gridline)" }}>
          <h1 className="text-lg font-semibold">Aegis000 Supervisor Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Phase 1 — automated QA + transcription
          </p>
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<CallListPage />} />
            <Route path="/calls/:callId" element={<CallDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
