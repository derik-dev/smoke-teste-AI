"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

/** Entrada em sequência de tudo que tem data-reveal dentro do wrapper. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-reveal]", {
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: { amount: 0.9 },
        clearProps: "transform,opacity",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
