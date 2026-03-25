import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const ExperienceIntro = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsVisible(false);
        },
      });

      // Initial state
      gsap.set(".logo-path", {
        fillOpacity: 0,
        stroke: "#004b9f",
        strokeWidth: 2,
        strokeDasharray: (_i, target) => target.getTotalLength(),
        strokeDashoffset: (_i, target) => target.getTotalLength(),
      });

      gsap.set(textRef.current, {
        opacity: 0,
        y: 20,
      });

      // Animation sequence
      tl
        // 1. Logo Appears
        .to(".logo-path", {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power2.inOut",
          stagger: 0.2,
        })
        .to(
          ".logo-path",
          {
            fillOpacity: 1,
            strokeOpacity: 0,
            duration: 1,
            ease: "power2.in",
          },
          "-=0.5",
        )
        // 2. Logo Disappears (reverse)
        .to(
          ".logo-path",
          {
            fillOpacity: 0,
            strokeOpacity: 1,
            duration: 1,
            ease: "power2.out",
          },
          "+=0.5",
        )
        .to(".logo-path", {
          strokeDashoffset: (_i, target) => target.getTotalLength(),
          duration: 1.5,
          ease: "power2.inOut",
          stagger: {
            each: 0.1,
            from: "end", // Reverse order
          },
        })
        // 3. Text 'Experience' Appears
        .to(textRef.current, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        })
        // 4. Text Disappears
        .to(textRef.current, {
          opacity: 0,
          y: -20,
          duration: 1,
          ease: "power3.in",
          delay: 1, // Stay visible for 1s
        });
      // 5. Done (container stays white because it's just bg-white,
      // and then component unmounts revealing underlying page)
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-white"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Logo */}
        <svg
          ref={logoRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 296.87"
          className="w-32 h-auto md:w-48 lg:w-64 absolute"
        >
          <title>NuriaLogo.blue</title>
          <path
            className="logo-path"
            d="M25.94,0C34,0,42.12,0,50.21,0a2.1,2.1,0,0,1,1.9.93q24.12,31,48.28,62l60.66,77.92q17.87,22.95,35.7,45.94a3.23,3.23,0,0,1,.64,1.84c.07,2.58,0,5.15.05,7.73,0,.92-.24,1.28-1.21,1.27-16.42,0-32.85,0-49.27,0a2.44,2.44,0,0,1-1.62-1Q119.78,163.84,94.28,131L24.61,41.41Q12.69,26.08.76,10.72A3.87,3.87,0,0,1,.05,8.66C0,6.2.06,3.75,0,1.29,0,.29.3,0,1.31,0,9.52,0,17.73,0,25.94,0Z"
            transform="translate(0)"
            fill="#004b9f"
          />
          <path
            className="logo-path"
            d="M197.42,243.26v49.59c0,1.63,0,1.64-1.65,1.64H1.71c-1.68,0-1.69,0-1.69-1.65q0-24,0-48.06c0-1.19.28-1.56,1.54-1.55q97.2,0,194.41,0Z"
            transform="translate(0)"
            fill="#004b9f"
          />
          <path
            className="logo-path"
            d="M.31,52.2l6,7.68q22.17,28.49,44.31,57a3.24,3.24,0,0,1,.65,1.84q0,38.76.05,77.52c0,1.12-.33,1.43-1.43,1.43q-24.15,0-48.29,0C0,197.63,0,197.62,0,196V52.31Z"
            transform="translate(0)"
            fill="#004b9f"
          />
          <path
            className="logo-path"
            d="M197.34,145.37c-.32-.36-.56-.6-.77-.87q-24.91-32-49.8-64a3.69,3.69,0,0,1-.59-2.11c0-9.94,0-19.88,0-29.82V1.68c0-1.66,0-1.66,1.63-1.66h49.56Z"
            transform="translate(0)"
            fill="#004b9f"
          />
        </svg>

        {/* Text */}
        <div
          ref={textRef}
          className="absolute text-4xl md:text-8xl font-bold text-[#004b9f] font-title tracking-widest uppercase"
        >
          Experience
        </div>
      </div>
    </div>
  );
};

export default ExperienceIntro;
