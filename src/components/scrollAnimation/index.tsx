import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";

type ScrollAnimationProps = {
  children: ReactNode;
  revealSelector?: string;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
  lenisWrapperSelector?: string;
  lenisContentSelector?: string;
  lenisOptions?: ConstructorParameters<typeof Lenis>[0];
  onLenis?: (lenis: Lenis | null) => void;
};

export type ScrollRevealProps<E extends ElementType = "div"> = {
  as?: E;
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  duration?: number;
} & Omit<ComponentPropsWithoutRef<E>, "children" | "className">;

export function ScrollReveal<E extends ElementType = "div">({
  as,
  children,
  className,
  delay,
  y,
  scale,
  duration,
  ...rest
}: ScrollRevealProps<E>) {
  const Comp = (as || "div") as ElementType;
  return (
    <Comp
      data-scroll-reveal
      data-reveal-delay={typeof delay === "number" ? String(delay) : undefined}
      data-reveal-y={typeof y === "number" ? String(y) : undefined}
      data-reveal-scale={typeof scale === "number" ? String(scale) : undefined}
      data-reveal-duration={
        typeof duration === "number" ? String(duration) : undefined
      }
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export default function ScrollAnimation({
  children,
  revealSelector = "[data-scroll-reveal]",
  rootMargin = "0px 0px -15% 0px",
  threshold = 0.15,
  once = true,
  lenisWrapperSelector,
  lenisContentSelector,
  lenisOptions,
  onLenis,
}: ScrollAnimationProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const wrapper =
      typeof lenisWrapperSelector === "string"
        ? (document.querySelector(lenisWrapperSelector) as HTMLElement | null)
        : null;
    const content =
      typeof lenisContentSelector === "string"
        ? (document.querySelector(lenisContentSelector) as HTMLElement | null)
        : null;

    if (lenisWrapperSelector && !wrapper) return;
    if (lenisContentSelector && !content) return;

    const lenis = new Lenis({
      lerp: 0.1,
      ...(lenisOptions || {}),
      ...(wrapper ? { wrapper } : {}),
      ...(content ? { content } : {}),
    });

    lenisRef.current = lenis;
    onLenis?.(lenis);

    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };

    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      lenisRef.current?.destroy();
      lenisRef.current = null;
      onLenis?.(null);
    };
  }, [
    lenisContentSelector,
    lenisOptions,
    lenisWrapperSelector,
    onLenis,
    reduceMotion,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements = Array.from(
      document.querySelectorAll(revealSelector),
    ) as HTMLElement[];

    if (!elements.length) return;

    observerRef.current?.disconnect();
    observerRef.current = null;

    if (reduceMotion) {
      for (const el of elements) {
        gsap.set(el, { autoAlpha: 1, y: 0, clearProps: "transform" });
      }
      return;
    }

    const initY = (el: HTMLElement) => {
      const yAttr = el.dataset.revealY;
      const parsed = yAttr ? Number(yAttr) : NaN;
      return Number.isFinite(parsed) ? parsed : 14;
    };

    const initScale = (el: HTMLElement) => {
      const sAttr = el.dataset.revealScale;
      const parsed = sAttr ? Number(sAttr) : NaN;
      return Number.isFinite(parsed) ? parsed : 0.98;
    };

    for (const el of elements) {
      if (el.dataset.revealed === "true") continue;
      gsap.set(el, { autoAlpha: 0, y: initY(el), scale: initScale(el) });
    }

    const animateIn = (el: HTMLElement) => {
      if (el.dataset.revealed === "true") return;
      el.dataset.revealed = "true";

      const delay = Number(el.dataset.revealDelay || "0");
      const duration = Number(el.dataset.revealDuration || "0.85");

      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: Number.isFinite(duration) ? duration : 0.85,
        delay: Number.isFinite(delay) ? delay : 0,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          animateIn(el);
          if (once) io.unobserve(el);
        }
      },
      { root: null, rootMargin, threshold },
    );

    observerRef.current = io;
    for (const el of elements) io.observe(el);

    return () => {
      io.disconnect();
      observerRef.current = null;
    };
  }, [once, reduceMotion, revealSelector, rootMargin, threshold]);

  return <>{children}</>;
}
