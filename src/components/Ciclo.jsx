import React, { useState, useEffect, useMemo } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  getTodayString,
  addDays,
  diffDays,
  getCalendarCells,
  calculateCycleStats,
  getPredictedPeriodDays,
  getPhaseStats,
  formatLongDate,
  formatShortDate
} from '../utils/helpers';

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS_OF_WEEK = ["L", "M", "X", "J", "V", "S", "D"];

export function Ciclo({ cycle = { notify: true, cycles: [], fallbackCycle: 28, fallbackPeriod: 5 }, setCycle }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [errorMessage, setErrorMessage] = useState("");

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState("");
  const [isInProgress, setIsInProgress] = useState(false);
  const [note, setNote] = useState("");

  const stats = useMemo(() => calculateCycleStats(cycle), [cycle]);
  const predictedDays = useMemo(() => getPredictedPeriodDays(cycle, 6), [cycle]);

  const phaseInfo = stats.current ? getPhaseStats(stats.daysIntoCycle, stats.avgCycle, stats.avgPeriod) : null;
  const today = getTodayString();
  const cells = useMemo(() => getCalendarCells(year, month), [year, month]);

  const sortedCyclesDesc = useMemo(() => {
    return [...cycle.cycles].sort((a, b) => b.start.localeCompare(a.start));
  }, [cycle]);

  // Handle older cycle format migration if needed
  useEffect(() => {
    try {
      const legacy = localStorage.getItem("rimi.cycle");
      if (legacy && cycle.cycles.length === 0) {
        const parsed = JSON.parse(legacy);
        if (parsed.lastPeriodStart) {
          const start = parsed.lastPeriodStart;
          const period = parsed.periodLength || 5;
          setCycle({
            ...cycle,
            fallbackCycle: parsed.cycleLength || 28,
            fallbackPeriod: period,
            cycles: [{ id: Math.random().toString(36).slice(2, 10), start, end: addDays(start, period - 1) }]
          });
        }
      }
    } catch (e) {
      console.error("Migration error:", e);
    }
  }, []);

  // Notifications logic
  useEffect(() => {
    if (!cycle.notify || !stats.nextStart || stats.daysUntilNext !== 1) return;

    const notificationKey = `rimi.notified.${stats.nextStart}`;
    if (!localStorage.getItem(notificationKey)) {
      triggerNotification("Rimi 💗", "Mañana comienza tu periodo. Prepárate con cariño.");
      try {
        localStorage.setItem(notificationKey, "1");
      } catch {}
    }
  }, [cycle.notify, stats.nextStart, stats.daysUntilNext]);

  async function triggerNotification(title, body) {
    try {
      const hasPermission = await LocalNotifications.checkPermissions();
      if (hasPermission.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 12345,
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) }
          }
        ]
      });
    } catch (e) {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title, { body });
        } else {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification(title, { body });
            }
          });
        }
      }
    }
  }

  async function requestBrowserNotificationPermission() {
    if (!("Notification" in window)) {
      setErrorMessage("Este dispositivo o navegador no soporta notificaciones.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setErrorMessage("¡Listo! Te avisaré un día antes 💕");
    } else {
      setErrorMessage("Permiso denegado. Actívalo en ajustes del navegador.");
    }
  }

  function handleAddCycle() {
    if (!startDate) return;
    const finalEnd = isInProgress ? undefined : (endDate || undefined);

    if (finalEnd && finalEnd < startDate) {
      setErrorMessage("La fecha de fin no puede ser anterior al inicio.");
      return;
    }

    const newCycleObj = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      start: startDate,
      end: finalEnd,
      note: note.trim()
    };

    setCycle(prev => ({
      ...prev,
      cycles: [...prev.cycles, newCycleObj]
    }));

    setStartDate(getTodayString());
    setEndDate("");
    setIsInProgress(false);
    setNote("");
    setErrorMessage("");
  }

  function handleEndCurrentCycleToday() {
    if (!stats.current || stats.current.end) return;

    setCycle(prev => ({
      ...prev,
      cycles: prev.cycles.map(item => item.id === stats.current.id ? { ...item, end: getTodayString() } : item)
    }));
  }

  function handleDeleteCycle(id) {
    setCycle(prev => ({
      ...prev,
      cycles: prev.cycles.filter(item => item.id !== id)
    }));
  }

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

  function getFullDateString(day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>Mi ciclo</p>
        <h2 className="font-display text-5xl" style={{ color: "var(--accent)" }}>
          {stats.current ? "Te cuido cada mes 🌸" : "Cuéntame sobre tu ciclo"}
        </h2>
      </header>

      {stats.current ? (
        <div className="card relative overflow-hidden p-6 pop-in" style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--surface))" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {stats.inCourse ? (
                <>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Ciclo en curso</p>
                  <p className="font-display text-6xl leading-none" style={{ color: "var(--accent)" }}>Día {stats.daysIntoCycle}</p>
                  {stats.estimatedEnd && (
                    <p className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>
                      Termina aprox. el <b>{formatLongDate(stats.estimatedEnd)}</b> · en {Math.max(0, diffDays(today, stats.estimatedEnd))} día{Math.max(0, diffDays(today, stats.estimatedEnd)) === 1 ? "" : "s"}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Próxima menstruación</p>
                  {stats.nextStart && <p className="font-display text-5xl leading-none" style={{ color: "var(--accent)" }}>{formatLongDate(stats.nextStart)}</p>}
                  <p className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>
                    {stats.daysUntilNext > 0 ? `en ${stats.daysUntilNext} día${stats.daysUntilNext === 1 ? "" : "s"}` : stats.daysUntilNext === 0 ? "¡hoy!" : "registra tu nuevo ciclo"}
                  </p>
                </>
              )}
            </div>
            <div className="text-6xl heartbeat">
              {phaseInfo?.emoji || "🌷"}
            </div>
          </div>

          {phaseInfo && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm" style={{ background: "var(--surface)", color: "var(--text)" }}>
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: phaseInfo.color }} />
              <b>Hoy:</b> {phaseInfo.name} · ciclo de {stats.hasRealCycleData ? "" : "~"}{stats.avgCycle} días · regla de {stats.hasRealPeriodData ? "" : "~"}{stats.avgPeriod} días
            </div>
          )}

          {stats.inCourse && (
            <button className="btn mt-3 w-full cursor-pointer" style={{ background: "var(--good)" }} onClick={handleEndCurrentCycleToday}>
              ✓ Marcar que terminó hoy
            </button>
          )}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <div className="mb-2 text-5xl">🌷</div>
          <p className="font-semibold">Aún no has registrado ningún ciclo</p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
            Añade tu primera fecha de inicio abajo para empezar las predicciones.
          </p>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-display mb-3 text-3xl" style={{ color: "var(--accent)" }}>Registrar ciclo</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block" style={{ color: "var(--text-soft)" }}>Inicio del ciclo</span>
            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block" style={{ color: "var(--text-soft)" }}>🌷 Fin del ciclo <span className="text-xs">(opcional)</span></span>
            <input type="date" className="input" value={endDate} disabled={isInProgress} min={startDate} onChange={e => setEndDate(e.target.value)} style={{ opacity: isInProgress ? .5 : 1 }} />
          </label>
        </div>

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm select-none">
          <input type="checkbox" checked={isInProgress} onChange={e => setIsInProgress(e.target.checked)} />
          <span>Aún no ha terminado <span style={{ color: "var(--text-soft)" }}>(Rimi predecirá el fin con tu promedio)</span></span>
        </label>

        <input type="text" className="input mt-3" placeholder="Nota (ej: mucho cólico, flujo leve…)" value={note} onChange={e => setNote(e.target.value)} />

        <button className="btn mt-3 w-full fab-shadow cursor-pointer" onClick={handleAddCycle} disabled={!startDate}>
          + Añadir a mi historial
        </button>

        {errorMessage && (
          <p className="mt-2 text-xs text-center" style={{ color: "var(--accent)" }}>
            {errorMessage}
          </p>
        )}
        <p className="mt-2 text-xs text-center" style={{ color: "var(--text-soft)" }}>
          Si no recuerdas el fin, déjalo vacío y activa la casilla. Rimi lo estimará por ti.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>Duración promedio del ciclo</p>
          <p className="font-display text-5xl" style={{ color: "var(--accent)" }}>{stats.avgCycle}</p>
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            días · {stats.hasRealCycleData ? "real 📊" : "estimado ✨"}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>Duración promedio de la regla</p>
          <p className="font-display text-5xl" style={{ color: "var(--accent)" }}>{stats.avgPeriod}</p>
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            días · {stats.hasRealPeriodData ? "real 📊" : "estimado ✨"}
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{MONTHS[month]} {year}</h3>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={handlePrevMonth}>‹</button>
            <button className="btn btn-ghost" onClick={handleNextMonth}>›</button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold" style={{ color: "var(--text-soft)" }}>
          {DAYS_OF_WEEK.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;

            const dateStr = getFullDateString(day);
            const pDay = predictedDays[dateStr];
            const isToday = dateStr === today;

            let statusClass = "";
            if (isToday) statusClass += " today";
            if (pDay) {
              if (pDay.kind === "period" || pDay.kind === "period-course") statusClass += " period";
              else if (pDay.kind === "predicted-period") statusClass += " predicted";
              else if (pDay.kind === "ovulation" || pDay.kind === "fertile") statusClass += " fertile";
            }

            return (
              <div
                key={`cell-${day}`}
                className={`day-cell${statusClass}`}
                title={pDay ? (pDay.kind === "period" ? "Menstruación registrada" : pDay.kind === "period-course" ? "En curso" : pDay.kind === "predicted-period" ? "Periodo predicho" : pDay.kind === "ovulation" ? "Ovulación" : "Ventana fértil") : ""}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <LegendItem color="var(--accent)" label="Menstruación" />
          <LegendItem color="var(--accent-2)" label="Próxima (estimada)" striped />
          <LegendItem color="var(--good)" label="Días fértiles / ovulación" />
          <LegendItem color="var(--accent)" label="Hoy" dot />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 font-semibold">Historial ({sortedCyclesDesc.length} ciclo{sortedCyclesDesc.length === 1 ? "" : "s"})</h3>
        {sortedCyclesDesc.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: "var(--text-soft)" }}>Sin ciclos registrados todavía.</p>
        ) : (
          <div className="space-y-2">
            {sortedCyclesDesc.map(item => {
              const dur = item.end ? diffDays(item.start, item.end) + 1 : null;
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl p-3 pop-in" style={{ background: "var(--surface-2)" }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: "var(--accent-soft)" }}>
                    {!item.end ? "🌷" : "🩸"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{formatShortDate(item.start)} {item.end ? `→ ${formatShortDate(item.end)}` : "→ en curso"}</p>
                    <p className="text-xs" style={{ color: "var(--text-soft)" }}>
                      {dur ? `${dur} día${dur === 1 ? "" : "s"} de regla` : ""} {item.note ? `· ${item.note}` : ""}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteCycle(item.id)} className="text-xs cursor-pointer" style={{ color: "var(--text-soft)" }} aria-label="eliminar">
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">Notificación previa</p>
            <p className="text-xs" style={{ color: "var(--text-soft)" }}>Te aviso un día antes de que llegue tu periodo.</p>
          </div>
          <button
            className={`toggle ${cycle.notify ? "on" : ""}`}
            onClick={() => {
              const val = !cycle.notify;
              setCycle({ ...cycle, notify: val });
              if (val) requestBrowserNotificationPermission();
            }}
            aria-label="notificaciones"
          />
        </div>
        {errorMessage && <p className="mt-2 text-xs" style={{ color: "var(--text-soft)" }}>{errorMessage}</p>}
        {cycle.notify && (
          <button className="btn btn-ghost mt-3 w-full cursor-pointer" onClick={requestBrowserNotificationPermission}>
            Activar notificaciones
          </button>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label, striped, dot }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-4 w-4 rounded-md border"
        style={{
          background: dot ? color : striped ? `repeating-linear-gradient(45deg, ${color}, ${color} 4px, var(--surface) 4px, var(--surface) 8px)` : color,
          borderColor: dot ? "white" : "var(--border)",
          borderRadius: dot ? "50%" : undefined
        }}
      />
      <span style={{ color: "var(--text-soft)" }}>{label}</span>
    </div>
  );
}
