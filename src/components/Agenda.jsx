import React, { useState, useMemo } from 'react';
import { generateId, getTodayString, getCalendarCells } from '../utils/helpers';

export const EVENT_TYPES = {
  evento: { label: "Evento", emoji: "📌", color: "var(--accent)" },
  examen: { label: "Examen", emoji: "📚", color: "var(--warn)" },
  recordatorio: { label: "Recordatorio", emoji: "🔔", color: "var(--accent-2)" },
  cumpleaños: { label: "Cumpleaños", emoji: "🎂", color: "var(--bad)" }
};

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS_OF_WEEK = ["L", "M", "X", "J", "V", "S", "D"];

export function Agenda({ agenda = [], setAgenda }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTemplate, setEventTemplate] = useState({ id: "", title: "", date: getTodayString(), kind: "evento" });

  const cells = useMemo(() => getCalendarCells(year, month), [year, month]);
  const today = getTodayString();

  const selectedDayEvents = useMemo(() => {
    const selDay = selectedDate.slice(5);
    return agenda
      .filter(item => (item.repeatYearly && item.date.slice(5) === selDay) || item.date === selectedDate)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [selectedDate, agenda]);

  function handlePrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  }

  function handleOpenAddModal() {
    setEventTemplate({ id: "", title: "", date: selectedDate, kind: "evento" });
    setIsModalOpen(true);
  }

  function handleSaveEvent() {
    if (!eventTemplate.title.trim()) return;

    if (eventTemplate.id) {
      setAgenda(prev => prev.map(item => item.id === eventTemplate.id ? eventTemplate : item));
    } else {
      setAgenda(prev => [...prev, { ...eventTemplate, id: generateId() }]);
    }
    setIsModalOpen(false);
  }

  function handleDelete(id) {
    setAgenda(prev => prev.filter(item => item.id !== id));
  }

  function getFullDateString(day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-soft)" }}>Mi agenda</p>
          <h2 className="font-display text-5xl" style={{ color: "var(--accent)" }}>
            {MONTHS[month]} {year}
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={handlePrevMonth} aria-label="anterior">
            ‹
          </button>
          <button className="btn btn-ghost" onClick={handleNextMonth} aria-label="siguiente">
            ›
          </button>
          <button className="btn fab-shadow" onClick={handleOpenAddModal}>
            +
          </button>
        </div>
      </header>

      <div className="card p-4">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold" style={{ color: "var(--text-soft)" }}>
          {DAYS_OF_WEEK.map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;

            const dateStr = getFullDateString(day);
            const shortDateStr = dateStr.slice(5);

            const hasEvents = agenda.some(item =>
              (item.repeatYearly && item.date.slice(5) === shortDateStr) || item.date === dateStr
            );

            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;

            const dayEventsList = agenda.filter(item =>
              (item.repeatYearly && item.date.slice(5) === shortDateStr) || item.date === dateStr
            );

            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDate(dateStr)}
                className={`day-cell ${isToday ? "today" : ""} ${hasEvents ? "has-event" : ""}`}
                style={{
                  outline: isSelected ? "3px solid var(--accent)" : "none",
                  outlineOffset: "1px"
                }}
              >
                {day}
                {dayEventsList.length > 0 && (
                  <span className="absolute right-1 top-1 text-[10px]" style={{ color: "var(--accent)" }}>
                    {dayEventsList.slice(0, 2).map(item => EVENT_TYPES[item.kind]?.emoji).join("")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">
          {new Date(selectedDate + "T00:00:00").toLocaleDateString("es", {
            weekday: "long",
            day: "numeric",
            month: "long"
          })}
        </h3>
        {selectedDayEvents.length === 0 ? (
          <p className="py-6 text-center text-sm" style={{ color: "var(--text-soft)" }}>
            Sin eventos. Toca + para añadir uno 🌷
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDayEvents.map(item => {
              const info = EVENT_TYPES[item.kind] || EVENT_TYPES.evento;
              return (
                <div key={item.id} className="card flex items-center gap-3 p-3 pop-in">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl" style={{ background: info.color + "33" }}>
                    {info.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-soft)" }}>
                      {info.label} · {item.time || "todo el día"}
                      {item.repeatYearly ? " · cada año" : ""}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEventTemplate(item);
                      setIsModalOpen(true);
                    }}
                    className="text-xs cursor-pointer"
                    style={{ color: "var(--text-soft)" }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs cursor-pointer"
                    style={{ color: "var(--text-soft)" }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="card w-full max-w-md p-5 pop-in m-auto max-h-[85vh] flex flex-col overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display mb-3 text-3xl flex-shrink-0" style={{ color: "var(--accent)" }}>
              {eventTemplate.id ? "Editar" : "Nuevo"} evento
            </h3>
            <div className="space-y-3">
              <input
                className="input"
                placeholder="Título"
                value={eventTemplate.title}
                onChange={e => setEventTemplate({ ...eventTemplate, title: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="input"
                  value={eventTemplate.date}
                  onChange={e => setEventTemplate({ ...eventTemplate, date: e.target.value })}
                />
                <input
                  type="time"
                  className="input"
                  value={eventTemplate.time || ""}
                  onChange={e => setEventTemplate({ ...eventTemplate, time: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(EVENT_TYPES).map(kind => (
                  <button
                    key={kind}
                    className="chip cursor-pointer"
                    style={{
                      background: eventTemplate.kind === kind ? EVENT_TYPES[kind].color : "var(--surface-2)",
                      color: eventTemplate.kind === kind ? "white" : "var(--text)"
                    }}
                    onClick={() => setEventTemplate({ ...eventTemplate, kind })}
                  >
                    {EVENT_TYPES[kind].emoji} {EVENT_TYPES[kind].label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!eventTemplate.repeatYearly}
                  onChange={e => setEventTemplate({ ...eventTemplate, repeatYearly: e.target.checked })}
                />
                Se repite cada año (ej. cumpleaños)
              </label>
              <textarea
                className="input"
                rows={2}
                placeholder="Nota (opcional)"
                value={eventTemplate.note || ""}
                onChange={e => setEventTemplate({ ...eventTemplate, note: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <button className="btn btn-ghost flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button className="btn flex-1" onClick={handleSaveEvent}>
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
