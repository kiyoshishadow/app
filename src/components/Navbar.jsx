import React from 'react';

export const kp = [
  { key: "inicio", label: "Inicio", emoji: "🏡" },
  { key: "finanzas", label: "Dinero", emoji: "💰" },
  { key: "agenda", label: "Agenda", emoji: "📅" },
  { key: "ciclo", label: "Ciclo", emoji: "🌸" },
  { key: "diario", label: "Diario", emoji: "📖" },
  { key: "config", label: "Ajustes", emoji: "⚙️" }
];

export function Navbar({ tab, setTab, children }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-xl flex-col pb-24">
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="relative h-10 w-10 overflow-hidden rounded-full border-2"
            style={{ borderColor: "var(--accent)" }}
          >
            <div
              role="img"
              aria-label="Rimi"
              className="absolute inset-0 flex items-center justify-center text-2xl"
              style={{ background: "var(--accent-soft)" }}
            >
              🌸
            </div>
          </div>
          <div>
            <p className="font-display text-2xl leading-none" style={{ color: "var(--accent)" }}>
              Rimi
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-soft)" }}>
              Mi espacio personal
            </p>
          </div>
        </div>
        <button className="btn btn-ghost text-sm" onClick={() => setTab("config")}>
          ⚙️
        </button>
      </header>

      <main className="flex-1 px-4 pt-2">
        {children}
      </main>

      <nav className="bottom-nav fixed bottom-0 left-1/2 z-30 w-full max-w-xl -translate-x-1/2 px-3" aria-label="navegación">
        <div className="card flex items-center justify-between gap-1 p-2" style={{ borderRadius: 28 }}>
          {kp.map(x => {
            const isActive = tab === x.key;
            return (
              <button
                key={x.key}
                onClick={() => setTab(x.key)}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-semibold transition"
                style={{
                  background: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "white" : "var(--text-soft)",
                  transform: isActive ? "translateY(-2px)" : "none"
                }}
              >
                <span className="text-xl">{x.emoji}</span>
                {x.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
