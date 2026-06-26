"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X, FlaskConical, Beaker } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/lab/shared/Badge";
import type { Chemical, Apparatus } from "@/lib/lab/types";

type GlobalSearchProps = {
  open: boolean;
  onClose: () => void;
  chemicals: Chemical[];
  apparatus: Apparatus[];
  onSelectChemical: (id: string) => void;
  onSelectApparatus: (id: string) => void;
};

type SearchResult = {
  id: string;
  name: string;
  sub: string;
  type: "chemical" | "apparatus";
  stock: string;
};

export function GlobalSearch({
  open,
  onClose,
  chemicals,
  apparatus,
  onSelectChemical,
  onSelectApparatus,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const chemResults: SearchResult[] = chemicals
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.formula ?? "").toLowerCase().includes(q),
      )
      .map((c) => ({
        id: c.id,
        name: c.name,
        sub: c.formula ?? "Chemical",
        type: "chemical" as const,
        stock: `${c.quantity} ${c.unit}`,
      }));

    const appResults: SearchResult[] = apparatus
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q),
      )
      .map((a) => ({
        id: a.id,
        name: a.name,
        sub: a.category,
        type: "apparatus" as const,
        stock: `${a.quantity} units`,
      }));

    return [...chemResults, ...appResults].slice(0, 20);
  }, [query, chemicals, apparatus]);

  function handleSelect(r: SearchResult) {
    if (r.type === "chemical") onSelectChemical(r.id);
    else onSelectApparatus(r.id);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            className="relative mt-[10vh] w-full max-w-md px-4"
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-slate-600" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chemicals & apparatus…"
                  className="flex-1 bg-transparent text-sm text-graphite outline-none placeholder:text-slate-600"
                />
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                {query.trim() === "" ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-600">
                    Start typing to search across all inventory.
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-600">
                    No results for "{query}"
                  </div>
                ) : (
                  <ul className="py-1">
                    {results.map((r) => (
                      <li key={`${r.type}-${r.id}`}>
                        <button
                          onClick={() => handleSelect(r)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              r.type === "chemical"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {r.type === "chemical" ? (
                              <FlaskConical className="h-4 w-4" />
                            ) : (
                              <Beaker className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-graphite">
                              {r.name}
                            </p>
                            <p className="truncate text-xs text-slate-700">
                              {r.sub}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge tone="slate">{r.type}</Badge>
                            <span className="font-mono text-xs tabular-nums text-slate-700">
                              {r.stock}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
