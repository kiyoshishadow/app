import React, { useState, useEffect, useRef } from 'react';
import { generateId, getTodayString } from '../utils/helpers';
import { playDrawingBeep } from '../utils/audio';

export const PAPER_BACKGROUNDS = [
  { id: "lines", label: "Rayas", cls: "paper-lines", hint: "✒️" },
  { id: "dots", label: "Puntos", cls: "paper-dots", hint: "•" },
  { id: "grid", label: "Cuadrícula", cls: "paper-grid", hint: "▦" },
  { id: "kraft", label: "Kraft", cls: "paper-kraft", hint: "📜" },
  { id: "mint", label: "Menta", cls: "paper-mint", hint: "🌿" },
  { id: "pink", label: "Rosa", cls: "paper-pink", hint: "🌸" },
  { id: "sky", label: "Cielo", cls: "paper-sky", hint: "☁️" },
  { id: "plain", label: "Liso", cls: "", hint: "○" }
];

export const INK_COLORS = [
  { hex: "#4a2b3a", name: "Tinta" },
  { hex: "#ff8fb1", name: "Rosa" },
  { hex: "#b39cff", name: "Lavanda" },
  { hex: "#6bcf9a", name: "Menta" },
  { hex: "#ffab76", name: "Durazno" },
  { hex: "#7ab8ff", name: "Cielo" },
  { hex: "#e53935", name: "Rojo" }
];

