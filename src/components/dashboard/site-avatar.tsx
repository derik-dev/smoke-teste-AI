/** Avatar do site: letra inicial em superfície neutra (sem cor por domínio, para não competir com o verde). */
export function SiteAvatar({ host, size = 36, className = "" }: { host: string; size?: number; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-[10px] bg-surface-2 font-medium uppercase text-muted ring-1 ring-line ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={host}
    >
      {host[0]}
    </span>
  );
}
