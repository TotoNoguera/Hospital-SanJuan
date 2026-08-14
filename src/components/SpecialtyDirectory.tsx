"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import SpecialtyCard, { type SpecialtyCardData } from "./SpecialtyCard";

const FILTERS = [
  { key: "all", label: "Todas" },
  { key: "online", label: "Reserva online" },
  { key: "assisted", label: "Con orden médica / presencial" },
] as const;

export default function SpecialtyDirectory({ specialties }: { specialties: SpecialtyCardData[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");

  const filtered = useMemo(() => {
    return specialties.filter((s) => {
      const matchesQuery = s.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "online" && s.bookingMode === "ONLINE") ||
        (filter === "assisted" && s.bookingMode === "ASSISTED");
      return matchesQuery && matchesFilter;
    });
  }, [specialties, query, filter]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar especialidad…"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-4 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "border border-border text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted">
          No encontramos especialidades con ese criterio.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SpecialtyCard key={s.id} specialty={s} />
          ))}
        </div>
      )}
    </div>
  );
}
