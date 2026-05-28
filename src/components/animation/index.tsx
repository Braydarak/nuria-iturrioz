import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type AnimateOnScrollProps<E extends ElementType = "div"> = {
  as?: E;
  children: ReactNode;
  className?: string;
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
} & Omit<ComponentPropsWithoutRef<E>, "children" | "className">;

export function AnimateOnScroll<E extends ElementType = "div">({
  as,
  children,
  className,
  delay,
  x,
  y,
  scale,
  duration,
  ...rest
}: AnimateOnScrollProps<E>) {
  const Comp = (as || "div") as ElementType;
  return (
    <Comp
      data-animate-on-scroll
      data-animate-delay={typeof delay === "number" ? String(delay) : undefined}
      data-animate-x={typeof x === "number" ? String(x) : undefined}
      data-animate-y={typeof y === "number" ? String(y) : undefined}
      data-animate-scale={typeof scale === "number" ? String(scale) : undefined}
      data-animate-duration={
        typeof duration === "number" ? String(duration) : undefined
      }
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export type AnimationProps = {
  children: ReactNode;
  className?: string;
  revealSelector?: string;
  start?: string;
  once?: boolean;
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
  ease?: string;
};

const toNumber = (value: string | undefined) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function Animation({
  children,
  className,
  revealSelector = "[data-animate-on-scroll]",
  start = "top 85%",
  once = true,
  x = 0,
  y = 14,
  scale = 0.98,
  duration = 0.85,
  ease = "power3.out",
}: AnimationProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const scope = scopeRef.current;
    if (!scope) return;

    gsap.registerPlugin(ScrollTrigger);

    const elements = Array.from(
      scope.querySelectorAll(revealSelector),
    ) as HTMLElement[];

    if (!elements.length) return;

    const triggers: ScrollTrigger[] = [];

    if (reduceMotion) {
      gsap.set(elements, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        clearProps: "transform",
      });
      return;
    }

    const animated = new WeakSet<HTMLElement>();
    const entries: Array<{
      el: HTMLElement;
      trigger: ScrollTrigger;
      animateIn: () => void;
    }> = [];

    const startThreshold = (() => {
      const parts = start.trim().split(/\s+/);
      const last = parts[parts.length - 1] || "";
      if (last.endsWith("%")) {
        const n = Number(last.slice(0, -1));
        if (Number.isFinite(n)) return n / 100;
      }
      return 1;
    })();

    const isStartInView = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const h = window.innerHeight || 0;
      const thresholdY = h * startThreshold;
      return rect.top <= thresholdY && rect.bottom >= 0;
    };

    const ctx = gsap.context(() => {
      for (const el of elements) {
        const initX = toNumber(el.dataset.animateX) ?? x;
        const initY = toNumber(el.dataset.animateY) ?? y;
        const initScale = toNumber(el.dataset.animateScale) ?? scale;
        const elDelay = toNumber(el.dataset.animateDelay) ?? 0;
        const elDuration = toNumber(el.dataset.animateDuration) ?? duration;

        gsap.set(el, { autoAlpha: 0, x: initX, y: initY, scale: initScale });

        const animateIn = () => {
          if (once && animated.has(el)) return;
          animated.add(el);
          gsap.to(el, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: elDuration,
            delay: elDelay,
            ease,
            overwrite: "auto",
            clearProps: "transform",
          });
        };

        const trigger = ScrollTrigger.create({
          trigger: el,
          start,
          once,
          invalidateOnRefresh: true,
          onEnter: animateIn,
          onLeaveBack: once
            ? undefined
            : () => {
                animated.delete(el);
                gsap.set(el, {
                  autoAlpha: 0,
                  x: initX,
                  y: initY,
                  scale: initScale,
                });
              },
        });

        triggers.push(trigger);
        entries.push({ el, trigger, animateIn });
      }
    }, scope);

    ScrollTrigger.refresh();
    for (const { el, trigger, animateIn } of entries) {
      if (trigger.isActive || trigger.progress > 0 || isStartInView(el))
        animateIn();
    }

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      for (const { el, trigger, animateIn } of entries) {
        if (trigger.isActive || trigger.progress > 0 || isStartInView(el))
          animateIn();
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      for (const t of triggers) t.kill();
      ctx.revert();
    };
  }, [duration, ease, once, reduceMotion, revealSelector, scale, start, x, y]);

  return (
    <div ref={scopeRef} className={className}>
      {children}
    </div>
  );
}
