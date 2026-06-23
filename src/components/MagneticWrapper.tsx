import React, { useRef, ReactElement } from "react";
import gsap from "gsap";

interface MagneticWrapperProps {
  children: ReactElement;
  className?: string;
  strength?: number;
}

export default function MagneticWrapper({
  children,
  className = "",
  strength = 0.6,
}: MagneticWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || !el.firstElementChild) return;

    // Check if the first child is an HTMLElement
    const target = el.firstElementChild as HTMLElement;

    const { clientX, clientY } = e;
    const { width, height, left, top } = el.getBoundingClientRect();

    // Calculate distance from center
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    // Moves the element towards the outer container's cursor position smoothly
    gsap.to(target, {
      x: x * strength,
      y: y * strength,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    const el = containerRef.current;
    if (!el || !el.firstElementChild) return;

    const target = el.firstElementChild as HTMLElement;

    // Fun snap back to center when leaving the extended area, resetting any scale as well
    gsap.to(target, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: "elastic.out(1.2, 0.3)",
      overwrite: "auto",
    });
  };

  const handleMouseDown = () => {
    const el = containerRef.current;
    if (!el || !el.firstElementChild) return;
    const target = el.firstElementChild as HTMLElement;
    gsap.to(target, {
      scale: 0.93,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseUp = () => {
    const el = containerRef.current;
    if (!el || !el.firstElementChild) return;
    const target = el.firstElementChild as HTMLElement;
    gsap.to(target, {
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1.2, 0.4)",
      overwrite: "auto",
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`relative inline-flex p-8 -m-8 cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