export function Diario({ diary = [], setDiary }) {
  const [activeEntry, setActiveEntry] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "edit"

  function handleCreateNewPage() {
    setActiveEntry({
      id: generateId(),
      date: getTodayString(),
      title: "",
      text: "",
      bg: "pink"
    });
    setViewMode("edit");
  }

  function handleSelectPage(entry) {
    setActiveEntry(entry);
    setViewMode("edit");
  }

  function handleSavePage(entry) {
    setDiary(prev => {
      const exists = prev.some(item => item.id === entry.id);
      if (exists) {
        return prev.map(item => item.id === entry.id ? entry : item);
      } else {
        return [entry, ...prev];
      }
    });
    setViewMode("list");
  }

  function handleDeletePage(id) {
    setDiary(prev => prev.filter(item => item.id !== id));
    if (activeEntry?.id === id) {
      setActiveEntry(null);
      setViewMode("list");
    }
  }

  if (viewMode === "edit" && activeEntry) {
    return (
      <DiarioEdit
        entry={activeEntry}
        onSave={handleSavePage}
        onCancel={() => setViewMode("list")}
        onDelete={() => handleDeletePage(activeEntry.id)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-soft)" }}>Mi diario íntimo</p>
          <h2 className="font-display text-6xl leading-none" style={{ color: "var(--accent)" }}>
            Mis páginas
          </h2>
        </div>
        <button className="btn fab-shadow" onClick={handleCreateNewPage}>
          + Nueva página
        </button>
      </header>

      {diary.length === 0 ? (
        <div className="card relative overflow-hidden p-10 text-center pop-in" style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--surface))" }}>
          <div className="absolute -right-6 -top-6 text-[8rem] opacity-20 select-none">📖</div>
          <p className="font-display text-3xl" style={{ color: "var(--text)" }}>Aún no tienes páginas</p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
            Escribe lo que sientes, dibuja tu día, decora con colores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {diary.map((entry, idx) => {
            const paper = PAPER_BACKGROUNDS.find(bg => bg.id === entry.bg) || PAPER_BACKGROUNDS[7];
            return (
              <button
                key={entry.id}
                onClick={() => handleSelectPage(entry)}
                className={`card group relative aspect-[3/4] overflow-hidden p-3 text-left pop-in ${paper.cls}`}
                style={{
                  background: paper.cls ? undefined : "var(--surface)",
                  animationDelay: `${idx * 60}ms`
                }}
              >
                {entry.drawing && (
                  <img
                    src={entry.drawing}
                    alt=""
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-90 transition group-hover:scale-105"
                  />
                )}
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <p className="font-display text-3xl leading-tight" style={{ color: "var(--text)" }}>
                      {entry.title || "Sin título"}
                    </p>
                    <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs" style={{ color: "var(--text-soft)" }}>
                      {entry.text || "Página en blanco…"}
                    </p>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>
                    {new Date(entry.date + "T00:00:00").toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DiarioEdit({ entry, onSave, onCancel, onDelete }) {
  const [localEntry, setLocalEntry] = useState(entry);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const [tool, setTool] = useState("none"); // "none", "pen", or "eraser"
  const [inkColor, setInkColor] = useState(INK_COLORS[0].hex);
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (localEntry.drawing) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = localEntry.drawing;
    }
  }, []);

  function getCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function configureContext(ctx) {
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = Math.max(10, brushSize * 4);
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = brushSize;
    }
  }

  function handleStartDrawing(e) {
    if (tool === "none") return;
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getCoords(e);

    const ctx = canvasRef.current.getContext("2d");
    configureContext(ctx);
    ctx.beginPath();
    ctx.arc(lastPos.current.x, lastPos.current.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    playDrawingBeep();
  }

  function handleDraw(e) {
    if (!isDrawing.current || tool === "none") return;
    const ctx = canvasRef.current.getContext("2d");
    const currentPos = getCoords(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    lastPos.current = currentPos;
  }

  function handleStopDrawing() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;

    const canvas = canvasRef.current;
    setLocalEntry(prev => ({
      ...prev,
      drawing: canvas.toDataURL("image/png")
    }));
  }

  function handleClearDrawing() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setLocalEntry(prev => ({
      ...prev,
      drawing: undefined
    }));
  }

  const paper = PAPER_BACKGROUNDS.find(bg => bg.id === localEntry.bg) || PAPER_BACKGROUNDS[7];
  const isWritingMode = tool === "none";

  const activeToolInfo = {
    none: { label: "Escribiendo", emoji: "✍️", color: "var(--text-soft)" },
    pen: { label: "Dibujando", emoji: "✏️", color: "var(--accent)" },
    eraser: { label: "Borrando", emoji: "🧽", color: "var(--warn)" }
  }[tool];

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <button className="btn btn-ghost" onClick={onCancel}>
          ← Volver
        </button>
        <div className="flex items-center gap-2">
          <span className="chip text-xs" style={{ background: activeToolInfo.color + "22", borderColor: activeToolInfo.color, color: "var(--text)" }}>
            {activeToolInfo.emoji} {activeToolInfo.label}
          </span>
          <button className="btn btn-ghost cursor-pointer" onClick={onDelete} aria-label="eliminar">
            🗑️
          </button>
          <button className="btn fab-shadow cursor-pointer" onClick={() => onSave(localEntry)}>
            Guardar
          </button>
        </div>
      </header>

      <div className="card p-4">
        <input
          className="input mb-3 border-0 bg-transparent font-display text-4xl shadow-none focus:shadow-none"
          placeholder="Un título para hoy…"
          value={localEntry.title}
          onChange={e => setLocalEntry({ ...localEntry, title: e.target.value })}
          style={{ background: "transparent" }}
        />
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Papel</p>
        <div className="flex flex-wrap gap-2">
          {PAPER_BACKGROUNDS.map(bg => (
            <button
              key={bg.id}
              className={`chip ${bg.cls} transition cursor-pointer`}
              style={{
                outline: localEntry.bg === bg.id ? "3px solid var(--accent)" : "none",
                outlineOffset: "2px",
                minWidth: 54,
                minHeight: 34,
                background: bg.cls ? undefined : "var(--surface-2)",
                transform: localEntry.bg === bg.id ? "scale(1.05)" : "scale(1)"
              }}
              onClick={() => setLocalEntry({ ...localEntry, bg: bg.id })}
              title={bg.label}
            >
              <span className="mr-1">{bg.hint}</span>
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className={`card relative overflow-hidden p-4 transition ${paper.cls}`}
        style={{
          minHeight: 440,
          background: paper.cls ? undefined : "var(--surface)",
          touchAction: tool !== "none" ? "none" : "auto",
          outline: tool !== "none" ? `3px dashed ${activeToolInfo.color}` : "1px solid var(--border)",
          outlineOffset: "-3px"
        }}
      >
        <textarea
          className="relative z-0 min-h-[280px] w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-8 shadow-none outline-none focus:shadow-none"
          placeholder="Querido diario…"
          value={localEntry.text}
          onChange={e => setLocalEntry({ ...localEntry, text: e.target.value })}
          style={{
            background: "transparent",
            color: "var(--text)",
            pointerEvents: isWritingMode ? "auto" : "none",
            fontFamily: "var(--font-body)"
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 h-full w-full"
          style={{
            pointerEvents: tool !== "none" ? "auto" : "none",
            cursor: tool === "pen" ? "crosshair" : tool === "eraser" ? "cell" : "default"
          }}
          onPointerDown={handleStartDrawing}
          onPointerMove={handleDraw}
          onPointerUp={handleStopDrawing}
          onPointerLeave={handleStopDrawing}
          onPointerCancel={handleStopDrawing}
        />
        {tool !== "none" && (
          <div
            className="pointer-events-none absolute right-3 top-3 z-20 rounded-full px-3 py-1 text-xs font-bold text-white pop-in"
            style={{
              background: activeToolInfo.color,
              boxShadow: "0 6px 16px var(--ring)"
            }}
          >
            {activeToolInfo.emoji} {activeToolInfo.label}
          </div>
        )}
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ToolButton active={tool === "none"} onClick={() => setTool("none")} emoji="✍️" label="Escribir" />
          <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} emoji="✏️" label="Lápiz" />
          <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} emoji="🧽" label="Borrador" />
          <button
            className="btn btn-ghost ml-auto text-sm cursor-pointer"
            onClick={handleClearDrawing}
            disabled={!localEntry.drawing}
            style={{ opacity: localEntry.drawing ? 1 : 0.45 }}
          >
            🗑️ Borrar lienzo
          </button>
        </div>

        {tool === "pen" && (
          <div className="space-y-2 pop-in">
            <div className="flex flex-wrap items-center gap-2">
              {INK_COLORS.map(color => (
                <button
                  key={color.hex}
                  className="relative h-9 w-9 rounded-full border-2 transition cursor-pointer"
                  style={{
                    background: color.hex,
                    borderColor: inkColor === color.hex ? "var(--text)" : "transparent",
                    transform: inkColor === color.hex ? "scale(1.2)" : "scale(1)",
                    boxShadow: inkColor === color.hex ? `0 4px 12px ${color.hex}66` : "none"
                  }}
                  onClick={() => setInkColor(color.hex)}
                  aria-label={color.name}
                  title={color.name}
                >
                  {inkColor === color.hex && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-white drop-shadow">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--text-soft)" }}>Grosor</span>
              <input
                type="range"
                min={1}
                max={24}
                value={brushSize}
                onChange={e => setBrushSize(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex h-8 w-8 items-center justify-center" aria-hidden="true">
                <span className="block rounded-full" style={{ width: Math.min(28, brushSize + 2), height: Math.min(28, brushSize + 2), background: inkColor }} />
              </div>
              <span className="w-10 text-right text-xs" style={{ color: "var(--text-soft)" }}>{brushSize}px</span>
            </div>
          </div>
        )}

        {tool === "eraser" && (
          <div className="flex items-center gap-3 pop-in">
            <span className="text-sm" style={{ color: "var(--text-soft)" }}>Tamaño del borrador</span>
            <input
              type="range"
              min={3}
              max={30}
              value={brushSize}
              onChange={e => setBrushSize(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right text-xs" style={{ color: "var(--text-soft)" }}>{brushSize * 4}px</span>
          </div>
        )}

        {tool === "none" && (
          <p className="rounded-xl px-3 py-2 text-xs" style={{ background: "var(--surface-2)", color: "var(--text-soft)" }}>
            Toca el papel para escribir. Cuando quieras dibujar, elige ✏️; para borrar partes del dibujo, elige 🧽. Al terminar, pulsa de nuevo el modo activo para volver a escribir.
          </p>
        )}
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, emoji, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition cursor-pointer"
      style={{
        background: active ? "var(--accent)" : "var(--surface-2)",
        color: active ? "white" : "var(--text)",
        borderColor: active ? "var(--accent)" : "var(--border)",
        transform: active ? "translateY(-2px)" : "none",
        boxShadow: active ? "0 8px 16px var(--ring)" : "none"
      }}
    >
      <span className="text-lg">{emoji}</span>
      {label}
    </button>
  );
}
