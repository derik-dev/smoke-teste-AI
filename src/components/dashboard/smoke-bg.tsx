export function SmokeBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "radial-gradient(120% 80% at 50% -10%, #1b2750 0%, #0c1224 45%, #070a12 100%)" }}
    >
      <div
        className="smoke-blob left-[-15%] top-[-10%] h-[520px] w-[520px]"
        style={{ background: "radial-gradient(circle, #a6ff3d22, transparent 70%)" }}
      />
      <div
        className="smoke-blob right-[-20%] top-[10%] h-[460px] w-[460px]"
        style={{ background: "radial-gradient(circle, #3b82f633, transparent 70%)", animationDuration: "28s" }}
      />
      <div
        className="smoke-blob bottom-[-20%] left-[25%] h-[480px] w-[480px]"
        style={{ background: "radial-gradient(circle, #6366f122, transparent 70%)", animationDuration: "34s" }}
      />
      <div className="noise" />
    </div>
  );
}
