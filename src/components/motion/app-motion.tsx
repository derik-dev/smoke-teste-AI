"use client";

import gsap from "gsap";
import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Movimento global do app (montado uma vez no shell):
 * scroll suave (Lenis), entrada do shell, botão magnético e brilho que segue o cursor no hero.
 * Tudo desligado com prefers-reduced-motion.
 */
export function AppMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanups: (() => void)[] = [];

    // scroll suave, sincronizado com o ticker do GSAP
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    });

    // entrada em sequência: sidebar, itens do menu, topbar
    const ctx = gsap.context(() => {
      gsap.from('[data-shell="sidebar"]', { x: -32, opacity: 0, duration: 0.7, ease: "power3.out", clearProps: "transform,opacity" });
      gsap.from('[data-shell="sidebar"] nav a', {
        x: -12,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        delay: 0.2,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
      gsap.from('[data-shell="topbar"]', { y: -16, opacity: 0, duration: 0.6, delay: 0.1, ease: "power3.out", clearProps: "transform,opacity" });
    });
    cleanups.push(() => ctx.revert());

    // brilho no hero + botão magnético (um único listener)
    if (window.matchMedia("(pointer: fine)").matches) {
      const onMove = (e: PointerEvent) => {
        const hero = document.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          const r = hero.getBoundingClientRect();
          const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
          hero.style.setProperty("--my", `${e.clientY - r.top}px`);
          hero.style.setProperty("--glow", inside ? "1" : "0");
        }

        document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          const r = el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * 0.9;
          gsap.to(el, {
            x: near ? dx * 0.25 : 0,
            y: near ? dy * 0.35 : 0,
            duration: near ? 0.3 : 0.6,
            ease: near ? "power2.out" : "elastic.out(1, 0.4)",
            overwrite: "auto",
          });
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => window.removeEventListener("pointermove", onMove));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
