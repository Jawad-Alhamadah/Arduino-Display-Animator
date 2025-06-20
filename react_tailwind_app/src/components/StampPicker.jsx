import React, { useState, useRef } from "react";

const UNICODE_SYMBOLS = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."abcdefghijklmnopqrstuvwxyz",
  ..."0123456789",
  "★", "☆", "♥", "♦", "♣", "♠", "✓", "✗", "→", "←", "↑", "↓", "∞", "≠", "≈", "±", "÷", "×", "§", "¶",
  "😀", "😂", "😍", "😎", "👍", "🎉", "🔥", "💡", "🚀", "🌟", "❤️", "😃", "😅", "😇", "😉", "😋", "😜", "😢", "😭", "😡"
];

export default function StampPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef();

  // Keep open while hovering
  const handleMouseLeave = (e) => {
    // Only close if mouse leaves the panel, not if entering a child
    if (!panelRef.current.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        className="bg-slate-900 text-teal-400 px-2 py-1 rounded shadow outline outline-1 outline-teal-400"
        onClick={() => setOpen((v) => !v)}
      >
        🖋️ Stamps
      </button>
      {open && (
        <div
          ref={panelRef}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={() => setOpen(true)}
          className="absolute z-50 mt-2 p-2 bg-slate-900 rounded shadow-lg outline outline-1 outline-teal-400 flex flex-wrap max-w-[320px] max-h-[220px] overflow-auto"
        >
          {UNICODE_SYMBOLS.map((sym, i) => (
            <button
              key={i}
              className="text-teal-400 text-2xl m-1 w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded"
              onClick={() => { onSelect(sym); setOpen(false); }}
              tabIndex={-1}
              type="button"
            >
              {sym}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}