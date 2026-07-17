import React, { useState, useEffect } from 'react';

export function Welcome({ onEnter }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 200);
    const t2 = setTimeout(() => setStep(2), 700);
    const t3 = setTimeout(() => setStep(3), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSkipWelcome = () => {
    try {
      localStorage.setItem("rimi.welcomed", "1");
    } catch {}
    onEnter();
  };

  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <div className="bubbles">
        {Array.from({ length: 8 }).map((_, idx) => (
          <span
            key={idx}
            className="bubble"
            style={{
              width: 40 + (idx % 4) * 30,
              height: 40 + (idx % 4) * 30,
              left: `${(idx * 13) % 90}%`,
              top: `${(idx * 17) % 90}%`,
              animationDelay: `${idx * 0.6}s`
            }}
          />
        ))}
      </div>

      <div className={`pop-in transition-all duration-700 ${step >= 1 ? "opacity-100" : "opacity-0"}`}>
        <div className="relative mx-auto h-52 w-52">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, var(--accent-2), var(--accent-soft))",
              filter: "blur(10px)"
            }}
          />
          <div
            role="img"
            aria-label="Rimi"
            className="absolute inset-0 flex items-center justify-center text-[8rem] drop-shadow-xl"
          >
            🌸
          </div>
        </div>
      </div>

      <h1
        className={`font-display mt-6 text-6xl leading-none transition-all duration-700 sm:text-7xl ${step >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        style={{ color: "var(--accent)" }}
      >
        Hola, Rimi <span className="wave">👋</span>
      </h1>

      <p
        className={`mt-3 max-w-sm text-lg transition-all duration-700 ${step >= 2 ? "opacity-100" : "opacity-0"}`}
        style={{ color: "var(--text-soft)" }}
      >
        Tu espacio personal para finanzas, agenda, ciclo y diario íntimo.
      </p>

      <div
        className={`mt-8 flex flex-col items-center gap-3 transition-all duration-700 ${step >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <button className="btn fab-shadow" onClick={onEnter}>
          Entrar a mi espacio
        </button>
        <button className="btn btn-ghost text-sm" onClick={handleSkipWelcome}>
          Saltar bienvenida
        </button>
      </div>

      <p className="mt-10 text-xs" style={{ color: "var(--text-soft)" }}>
        Hecha con <span className="heartbeat">💗</span> solo para ti
      </p>
    </div>
  );
}
