// Rimi App Helper Utilities

export function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function formatCurrency(value, currency = "MXN") {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  } catch {
    return `$${value.toFixed(0)}`;
  }
}

export function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(dateStr, days) {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function diffDays(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + "T00:00:00").getTime();
  const d2 = new Date(dateStr2 + "T00:00:00").getTime();
  return Math.round((d2 - d1) / 864e5);
}

// Calendar cells for Agenda
export function getCalendarCells(year, month) {
  const startDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

// Cycle calculations
export function sortCycles(cycles) {
  return [...cycles].sort((a, b) => a.start.localeCompare(b.start));
}

export function calculateCycleStats(cycleData) {
  const sorted = sortCycles(cycleData.cycles);
  const periods = [];
  const cycles = [];

  for (const c of sorted) {
    if (c.end) {
      const pDuration = diffDays(c.start, c.end) + 1;
      if (pDuration > 0 && pDuration <= 15) {
        periods.push(pDuration);
      }
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    const cDuration = diffDays(sorted[i - 1].start, sorted[i].start);
    if (cDuration >= 18 && cDuration <= 45) {
      cycles.push(cDuration);
    }
  }

  const average = (arr, fallback) => arr.length
    ? Math.round(arr.reduce((sum, val) => sum + val, 0) / arr.length)
    : fallback;

  const avgPeriod = average(periods, cycleData.fallbackPeriod);
  const avgCycle = average(cycles, cycleData.fallbackCycle);
  const current = sorted[sorted.length - 1] || null;
  const today = getTodayString();

  let daysIntoCycle = 0;
  let inCourse = false;
  let estimatedEnd = null;
  let nextStart = null;
  let daysUntilNext = 0;

  if (current) {
    daysIntoCycle = diffDays(current.start, today) + 1;
    if (!current.end) {
      inCourse = true;
      estimatedEnd = addDays(current.start, avgPeriod - 1);
    }
    if (inCourse || current.end) {
      nextStart = addDays(current.start, avgCycle);
    }
    if (nextStart) {
      daysUntilNext = diffDays(today, nextStart);
    }
  }

  return {
    avgPeriod,
    avgCycle,
    current,
    daysIntoCycle,
    inCourse,
    estimatedEnd,
    nextStart,
    daysUntilNext,
    cycleCount: sorted.length,
    hasRealPeriodData: periods.length > 0,
    hasRealCycleData: cycles.length > 0
  };
}

export function getPredictedPeriodDays(cycleData, count = 3) {
  const predicted = {};
  const stats = calculateCycleStats(cycleData);
  const sorted = sortCycles(cycleData.cycles);
  const today = getTodayString();

  for (const c of sorted) {
    const endVal = c.end || (c.start <= today ? today : addDays(c.start, stats.avgPeriod - 1));
    const duration = diffDays(c.start, endVal);
    for (let i = 0; i <= duration; i++) {
      predicted[addDays(c.start, i)] = { kind: c.end ? "period" : "period-course" };
    }
  }

  const lastStart = sorted[sorted.length - 1]?.start;
  if (lastStart) {
    const limit = stats.avgCycle * (count + 1);
    for (let offset = stats.avgCycle; offset <= limit; offset += stats.avgCycle) {
      const predStart = addDays(lastStart, offset);
      for (let i = 0; i < stats.avgPeriod; i++) {
        const d = addDays(predStart, i);
        if (!predicted[d]) {
          predicted[d] = { kind: "predicted-period" };
        }
      }
      for (let i = 11; i <= 15; i++) {
        const d = addDays(predStart, i);
        if (!predicted[d]) {
          predicted[d] = { kind: i === 13 ? "ovulation" : "fertile" };
        }
      }
    }
  }

  return predicted;
}

export function getPhaseStats(daysIntoCycle, avgCycle, avgPeriod) {
  if (daysIntoCycle <= avgPeriod) {
    return { name: "Menstruación", emoji: "🩸", color: "var(--bad)" };
  }
  if (daysIntoCycle >= 12 && daysIntoCycle <= 16) {
    return { name: "Ovulación (fértil)", emoji: "🥚", color: "var(--warn)" };
  }
  if (daysIntoCycle < 12) {
    return { name: "Fase folicular", emoji: "🌱", color: "var(--good)" };
  }
  if (daysIntoCycle <= avgCycle) {
    return { name: "Fase lútea", emoji: "🌙", color: "var(--accent-2)" };
  }
  return { name: "Fin de ciclo", emoji: "🌸", color: "var(--accent)" };
}

export function formatLongDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es", {
    day: "numeric",
    month: "long"
  });
}

export function formatShortDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es", {
    day: "2-digit",
    month: "short"
  });
}
