import { useState, useEffect, useRef } from "react";

// ============================================================
// COUNT-UP ANIMATION HOOK
// ============================================================
export const useCountUp = (target, duration = 600) => {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    if (target === prev.current) return;
    const start = prev.current, diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + diff * ease));
      if (progress < 1) requestAnimationFrame(tick);
      else { prev.current = target; setDisplay(target); }
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return display;
};
