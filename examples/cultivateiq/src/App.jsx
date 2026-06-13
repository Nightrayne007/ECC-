import { useState } from "react";
import { COLORS } from "./constants/theme.js";
import { globalCSS } from "./constants/global-css.js";
import { Sidebar } from "./components/Sidebar.jsx";
import { Dashboard } from "./views/Dashboard.jsx";
import { ComplianceCopilot } from "./views/ComplianceCopilot.jsx";
import { PermitAccelerator } from "./views/PermitAccelerator.jsx";
import { CultivationLog } from "./views/CultivationLog.jsx";
import { GrowJourney } from "./views/GrowJourney.jsx";
import { ReportBuilder } from "./views/ReportBuilder.jsx";
import { AuditReadiness } from "./views/AuditReadiness.jsx";
import { ReformTracker } from "./views/ReformTracker.jsx";
import { IntelFeed } from "./views/IntelFeed.jsx";
import { useCompliance } from "./hooks/useCompliance.js";
import { useAlerts } from "./hooks/useAlerts.js";

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [journeyBatchId, setJourneyBatchId] = useState(null);

  const { tasks, batches, complianceScore, completeTask, snoozeTask, addTask, advanceBatchStage, addBatch } = useCompliance();
  const { alerts, leadDays, setLeadDays } = useAlerts({ tasks });

  const askCopilot = (prompt) => {
    setPendingPrompt(prompt);
    setActive("copilot");
  };

  const openJourney = (batchId) => {
    setJourneyBatchId(batchId);
    setActive("growjourney");
  };

  const VIEW = {
    dashboard: (
      <Dashboard
        setActive={setActive}
        tasks={tasks}
        batches={batches}
        complianceScore={complianceScore}
        completeTask={completeTask}
        snoozeTask={snoozeTask}
        addTask={addTask}
      />
    ),
    copilot: <ComplianceCopilot pendingPrompt={pendingPrompt} onPromptConsumed={() => setPendingPrompt(null)} />,
    permit: <PermitAccelerator />,
    batches: <CultivationLog batches={batches} addBatch={addBatch} openJourney={openJourney} />,
    growjourney: (
      <GrowJourney
        batches={batches}
        advanceBatchStage={advanceBatchStage}
        selectedId={journeyBatchId}
        setSelectedId={setJourneyBatchId}
      />
    ),
    reports: <ReportBuilder tasks={tasks} batches={batches} />,
    audit: <AuditReadiness tasks={tasks} batches={batches} />,
    reforms: <ReformTracker onAskCopilot={askCopilot} />,
    intel: <IntelFeed onAskCopilot={askCopilot} />,
  };

  return (
    <>
      <style>{globalCSS}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
        <Sidebar active={active} setActive={setActive} alerts={alerts} leadDays={leadDays} setLeadDays={setLeadDays} />
        <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {VIEW[active]}
        </main>
      </div>
    </>
  );
}
