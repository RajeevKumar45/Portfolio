import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently under the reading line
 * (40% of the viewport height, capped at 320px from the top).
 * `ids` must be a stable array (for example, a module-level constant).
 */
export function useActiveSection<T extends string>(ids: readonly T[]): T | undefined {
  const [active, setActive] = useState<T | undefined>(ids[0]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const readingLine = Math.min(window.innerHeight * 0.4, 320);
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      let current: T | undefined = ids[0];
      if (scrolledToBottom) {
        current = ids[ids.length - 1];
      } else {
        for (const id of ids) {
          const element = document.getElementById(id);
          if (element && element.getBoundingClientRect().top <= readingLine) current = id;
        }
      }
      setActive((previous) => (previous === current ? previous : current));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids]);

  return active;
}
