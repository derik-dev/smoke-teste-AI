const GRADIENTS = [
  ["#a6ff3d", "#22d3ee"],
  ["#818cf8", "#e879f9"],
  ["#fbbf24", "#f97316"],
  ["#38bdf8", "#6366f1"],
  ["#f472b6", "#fb7185"],
  ["#34d399", "#0ea5e9"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Avatar do site: letra inicial sobre gradiente estável por domínio. */
export function SiteAvatar({ host, size = 36, className = "" }: { host: string; size?: number; className?: string }) {
  const [a, b] = GRADIENTS[hash(host) % GRADIENTS.length];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold uppercase text-black/80 ring-2 ring-[#0d1220] ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4, background: `linear-gradient(135deg, ${a}, ${b})` }}
      title={host}
    >
      {host[0]}
    </span>
  );
}
