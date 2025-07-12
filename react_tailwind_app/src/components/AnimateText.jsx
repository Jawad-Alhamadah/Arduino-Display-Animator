import { useState, useEffect } from "react";

export function AnimateText({ text="", speed = 30, className = "" }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <pre className={`whitespace-pre font-mono ${className}`}>
      {displayed}
      <span className="animate-pulse text-purple-500">|</span>
    </pre>
  );
}

export default AnimateText