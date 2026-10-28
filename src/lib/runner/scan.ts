import type { Page } from "playwright-core";

export type Interactive = {
  idx: number;
  tag: string;
  text: string;
  href?: string;
  type?: string;
  name?: string;
  required?: boolean;
};

export type PageScan = {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  text: string;
  interactive: Interactive[];
  forms: number;
  horizontalOverflow: boolean;
  brokenImages: number;
  contactLinks: string[];
};

/** Marca elementos interativos com data-st-idx e devolve um resumo enxuto da página. */
export async function scanPage(page: Page): Promise<PageScan> {
  return page.evaluate(() => {
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 4 && r.height > 4 && s.visibility !== "hidden" && s.display !== "none";
    };
    const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

    document.querySelectorAll("[data-st-idx]").forEach((e) => e.removeAttribute("data-st-idx"));
    const nodes = Array.from(
      document.querySelectorAll("a[href], button, input, select, textarea, [role=button]"),
    ).filter(visible);

    const interactive = nodes.slice(0, 60).map((el, idx) => {
      el.setAttribute("data-st-idx", String(idx));
      const input = el as HTMLInputElement;
      return {
        idx,
        tag: el.tagName.toLowerCase(),
        text: clean(el.textContent || input.placeholder || el.getAttribute("aria-label") || input.value).slice(0, 80),
        href: (el as HTMLAnchorElement).href || undefined,
        type: input.type || undefined,
        name: input.name || undefined,
        required: input.required || undefined,
      };
    });

    const links = Array.from(document.querySelectorAll("a[href]")) as HTMLAnchorElement[];
    return {
      url: location.href,
      title: document.title,
      metaDescription: clean(document.querySelector('meta[name="description"]')?.getAttribute("content")),
      headings: Array.from(document.querySelectorAll("h1,h2,h3"))
        .filter(visible)
        .slice(0, 15)
        .map((h) => clean(h.textContent).slice(0, 120)),
      text: clean(document.body.innerText).slice(0, 3500),
      interactive,
      forms: document.forms.length,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      brokenImages: Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).length,
      contactLinks: links
        .map((a) => a.href)
        .filter((h) => /^(tel:|mailto:)|wa\.me|whatsapp/i.test(h))
        .slice(0, 6),
    };
  });
}
