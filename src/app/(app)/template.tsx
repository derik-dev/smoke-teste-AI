"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

/** Roda a cada navegação: transição curta da página, cards em sequência, números, sparklines e anéis se desenhando. */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = ref.current!;

    const ctx = gsap.context(() => {
      gsap.fromTo(root, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "transform,opacity" });

      gsap.from("[data-reveal]", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.1,
        clearProps: "transform,opacity",
      });

      // contagem animada (mexe no nó de texto existente, sem trocar o nó que o React controla)
      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const dec = Number(el.dataset.decimals ?? 0);
        const node = el.firstChild;
        if (!Number.isFinite(end) || !node) return;
        const final = node.nodeValue;
        const o = { v: 0 };
        node.nodeValue = (0).toFixed(dec);
        gsap.to(o, {
          v: end,
          duration: 1.2,
          delay: 0.3,
          ease: "power2.out",
          onUpdate: () => {
            node.nodeValue = o.v.toFixed(dec);
          },
          onComplete: () => {
            node.nodeValue = final;
          },
        });
      });

      // sparkline e anel de progresso se desenhando (pathLength=1 normaliza o traço)
      root.querySelectorAll<SVGElement>("[data-spark]").forEach((el) => {
        gsap.fromTo(
          el,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.1, delay: 0.45, ease: "power2.inOut", clearProps: "strokeDasharray,strokeDashoffset" },
        );
      });
      // anel: o arco final já está no atributo (preenchido/total), anima de 0 até ele
      root.querySelectorAll<SVGElement>("[data-ring]").forEach((el) => {
        const target = el.getAttribute("stroke-dasharray") ?? "1 1";
        gsap.fromTo(
          el,
          { strokeDasharray: "0 1" },
          { strokeDasharray: target, duration: 1.1, delay: 0.45, ease: "power2.inOut", clearProps: "strokeDasharray" },
        );
      });
      gsap.from("[data-spark-dot]", { opacity: 0, scale: 0, transformOrigin: "center", duration: 0.3, delay: 1.5, ease: "back.out(3)" });
    }, root);

    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
