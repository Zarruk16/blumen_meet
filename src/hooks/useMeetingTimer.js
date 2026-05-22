"use client";

import { useEffect, useState } from "react";

/**
 * Elapsed meeting timer (mm:ss) from a start timestamp.
 */
export function useMeetingTimer(startedAt) {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!startedAt) {
      setElapsed("00:00");
      return;
    }

    const format = (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const tick = () => {
      setElapsed(format(Date.now() - startedAt));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}
