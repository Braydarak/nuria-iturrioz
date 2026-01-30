import React, { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";

interface MasonryItem {
  id: string | number;
  img: string;
  url?: string;
  height: number;
  title?: string;
  [key: string]: unknown;
}

interface MasonryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "top" | "bottom" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}

export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 1.05,
  blurToFocus = true,
  colorShiftOnHover = false,
}: MasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number>(3);

  // Responsive column calculation
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1024) setColumns(3);
      else setColumns(4); // Desktop default
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Distribute items into columns
  const columnItems = useMemo(() => {
    const cols: MasonryItem[][] = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);

    items.forEach((item) => {
      const shortestColIndex = heights.indexOf(Math.min(...heights));
      cols[shortestColIndex].push(item);
      // We use aspect ratio if available, or just add height.
      // Since we force width to be 100% of column, height is proportional to item.height
      // But we assume item.height is the actual pixel height or relative.
      // For distribution, adding raw height is fine.
      heights[shortestColIndex] += item.height;
    });

    return cols;
  }, [items, columns]);

  // Animation
  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(".masonry-item");

    // Set initial state based on animateFrom
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialVars: any = { opacity: 0 };

    if (blurToFocus) {
      initialVars.filter = "blur(10px)";
    }

    switch (animateFrom) {
      case "bottom":
        initialVars.y = 50;
        break;
      case "top":
        initialVars.y = -50;
        break;
      case "left":
        initialVars.x = -50;
        break;
      case "right":
        initialVars.x = 50;
        break;
      case "center":
        initialVars.scale = 0.8;
        break;
      case "random":
        initialVars.y = () => Math.random() * 100 - 50;
        initialVars.x = () => Math.random() * 100 - 50;
        break;
    }

    gsap.fromTo(elements, initialVars, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: duration,
      stagger: stagger,
      ease: ease,
    });
  }, [items, columns, animateFrom, duration, stagger, ease, blurToFocus]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scaleOnHover) {
      gsap.to(e.currentTarget.querySelector("img"), {
        scale: hoverScale,
        duration: 0.4,
        ease: "power2.out",
      });
    }
    if (colorShiftOnHover) {
      // Optional effect
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scaleOnHover) {
      gsap.to(e.currentTarget.querySelector("img"), {
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  };

  return (
    <div ref={containerRef} className="flex gap-4 w-full">
      {columnItems.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4 flex-1">
          {col.map((item) => (
            <div
              key={item.id}
              className="masonry-item relative overflow-hidden rounded-lg cursor-pointer"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => item.url && window.open(item.url, "_blank")}
            >
              <img
                src={item.img}
                alt={`Masonry item ${item.id}`}
                className="w-full h-auto block"
                style={{ willChange: "transform" }}
              />

              {/* Overlay with title (preserved from previous design) */}
              {item.title && (
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-sm font-medium line-clamp-2 transform translate-y-2 hover:translate-y-0 transition-transform duration-300">
                    {item.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
