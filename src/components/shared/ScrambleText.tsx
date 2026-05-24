"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%<>/\\[]{}!*?";

export default function ScrambleText({
  text,
  delay = 0,
  duration = 1.3,
  className,
}: {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState(text);
  const revealOrder = useRef<number[]>([]);

  useEffect(() => {
    revealOrder.current = text.split("").map(() => Math.random());

    let interval: ReturnType<typeof setInterval>;
    let elapsed = 0;
    const step = 38;
    const totalTime = duration * 1000;

    const startTimer = setTimeout(() => {
      setDisplayed(
        text.split("").map((c) =>
          /\s/.test(c) ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join("")
      );
      interval = setInterval(() => {
        elapsed += step;
        const progress = Math.min(elapsed / totalTime, 1);

        setDisplayed(
          text.split("").map((char, i) => {
            if (/\s/.test(char)) return char;
            if (progress >= revealOrder.current[i] * 0.88) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("")
        );

        if (elapsed >= totalTime) {
          clearInterval(interval);
          setDisplayed(text);
        }
      }, step);
    }, delay * 1000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, [text, delay, duration]);

  return (
    <span suppressHydrationWarning className={className}>
      {displayed}
    </span>
  );
}
