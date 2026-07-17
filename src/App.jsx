import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { Welcome } from './components/Welcome';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Finanzas } from './components/Finanzas';
import { Agenda } from './components/Agenda';
import { Ciclo } from './components/Ciclo';
import { Diario } from './components/Diario';
import { Configuracion } from './components/Configuracion';

import { useStorage } from './hooks/useStorage';
import { setSoundEnabled, soundFeedbackListener } from './utils/audio';
import { KeepAwake } from '@capacitor-community/keep-awake';

function RimiApp() {
  const [welcomed, setWelcomed, welcomedLoaded] = useStorage("rimi.welcomed", false);
  const [soundOn, setSoundOn] = useStorage("rimi.sound", true);
  const [tab, setTab] = useState("inicio");

  // Load and sync business data
  const [finances, setFinances] = useStorage("rimi.finance", []);
  const [initialBalance, setInitialBalance] = useStorage("rimi.finance.initial", 0);
  const [agenda, setAgenda] = useStorage("rimi.agenda", []);
  const [cycle, setCycle] = useStorage("rimi.cycleV2", { notify: true, cycles: [], fallbackCycle: 28, fallbackPeriod: 5 });
  const [diary, setDiary] = useStorage("rimi.diary", []);

  // Initialize sound feedback
  useEffect(() => {
    if (soundOn !== null) {
      setSoundEnabled(!!soundOn);
    }
  }, [soundOn]);

  useEffect(() => {
    const cleanup = soundFeedbackListener();
    return () => cleanup();
  }, []);

  // Cute tap-wave and storage save response effects
  useEffect(() => {
    let lastSave = 0;
    function toast(text) {
      if (Date.now() - lastSave < 350) return;
      lastSave = Date.now();
      document.querySelectorAll('.rimi-toast').forEach(x => x.remove());
      const t = document.createElement('div');
      t.className = 'rimi-toast';
      t.textContent = text;
      document.body.append(t);
      setTimeout(() => t.remove(), 2450);
    }

    function hearts(x = window.innerWidth / 2, y = window.innerHeight - 115, emoji = '💕') {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;
      [-22, 0, 22].forEach((d, i) => {
        const h = document.createElement('span');
        h.className = 'rimi-heart';
        h.textContent = i === 1 ? emoji : '♡';
        h.style.left = `${x + d}px`;
        h.style.top = `${y}px`;
        h.style.setProperty('--drift', `${d / 2}px`);
        h.style.animationDelay = `${i * 55}ms`;
        document.body.append(h);
        setTimeout(() => h.remove(), 1000);
      });
    }

    // Intercept localStorage setItem to automatically respond on saves
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      const result = originalSetItem.call(this, key, value);
      if (typeof key === 'string' && key.startsWith('rimi.') && !/theme|mode|sound|welcomed|notified/.test(key)) {
        setTimeout(() => {
          let msg = 'Todo guardadito 💕';
          let icon = '💕';
          if (key.includes('finance')) {
            msg = 'Anotado en tu bolsillo 🐷';
            icon = '🪙';
          } else if (key.includes('agenda')) {
            msg = 'Plan apuntado en tu agenda 🌷';
            icon = '🌷';
          } else if (key.includes('cycle')) {
            msg = 'Registro guardado con cariño 🌸';
            icon = '🌸';
          } else if (key.includes('diary')) {
            msg = 'Tus palabras están a salvo 📖';
            icon = '💗';
          }
          toast(msg);
          hearts(window.innerWidth / 2, window.innerHeight - 105, icon);
        }, 40);
      }
      return result;
    };

    // Global tap/click wave (burbuja) effect
    const handleGlobalClick = (e) => {
      const b = e.target.closest('button, [role="button"], .day-cell, .sticker, .toggle');
      if (!b) return;

      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Tab navigation pop
      const nav = b.closest('nav[aria-label="navegación"]');
      if (nav) {
        b.classList.remove('rimi-nav-pop');
        void b.offsetWidth;
        b.classList.add('rimi-nav-pop');
        setTimeout(() => b.classList.remove('rimi-nav-pop'), 550);
      }

      // Tap wave ripple
      if (!isReduced && !b.closest('.fixed.inset-0')) {
        const w = document.createElement('i');
        w.className = 'rimi-tap-wave';
        w.style.left = `${e.clientX}px`;
        w.style.top = `${e.clientY}px`;
        document.body.append(w);
        setTimeout(() => w.remove(), 650);
      }

      // Calendar month swap transition
      const txt = (b.textContent || '').trim();
      if (txt === '‹' || txt === '›') {
        setTimeout(() => {
          const cal = document.querySelector('.grid-cols-7');
          if (cal) {
            cal.style.setProperty('--month-dir', txt === '›' ? '12px' : '-12px');
            cal.classList.remove('rimi-calendar-swap');
            void cal.offsetWidth;
            cal.classList.add('rimi-calendar-swap');
          }
        }, 20);
      }
    };

    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      Storage.prototype.setItem = originalSetItem;
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  // Enable keep awake feature
  useEffect(() => {
    async function activateAwake() {
      try {
        await KeepAwake.keepAwake();
      } catch (e) {
        console.log("Keep awake not supported on this platform/device");
      }
    }
    activateAwake();
  }, []);

  // Cute decorations & animations observer (Preserving Rimi-cute.html script effects)
  useEffect(() => {
    let decorating = false;
    function decorate() {
      if (decorating) return;
      decorating = true;
      requestAnimationFrame(() => {
        const main = document.querySelector('main');
        if (main) {
          const cards = [...main.querySelectorAll('.card')];
          cards.forEach((c, i) => {
            c.classList.add('motion-hover');
            if (!c.dataset.motionSeen) {
              c.dataset.motionSeen = '1';
              c.classList.add('motion-card-in');
              c.style.setProperty('--stagger', `${Math.min(i, 5) * 55}ms`);
              setTimeout(() => c.classList.remove('motion-card-in'), 850);
            }
          });
        }
        document.querySelectorAll('.fixed.inset-0.z-50 .card').forEach(c => {
          if (!c.classList.contains('rimi-modal-card')) {
            c.classList.add('rimi-modal-card');
          }
        });
        decorating = false;
      });
    }

    const observer = new MutationObserver(decorate);
    observer.observe(document.body, { childList: true, subtree: true });
    decorate();

    return () => observer.disconnect();
  }, [tab, welcomed]);

  function handleResetAllData() {
    const keys = [
      "rimi.finance",
      "rimi.finance.initial",
      "rimi.agenda",
      "rimi.cycle",
      "rimi.cycleV2",
      "rimi.diary",
      "rimi.theme",
      "rimi.mode",
      "rimi.sound",
      "rimi.welcomed"
    ];
    keys.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
    window.location.reload();
  }

  function handleToggleSound() {
    setSoundOn(!soundOn);
  }

  function handleWelcomeEnter() {
    setWelcomed(true);
  }

  if (!welcomedLoaded) {
    return null; // Loading state while useStorage loads from Preferences
  }

  if (!welcomed) {
    return <Welcome onEnter={handleWelcomeEnter} />;
  }

  return (
    <Navbar tab={tab} setTab={setTab}>
      <div className="pop-in">
        {tab === "inicio" && (
          <Home
            setTab={setTab}
            finances={finances}
            agenda={agenda}
            cycle={cycle}
            diary={diary}
          />
        )}
        {tab === "finanzas" && (
          <Finanzas
            finances={finances}
            setFinances={setFinances}
            initialBalance={initialBalance}
            setInitialBalance={setInitialBalance}
          />
        )}
        {tab === "agenda" && (
          <Agenda
            agenda={agenda}
            setAgenda={setAgenda}
          />
        )}
        {tab === "ciclo" && (
          <Ciclo
            cycle={cycle}
            setCycle={setCycle}
          />
        )}
        {tab === "diario" && (
          <Diario
            diary={diary}
            setDiary={setDiary}
          />
        )}
        {tab === "config" && (
          <Configuracion
            onReset={handleResetAllData}
            soundOn={!!soundOn}
            onToggleSound={handleToggleSound}
          />
        )}
      </div>
    </Navbar>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RimiApp />
    </ThemeProvider>
  );
}
