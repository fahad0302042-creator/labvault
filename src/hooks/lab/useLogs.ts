"use client";

import { useCallback, useEffect, useState } from "react";
import { getLogs } from "@/lib/lab/storage";
import type { ConsumptionLog } from "@/lib/lab/types";

export function useLogs() {
  const [logs, setLogs] = useState<ConsumptionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLogs(getLogs());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    // Re-read on window focus so logs added elsewhere surface immediately.
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return { logs, loading, refresh };
}
