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
  const [soundOn, setSoundOn, soundOnLoaded] = useStorage("rimi.sound", true);
  const [tab, setTab] = useState("inicio");

  // Load and sync business data
  const [finances, setFinances, financesLoaded] = useStorage("rimi.finance", []);
  const [initialBalance, setInitialBalance, initialBalanceLoaded] = useStorage("rimi.finance.initial", 0);
  const [agenda, setAgenda, agendaLoaded] = useStorage("rimi.agenda", []);
  const [cycle, setCycle, cycleLoaded] = useStorage("rimi.cycleV2", { notify: true, cycles: [], fallbackCycle: 28, fallbackPeriod: 5 });
  const [diary, setDiary, diaryLoaded] = useStorage("rimi.diary", []);

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

  const allLoaded =
    welcomedLoaded &&
    soundOnLoaded &&
    financesLoaded &&
    initialBalanceLoaded &&
    agendaLoaded &&
    cycleLoaded &&
    diaryLoaded;

  if (!allLoaded) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <div className="relative mx-auto h-24 w-24 animate-bounce">
          <span className="text-[5rem]" role="img" aria-label="Loading">🌸</span>
        </div>
        <p className="mt-4 text-sm animate-pulse" style={{ color: "var(--accent)" }}>
          Cargando tu espacio... 💕
        </p>
      </div>
    );
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
