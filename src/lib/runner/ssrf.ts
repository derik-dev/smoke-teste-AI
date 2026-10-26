import { lookup } from "node:dns/promises";
import net from "node:net";

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateIp(v6.slice(7));
  return v6 === "::1" || v6 === "::" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80");
}

const cache = new Map<string, boolean>();

/** true se o host resolve para endereço público. */
export async function isPublicHost(hostname: string): Promise<boolean> {
  const host = hostname.replace(/^\[|\]$/g, "");
  const hit = cache.get(host);
  if (hit !== undefined) return hit;
  let ok = false;
  try {
    if (net.isIP(host)) {
      ok = !isPrivateIp(host);
    } else if (host !== "localhost" && !host.endsWith(".local") && !host.endsWith(".internal")) {
      const addrs = await lookup(host, { all: true });
      ok = addrs.length > 0 && addrs.every((a) => !isPrivateIp(a.address));
    }
  } catch {
    ok = false;
  }
  cache.set(host, ok);
  return ok;
}

export function normalizeUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) return null;
    return url;
  } catch {
    return null;
  }
}
