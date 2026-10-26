export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // redes com IPv6 quebrado travam o fetch do Node (UND_ERR_CONNECT_TIMEOUT)
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
