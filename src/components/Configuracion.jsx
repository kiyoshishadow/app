import React from 'react';
import { Preferences } from '@capacitor/preferences';
import { useTheme, Dp } from './ThemeProvider';
import { getTodayString } from '../utils/helpers';

export function Configuracion({ onReset, soundOn, onToggleSound }) {
  const { theme: activeTheme, mode, setTheme, setMode } = useTheme();

  async function handleSaveBackup() {
    try {
      const backupObj = {
        app: "Rimi",
        version: 2,
        created: new Date().toISOString(),
        data: {}
      };

      // Read from Preferences keys first
      const keysResult = await Preferences.getKeys();
      for (const k of keysResult.keys) {
        if (k.startsWith("rimi.")) {
          const { value } = await Preferences.get({ key: k });
          if (value !== null) {
            backupObj.data[k] = value;
          }
        }
      }

      // Fallback/additional keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("rimi.") && !backupObj.data[k]) {
          const val = localStorage.getItem(k);
          if (val !== null) {
            backupObj.data[k] = val;
          }
        }
      }

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `rimi-cajita-${getTodayString()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      alert("Tu cajita de recuerdos quedó guardadita 🎁");
    } catch (e) {
      console.error(e);
      alert("No pudimos preparar la copia. Inténtalo otra vez 💗");
    }
  }

  async function handleRestoreBackup() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      try {
        const file = input.files[0];
        if (!file) return;
        const text = await file.text();
        const backup = JSON.parse(text);

        if (!backup || backup.app !== "Rimi" || !backup.data) {
          throw new Error("Invalid backup format");
        }

        if (!confirm("¿Recuperar esta cajita? Reemplazará los datos actuales.")) {
          return;
        }

        // Write to both Preferences and localStorage
        for (const [k, val] of Object.entries(backup.data)) {
          await Preferences.set({ key: k, value: val });
          try {
            localStorage.setItem(k, val);
          } catch {}
        }

        alert("Todo volvió a su lugar 🌷");
        window.location.reload();
      } catch (e) {
        alert("Esta cajita no parece una copia válida de Rimi.");
      }
    };
    input.click();
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>Personaliza Rimi</p>
        <h2 className="font-display text-5xl" style={{ color: "var(--accent)" }}>
          Configuración 🎀
        </h2>
      </header>

      <div className="card p-5">
        <h3 className="mb-3 font-semibold">Apariencia</h3>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold" style={{ color: "var(--text-soft)" }}>Tono pastel</p>
            <div className="flex flex-wrap gap-3">
              {Dp.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition cursor-pointer"
                  style={{
                    borderColor: activeTheme === t.id ? t.swatch : "var(--border)",
                    background: activeTheme === t.id ? t.swatch + "22" : "var(--surface)",
                    color: "var(--text)",
                    transform: activeTheme === t.id ? "scale(1.05)" : "scale(1)"
                  }}
                >
                  <span className="inline-block h-4 w-4 rounded-full" style={{ background: t.swatch }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <div>
              <p className="font-semibold">Modo oscuro</p>
              <p className="text-xs" style={{ color: "var(--text-soft)" }}>Descansa la vista por la noche</p>
            </div>
            <button
              aria-label="alternar modo oscuro"
              className={`toggle ${mode === "dark" ? "on" : ""}`}
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            />
          </div>
        </div>
      </div>

      <div className="card flex items-center justify-between p-5">
        <div>
          <p className="font-semibold">Sonidos suaves 🔔</p>
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>Una notita dulce en cada toque</p>
        </div>
        <button
          aria-label="sonidos"
          className={`toggle ${soundOn ? "on" : ""}`}
          onClick={onToggleSound}
        />
      </div>

      <div className="card p-5" style={{ background: "linear-gradient(135deg,var(--accent-soft),var(--surface))" }}>
        <h3 className="mb-2 font-semibold">Mi cajita de recuerdos 🎁</h3>
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
          Guarda una copia de tus finanzas, agenda, ciclo, diario y colores.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn cursor-pointer" onClick={handleSaveBackup}>
            🎁 Guardar copia
          </button>
          <button className="btn btn-ghost cursor-pointer" onClick={handleRestoreBackup}>
            🌷 Recuperar
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-2 font-semibold">Datos</h3>
        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
          Todo se guarda en este dispositivo. No subimos nada a ningún servidor.
        </p>
        <button
          className="btn btn-ghost mt-3 w-full cursor-pointer text-sm"
          onClick={() => {
            if (confirm("¿Borrar todos tus datos (finanzas, agenda, ciclo y diario)?")) {
              onReset();
            }
          }}
        >
          Borrar todos mis datos
        </button>
      </div>

      <p className="py-6 text-center text-xs" style={{ color: "var(--text-soft)" }}>
        Hecha con <span className="heartbeat">💗</span> para Rimi · v1.0
      </p>
    </div>
  );
}
