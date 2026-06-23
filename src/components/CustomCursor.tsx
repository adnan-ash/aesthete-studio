import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState("");

  const mouseRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only enable on desktop / systems with fine pointers
    const isTouchDevice = () => {
      try {
        return (
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0
        );
      } catch (e) {
        return false;
      }
    };

    if (isTouchDevice()) {
      return;
    }

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const updatePosition = () => {
      // Lerp (Linear Interpolation) for smooth follower ring effect
      const ease = 0.15; // Speed of following
      ringPosRef.current.x += (mouseRef.current.x - ringPosRef.current.x) * ease;
      ringPosRef.current.y += (mouseRef.current.y - ringPosRef.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`;
      }

      requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", onMouseMove);
    const animationFrameId = requestAnimationFrame(updatePosition);

    // Mouseenter/mouseleave/over event detection for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find closest element with specific roles or cursor-pointer styles
      const interactiveEl = target.closest(
        'button, a, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor]'
      ) as HTMLElement | null;

      if (interactiveEl) {
        setIsHovered(true);

        // Check if there is high-end custom instruction for cursor (like data-cursor-text or data-cursor)
        const customCursorVal = interactiveEl.getAttribute("data-cursor");
        const customText = interactiveEl.getAttribute("data-cursor-text");

        if (customCursorVal === "zoom" || customCursorVal === "view" || customCursorVal === "drag") {
          setCursorText(customText || customCursorVal.toUpperCase());
        } else if (customText) {
          setCursorText(customText);
        } else {
          setCursorText("");
        }
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    window.addEventListener("mouseover", handleMouseOver);

    // Dynamic visibility check (if mouse leaves viewport)
    const handleMouseLeaveWindow = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const handleMouseEnterWindow = () => {
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Hide default cursor on desktop styling */}
      <style>{`
        @media (pointer: fine) {
          body, a, button, select, input, [role="button"], .cursor-pointer {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Primary Dot Cursor - Centered, fast, instant feedback */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-accent rounded-full pointer-events-none z-[9999] transition-opacity duration-300 pointer-events-none"
        style={{ willChange: "transform", pointerEvents: "none" }}
      />

      {/* Floating Interactive Ring Follower */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] rounded-full flex items-center justify-center transition-all duration-300 ease-out border pointer-events-none ${
          isHovered
            ? "border-accent w-16 h-16 -ml-8 -mt-8 bg-accent/5 backdrop-blur-[1px] scale-100"
            : "border-accent/40 w-8 h-8 -ml-4 -mt-4 bg-transparent scale-100"
        }`}
        style={{ willChange: "transform", pointerEvents: "none" }}
      >
        {/* Dynamic Contextual Text inside ring */}
        {cursorText && (
          <span
            ref={textRef}
            className="text-[8px] font-sans font-bold tracking-[0.2em] text-accent uppercase animate-fade-in mt-[1px]"
          >
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
}
