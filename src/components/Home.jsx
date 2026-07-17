import React from 'react';
import { formatCurrency, getTodayString, calculateCycleStats } from '../utils/helpers';

export function Home({ setTab, finances = [], agenda = [], cycle = null, diary = [] }) {
  const incomes = finances
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const expenses = finances
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const today = getTodayString();
  const nextEvent = [...agenda]
    .filter(item => item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const cycleStats = cycle && cycle.cycles && cycle.cycles.length
    ? calculateCycleStats(cycle)
    : null;
  const nextCycleStart = cycleStats ? cycleStats.nextStart : null;

  const quotes = [
    "Hoy también cuenta, aunque avances poquito 🌷",
    "Tu espacio, tus ritmos, tus recuerdos 💕",
    "Respira suavecito. Lo estás haciendo bien 🌿",
    "Hay días pequeños que guardan cosas bonitas ✨"
  ];
  const quote = quotes[new Date().getDate() % 4];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
          Un vistazo suavecito a tu día
        </p>
        <h2 className="font-display text-5xl" style={{ color: "var(--accent)" }}>
          Hola, Rimi <span className="wave">👋</span>
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>
          {quote}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <button className="card p-4 text-left pop-in" onClick={() => setTab("agenda")}>
          <div className="text-3xl">💕</div>
          <p className="font-semibold">Mi día</p>
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            {nextEvent ? `${nextEvent.title} · ${nextEvent.date}` : "Hoy está tranquilito 🌿"}
          </p>
        </button>

        <button className="card p-4 text-left pop-in" onClick={() => setTab("finanzas")}>
          <div className="text-3xl">🐷</div>
          <p className="font-semibold">Mi bolsillo</p>
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            Te quedan {formatCurrency(incomes - expenses)}
          </p>
        </button>

        <button className="card p-4 text-left pop-in" onClick={() => setTab("ciclo")}>
          <div className="text-3xl">🌸</div>
          <p className="font-semibold">Mi ciclo</p>
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            {nextCycleStart ? `Podría llegar el ${nextCycleStart}` : "Registra tus fechas cuando quieras"}
          </p>
        </button>

        <button className="card p-4 text-left pop-in" onClick={() => setTab("diario")}>
          <div className="text-3xl">📖</div>
          <p className="font-semibold">Mi diario</p>
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            {diary.length ? `${diary.length} página${diary.length === 1 ? "" : "s"} guardaditas` : "Esperando tus palabras"}
          </p>
        </button>
      </div>

      <div className="card p-5" style={{ background: "linear-gradient(135deg,var(--accent-soft),var(--surface))" }}>
        <h3 className="font-display text-3xl" style={{ color: "var(--accent)" }}>
          ¿Qué quieres hacer?
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn" onClick={() => setTab("finanzas")}>
            💰 Anotar
          </button>
          <button className="btn btn-ghost" onClick={() => setTab("agenda")}>
            📅 Planear
          </button>
          <button className="btn btn-ghost" onClick={() => setTab("diario")}>
            📖 Escribir
          </button>
          <button className="btn btn-ghost" onClick={() => setTab("ciclo")}>
            🌸 Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
