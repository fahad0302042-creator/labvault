"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { BlobBackground } from "@/components/lab/layout/BlobBackground";
import {
  BottomNav,
  type TabKey,
} from "@/components/lab/layout/BottomNav";
import { SidebarNav } from "@/components/lab/layout/SidebarNav";
import { Login } from "@/components/lab/pages/Login";
import { Dashboard } from "@/components/lab/pages/Dashboard";
import { Chemicals } from "@/components/lab/pages/Chemicals";
import { ApparatusPage } from "@/components/lab/pages/Apparatus";
import { Scanner } from "@/components/lab/pages/Scanner";
import { Reports } from "@/components/lab/pages/Reports";

function LabVaultApp() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<TabKey>("dashboard");

  // Signals: let Dashboard's quick actions switch tabs and trigger a modal
  const [addChemicalSignal, setAddChemicalSignal] = useState(0);
  const [addApparatusSignal, setAddApparatusSignal] = useState(0);
  const [scanSignal, setScanSignal] = useState(0);

  const navigate = useCallback((next: TabKey) => setTab(next), []);

  const handleQuickAdd = useCallback((kind: "chemical" | "apparatus") => {
    if (kind === "chemical") {
      setTab("chemicals");
      setAddChemicalSignal((n) => n + 1);
    } else {
      setTab("apparatus");
      setAddApparatusSignal((n) => n + 1);
    }
  }, []);

  const handleQuickScan = useCallback(() => {
    setTab("scanner");
    setScanSignal((n) => n + 1);
  }, []);

  if (loading) {
    return (
      <>
        <BlobBackground />
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-graphite" />
        </div>
      </>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <BlobBackground />
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <SidebarNav active={tab} onChange={navigate} />

        {/* Main content area */}
        <div className="relative flex min-h-screen flex-1 flex-col">
          <main className="safe-top flex-1 pb-28 lg:pb-8">
            {/* On desktop: centered max-w container. On mobile: full width. */}
            <div className="mx-auto w-full max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {tab === "dashboard" && (
                    <Dashboard
                      onNavigate={navigate}
                      onQuickAdd={handleQuickAdd}
                      onQuickScan={handleQuickScan}
                    />
                  )}
                  {tab === "chemicals" && (
                    <Chemicals
                      addSignal={addChemicalSignal}
                      onAddSignalConsumed={() => {}}
                    />
                  )}
                  {tab === "apparatus" && (
                    <ApparatusPage
                      addSignal={addApparatusSignal}
                      onAddSignalConsumed={() => {}}
                    />
                  )}
                  {tab === "scanner" && (
                    <Scanner
                      scanSignal={scanSignal}
                      onScanSignalConsumed={() => {}}
                    />
                  )}
                  {tab === "reports" && <Reports />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Mobile/tablet bottom nav */}
          <BottomNav active={tab} onChange={navigate} />
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LabVaultApp />
    </AuthProvider>
  );
}
