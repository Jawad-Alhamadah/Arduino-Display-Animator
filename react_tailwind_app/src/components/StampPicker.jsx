import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import UNICODE_SYMBOLS from "./unicodeSymbols";
import { FaStamp } from "react-icons/fa6";

export default function StampPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef();
  const buttonRef = useRef();
  const [panelStyle, setPanelStyle] = useState({});

  const calculatePosition = () => {
    if (!buttonRef.current) return null;

    const btnRect = buttonRef.current.getBoundingClientRect();
    let width = Math.min(window.innerWidth - 32, 600);
    if (window.innerWidth < 400) width = window.innerWidth - 16;

    let left = btnRect.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    if (left < 8) left = 8;

    return {
      position: "fixed",
      top: btnRect.bottom + 6,
      left,
      width,
      minWidth: 180,
      maxWidth: 600,
      zIndex: 9999,
    };
  };

  const handleOpen = () => {
    const position = calculatePosition();
    if (position) {
      setPanelStyle(position);
      setOpen(true);
    }
  };

  const handleMouseLeave = (e) => {
    if (!panelRef.current.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button" // Explicitly set type to "button"
        className="bg-slate-900 text-teal-400 px-2 py-1 rounded shadow outline outline-1 outline-teal-400"
        onClick={(e) => {
          e.preventDefault(); // Prevent default behavior
          open ? setOpen(false) : handleOpen();
        }}
      >
        <FaStamp></FaStamp>
      </button>
      {open && ReactDOM.createPortal(
        <>
          <div
            ref={panelRef}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setOpen(true)}
            className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]
            z-[1000] bg-slate-900 rounded-lg shadow-xl p-4
            w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw]
            max-w-[500px] min-w-[280px]
            max-h-[80vh] overflow-y-auto
            grid auto-rows-auto gap-2
            border border-slate-700"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))',
            }}
          >
            {UNICODE_SYMBOLS.map((sym, i) => (
              <button
                key={i}
                className="text-teal-400 text-xs w-5 h-5 flex items-center justify-center hover:bg-slate-800 rounded"
                onClick={() => { onSelect && onSelect(sym); setOpen(false); }}
                tabIndex={-1}
                type="button"
              >
                {sym}
              </button>
            ))}
          </div>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[999]" 
            onClick={() => setOpen(false)} 
          />
        </>,
        document.body
      )}
    </div>
  );
}