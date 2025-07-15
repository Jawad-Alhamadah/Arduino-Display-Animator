import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import UNICODE_SYMBOLS from "./unicodeSymbols";
import { FaStamp } from "react-icons/fa";
import PIXEL_FONT_7x7 from "./pixelFont7x7";

export default function StampPicker({ onSelect ,classes ,toggleTools, activateToolEnum}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef();
  const buttonRef = useRef();
  
  // Get all icon stamps (entries with non-null icon property)
  const iconStamps = Object.keys(PIXEL_FONT_7x7).filter(
    key => PIXEL_FONT_7x7[key] && PIXEL_FONT_7x7[key].icon !== null
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleMouseLeave = (e) => {
    if (!panelRef.current.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        className="bg-slate-900 rounded shadow text-iconColor hover:scale-125 hover:text-iconColorHover"
        onClick={(e) => {
          e.preventDefault();
          open ? setOpen(false) : handleOpen();
        }}
      >
        <FaStamp className={classes}></FaStamp>
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
            border border-slate-700 text-yellow-500"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))',
            }}
          >
            {/* React Icons Section */}
            {iconStamps && iconStamps.length > 0 && (
              <div className="col-span-full mb-2">
                <div className="text-xs text-gray-400 mb-1">Icons:</div>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {iconStamps.map((key) => (
                    <button
                      key={`icon-${key}`}
                      className="text-yellow-400 w-8 h-8 flex items-center justify-center hover:bg-slate-800 rounded"
                      onClick={() => {
                        // Pass the key, not the matrix directly
                        toggleTools(activateToolEnum.stamb)
                        onSelect && onSelect(key);
                        setOpen(false);
                        
                      }}
                      tabIndex={-1}
                      type="button"
                    >
                      {PIXEL_FONT_7x7[key].icon}
                    </button>
                  ))}
                </div>
                <div className="border-b border-slate-700 mt-2 mb-2"></div>
              </div>
            )}
            
            {/* Unicode Symbols */}
            <div className="col-span-full mb-1">
              <div className="text-xs text-gray-400">Unicode Symbols:</div>
            </div>
            {UNICODE_SYMBOLS.map((sym, i) => (
              <button
                key={i}
                className="text-iconColor text-xs w-5 h-5 flex items-center justify-center hover:bg-slate-800 rounded"
                onClick={() => { 
                  toggleTools(activateToolEnum.stamb)
                  onSelect && onSelect(sym); 
                  setOpen(false); 
                }}
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