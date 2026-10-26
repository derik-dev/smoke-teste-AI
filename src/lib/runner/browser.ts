import { chromium, type Browser } from "playwright-core";

export async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const sparticuz = (await import("@sparticuz/chromium")).default;
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    });
  }
  return process.env.CHROME_PATH
    ? chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
    : chromium.launch({ channel: "chrome", headless: true });
}
