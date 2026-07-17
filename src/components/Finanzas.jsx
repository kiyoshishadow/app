import React, { useState, useMemo } from 'react';
import { generateId, formatCurrency, getTodayString } from '../utils/helpers';

const INCOME_CATEGORIES = ["Salario", "Freelance", "Regalo", "Venta", "Otro"];
const EXPENSE_CATEGORIES = ["Comida", "Transporte", "Ropa", "Belleza", "Salud", "Entretenimiento", "Hogar", "Otro"];

export const CATEGORY_ICONS = {
  Salario: "💼",
  Freelance: "💻",
  Regalo: "🎁",
  Venta: "🛍️",
  Comida: "🍓",
  Transporte: "🚌",
  Ropa: "👗",
  Belleza: "💄",
  Salud: "💊",
  Entretenimiento: "🎬",
  Hogar: "🏡",
  Otro: "✨"
};

export function Finanzas({ finances = [], setFinances, initialBalance = 0, setInitialBalance }) {
  const [isEditingInitial, setIsEditingInitial] = useState(false);
  const [initialInput, setInitialInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newMovement, setNewMovement] = useState({
    type: "expense",
    amount: "",
    category: "Comida",
    note: "",
    date: getTodayString()
  });

  const stats = useMemo(() => {
    const income = finances
      .filter(item => item.type === "income")
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const expense = finances
      .filter(item => item.type === "expense")
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return {
      income,
      expense,
      movement: income - expense,
      balance: initialBalance + income - expense
    };
  }, [finances, initialBalance]);

  const filteredMovements = useMemo(() => {
    const list = filter === "all" ? finances : finances.filter(item => item.type === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [finances, filter]);

  const categoryExpenses = useMemo(() => {
    const map = new Map();
    finances
      .filter(item => item.type === "expense")
      .forEach(item => {
        map.set(item.category, (map.get(item.category) || 0) + (Number(item.amount) || 0));
      });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [finances]);

  const maxExpense = categoryExpenses[0]?.[1] || 1;

  function handleAddMovement() {
    const amt = parseFloat(newMovement.amount);
    if (!amt || amt <= 0) return;

    const item = {
      id: generateId(),
      type: newMovement.type,
      amount: amt,
      category: newMovement.category,
      note: newMovement.note.trim(),
      date: newMovement.date
    };

    setFinances(prev => [item, ...prev]);
    setNewMovement({
      type: newMovement.type,
      amount: "",
      category: newMovement.type === "income" ? "Salario" : "Comida",
      note: "",
      date: getTodayString()
    });
    setIsModalOpen(false);
  }

  function handleDelete(id) {
    setFinances(prev => prev.filter(item => item.id !== id));
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-soft)" }}>Saldo actual</p>
          <h2 className="font-display text-6xl leading-none" style={{ color: stats.balance >= 0 ? "var(--accent)" : "var(--bad)" }}>
            {formatCurrency(stats.balance)}
          </h2>
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            Saldo inicial + ingresos − gastos
          </p>
        </div>
        <button className="btn fab-shadow" onClick={() => setIsModalOpen(true)}>
          + Añadir
        </button>
      </header>

      <div className="card flex items-center gap-3 p-4 pop-in" style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--surface))" }}>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl" style={{ background: "var(--surface)" }}>
          💰
        </div>
        <div className="flex-1">
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            Saldo inicial / ahorro previo
          </p>
          {isEditingInitial ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                className="input py-1 text-sm"
                value={initialInput}
                autoFocus
                onChange={e => setInitialInput(e.target.value)}
              />
              <button
                className="btn py-1 text-xs"
                onClick={() => {
                  const val = parseFloat(initialInput);
                  setInitialBalance(isNaN(val) ? 0 : val);
                  setIsEditingInitial(false);
                }}
              >
                ✓
              </button>
              <button className="btn btn-ghost py-1 text-xs" onClick={() => setIsEditingInitial(false)}>
                ✕
              </button>
            </div>
          ) : (
            <p className="font-display text-2xl" style={{ color: "var(--text)" }}>
              {formatCurrency(initialBalance)}
            </p>
          )}
        </div>
        {!isEditingInitial && (
          <button
            className="btn btn-ghost text-sm"
            onClick={() => {
              setInitialInput(String(initialBalance));
              setIsEditingInitial(true);
            }}
            aria-label="editar saldo inicial"
          >
            ✏️
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-[11px]" style={{ color: "var(--text-soft)" }}>Ingresos</p>
          <p className="font-display text-2xl" style={{ color: "var(--good)" }}>
            {formatCurrency(stats.income)}
          </p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-[11px]" style={{ color: "var(--text-soft)" }}>Gastos</p>
          <p className="font-display text-2xl" style={{ color: "var(--bad)" }}>
            {formatCurrency(stats.expense)}
          </p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-[11px]" style={{ color: "var(--text-soft)" }}>Movimiento</p>
          <p className="font-display text-2xl" style={{ color: stats.movement >= 0 ? "var(--good)" : "var(--bad)" }}>
            {stats.movement >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(stats.movement))}
          </p>
        </div>
      </div>

      {categoryExpenses.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 font-semibold">Gastos por categoría</h3>
          <div className="space-y-2">
            {categoryExpenses.map(([cat, amt]) => (
              <div key={cat}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{CATEGORY_ICONS[cat] || "✨"} {cat}</span>
                  <span style={{ color: "var(--text-soft)" }}>{formatCurrency(amt)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(amt / maxExpense) * 100}%`,
                      background: "linear-gradient(90deg, var(--accent), var(--accent-2))"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {["all", "income", "expense"].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className="chip cursor-pointer"
            style={{
              background: filter === type ? "var(--accent)" : "var(--accent-soft)",
              color: filter === type ? "white" : "var(--text)"
            }}
          >
            {type === "all" ? "Todo" : type === "income" ? "Ingresos" : "Gastos"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredMovements.length === 0 && (
          <p className="py-8 text-center text-sm" style={{ color: "var(--text-soft)" }}>
            Aún no hay movimientos. ¡Añade el primero! 💕
          </p>
        )}
        {filteredMovements.map(item => (
          <div key={item.id} className="card flex items-center gap-3 p-3 pop-in">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl" style={{ background: "var(--accent-soft)" }}>
              {CATEGORY_ICONS[item.category] || "✨"}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{item.category}</p>
              <p className="text-xs" style={{ color: "var(--text-soft)" }}>
                {item.note || "—"} · {item.date}
              </p>
            </div>
            <div className="font-display text-2xl" style={{ color: item.type === "income" ? "var(--good)" : "var(--bad)" }}>
              {item.type === "income" ? "+" : "−"}{formatCurrency(item.amount)}
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-xs cursor-pointer" style={{ color: "var(--text-soft)" }} aria-label="eliminar">
              ✕
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="card w-full max-w-md p-5 pop-in"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display mb-3 text-3xl" style={{ color: "var(--accent)" }}>
              Nuevo movimiento
            </h3>
            <div className="mb-3 flex gap-2">
              {["income", "expense"].map(type => (
                <button
                  key={type}
                  className="chip flex-1 justify-center py-2 cursor-pointer"
                  style={{
                    background: newMovement.type === type ? "var(--accent)" : "var(--surface-2)",
                    color: newMovement.type === type ? "white" : "var(--text)"
                  }}
                  onClick={() => setNewMovement({
                    ...newMovement,
                    type,
                    category: type === "income" ? "Salario" : "Comida"
                  })}
                >
                  {type === "income" ? "Ingreso" : "Gasto"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="number"
                inputMode="decimal"
                placeholder="Monto"
                className="input text-lg"
                value={newMovement.amount}
                onChange={e => setNewMovement({ ...newMovement, amount: e.target.value })}
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(newMovement.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                  <button
                    key={cat}
                    className="chip w-full justify-center cursor-pointer"
                    style={{
                      background: newMovement.category === cat ? "var(--accent)" : "var(--surface-2)",
                      color: newMovement.category === cat ? "white" : "var(--text)"
                    }}
                    onClick={() => setNewMovement({ ...newMovement, category: cat })}
                  >
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                className="input"
                placeholder="Nota (opcional)"
                value={newMovement.note}
                onChange={e => setNewMovement({ ...newMovement, note: e.target.value })}
              />

              <input
                type="date"
                className="input"
                value={newMovement.date}
                onChange={e => setNewMovement({ ...newMovement, date: e.target.value })}
              />

              <div className="flex gap-2 pt-2">
                <button className="btn btn-ghost flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button className="btn flex-1" onClick={handleAddMovement}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
