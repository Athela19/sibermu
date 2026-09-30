"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import {
  CREDITS_ENDPOINT,
  FALLBACK_CREDITS,
  type CreditsData,
} from "@/lib/credits";

export default function CreditsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<CreditsData>(FALLBACK_CREDITS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(CREDITS_ENDPOINT, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: CreditsData = await res.json();
      if (json && json.categories) {
        setData(json);
      }
    } catch {
      // Fallback ke data offline jika endpoint belum aktif/down
      setError("Gagal memuat data live, menampilkan data lokal.");
      setData(FALLBACK_CREDITS);
    } finally {
      setLoading(false);
    }
  }, []);

  const openModal = () => {
    setIsOpen(true);
    fetchCredits();
  };

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle ESC key & lock body scroll saat modal aktif
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, closeModal]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="group inline-flex items-center gap-1.5 font-sans text-xs text-white underline-offset-4 transition hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        aria-haspopup="dialog"
      >
        <span>Sumber & Kredit Aset</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="credits-modal-title"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#121E43] shadow-2xl shadow-black/60">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3
                  id="credits-modal-title"
                  className="font-display text-xl font-semibold text-white sm:text-2xl"
                >
                  {data.title}
                </h3>
                <p className="mt-1 font-sans text-xs text-white/60">
                  {data.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchCredits}
                  disabled={loading}
                  title="Muat ulang dari server"
                  className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                  aria-label="Refresh data"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Tutup dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Error / Offline Notice */}
            {error && (
              <div className="bg-amber-500/10 px-6 py-2 text-center font-sans text-xs text-amber-200/80">
                {error}
              </div>
            )}

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {loading && !data.categories.length ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3 text-white/60">
                  <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                  <span className="font-sans text-sm">Mengambil data dari {CREDITS_ENDPOINT}...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.categories.map((category) => (
                    <div key={category.name} className="space-y-2.5">
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-secondary">
                        {category.name}
                      </h4>
                      <ul className="space-y-2">
                        {category.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex flex-col justify-between gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.06] sm:flex-row sm:items-center sm:gap-4"
                          >
                            <span className="font-sans text-sm font-medium text-white/90">
                              {item.name}
                            </span>
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-sans text-xs text-white/60 hover:text-secondary hover:underline"
                              >
                                <span>{item.source}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="font-sans text-xs text-white/50">
                                {item.source}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-6 py-3.5">
              <span className="font-sans text-[11px] text-white/40">
                API: <code className="text-white/60">{CREDITS_ENDPOINT}</code>
              </span>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-white/10 px-4 py-1.5 font-sans text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
