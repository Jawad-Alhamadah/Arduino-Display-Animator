import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setToKeyboardKey } from '../reducers/currentKeyboardKey';
import { generate_oled_code_RLE } from "./generatedCodeTemplates";
import PIXEL_FONT_7x7 from "./pixelFont7x7";
import UNICODE_SYMBOLS from "./unicodeSymbols";
const WIDTH = 128;
const HEIGHT = 64;
import React from "react"
function getPixelSize() {
  if (typeof window !== "undefined" && window.innerWidth < 450) {
    return 2;
  }
  return 2.5;
}


export default function Oled128x64(props) {
  const [pixelSize, setPixelSize] = useState(getPixelSize());
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [lineStartPoint, setLineStartPoint] = useState(null);

  useEffect(() => {
    function handleResize() {
      setPixelSize(getPixelSize());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value);
  const prevMousePosRef = useRef({ x: null, y: null });
  let currentKeyboardKey = useSelector((state) => state.currentKeyboardKey.value)
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const brushSize = props.brushSize || 1;
  const didDragRef = useRef(false);
  const [prevClickPoint, setPrevClickPoint] = useState(null);
  const [lastReleasePoint, setLastReleasePoint] = useState(null);

  const [cursorPos, setCursorPos] = useState({ x: null, y: null });
  const [isCursorOver, setIsCursorOver] = useState(false);

  function constrainLine(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    if (dx === 0 || dy === 0) {
      // vertical or horizontal
      return [x1, y1];
    }
    if (Math.abs(dx - dy) < 2) {
      // 45 degree diagonal
      const signX = x1 > x0 ? 1 : -1;
      const signY = y1 > y0 ? 1 : -1;
      const len = Math.min(dx, dy);
      return [x0 + signX * len, y0 + signY * len];
    }
    // Snap to closest axis
    if (dx > dy) return [x1, y0];
    return [x0, y1];
  }

  useEffect(() => {
    drawCanvas();
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [props.oledMatrix, pixelSize]);

  useEffect(() => {
    drawCanvas();
  }, [currentMatrixKey, pixelSize]);

  useEffect(() => {
    const handleGlobalMouseUp = (event) => {
      // Don't set lastReleasePoint in the global handler when we've already set it during Shift+Ctrl drawing
      if (isShiftPressed) {
        setIsDrawing(false);
        prevMousePosRef.current = { x: null, y: null };
        return;
      }
      
      // Normal release point handling for non-shift drawing
      setIsDrawing(false);
      prevMousePosRef.current = { x: null, y: null };

      // Get mouse position at release
      if (canvasRef.current && event) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / pixelSize);
        const y = Math.floor((event.clientY - rect.top) / pixelSize);
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
          setLastReleasePoint({ x, y });
        }
      }

      // Call stroke end callback to record history after a complete draw operation
      if (props.onStrokeEnd && didDragRef.current) {
        const matrixObj = props.oledMatrix.find(obj => obj.key === currentMatrixKey);
        if (matrixObj) {
          props.onStrokeEnd(structuredClone(matrixObj.matrix));
        }
        didDragRef.current = false;
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isShiftPressed, props.setOledMatrix, currentMatrixKey, pixelSize, isErasing, props.onStrokeEnd]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH * pixelSize, HEIGHT * pixelSize);
    console.log(props.oledMatrix)
    console.log(currentMatrixKey)
    props.oledMatrix.find(obj => obj.key === currentMatrixKey).matrix.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel) {
          ctx.fillStyle = "#06b6d4";
          ctx.fillRect(Math.round(x * pixelSize), Math.round(y * pixelSize), Math.ceil(pixelSize), Math.ceil(pixelSize));
        }
      });
    });
  };

  // Modify the handleCanvasMouseDown function to fix stamp history tracking
  const handleCanvasMouseDown = (event) => {
    const { x, y } = getMousePosition(event);
    
    // Handle stamp drawing first
    if (props.stampSymbol && x !== null && y !== null) {
      // Get current matrix before modification
      const currentMatrix = props.oledMatrix.find(obj => obj.key === currentMatrixKey);
      if (!currentMatrix) return;
      
      // Save current state for history ONLY ONCE before making changes
      if (props.onStrokeEnd) {
        props.onStrokeEnd(structuredClone(currentMatrix.matrix));
      }
      
      // Then apply the stamp
      props.setOledMatrix((prev) => {
        const newMatrix = structuredClone(prev);
        const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
        if (!matrixObj) return prev;
        
        // Get the stamp pattern
        let stampMatrix = null;
        
        // If it's a key in PIXEL_FONT_7x7 (including our icon stamps)
        if (props.stampSymbol && PIXEL_FONT_7x7[props.stampSymbol] && PIXEL_FONT_7x7[props.stampSymbol].matrix) {
          stampMatrix = PIXEL_FONT_7x7[props.stampSymbol].matrix;
        } 
        // If it's an array directly (matrix passed directly)
        else if (Array.isArray(props.stampSymbol) && props.stampSymbol.length > 0) {
          stampMatrix = props.stampSymbol;
        }
        // Fallback for regular characters
        else if (typeof props.stampSymbol === 'string' && /^[A-Za-z0-9.]$/.test(props.stampSymbol)) {
          // Render to canvas and get pixel data
          const size = 7;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, size, size);
          ctx.font = "normal 7px Arial, monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#06b6d4";
          ctx.fillText(props.stampSymbol, size / 2, size / 2 + 0.5);

          const data = ctx.getImageData(0, 0, size, size).data;
          stampMatrix = [];
          for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
              row.push(data[(y * size + x) * 4 + 3] > 120);
            }
            stampMatrix.push(row);
          }
        } 
        // Default fallback - single pixel
        else {
          stampMatrix = Array(7).fill().map(() => Array(7).fill(0));
          stampMatrix[3][3] = 1;
        }
        
        // Safety check
        if (!stampMatrix || !Array.isArray(stampMatrix)) {
          stampMatrix = Array(7).fill().map(() => Array(7).fill(0));
          stampMatrix[3][3] = 1;
          return prev;
        }
        
        // Apply the stamp to the matrix
        const rows = stampMatrix.length;
        const cols = stampMatrix[0].length;
        
        for (let sy = 0; sy < rows; sy++) {
          for (let sx = 0; sx < cols; sx++) {
            const targetX = x - Math.floor(cols / 2) + sx;
            const targetY = y - Math.floor(rows / 2) + sy;
            
            if (targetX >= 0 && targetX < WIDTH && targetY >= 0 && targetY < HEIGHT) {
              if (stampMatrix[sy][sx]) {
                matrixObj.matrix[targetY][targetX] = !isErasing;
              }
            }
          }
        }
        
        return newMatrix;
      });
      
      // Update last release point for next operation
      setLastReleasePoint({ x, y });
      return;
    }
    
    // Handle shift + mouse down to draw a line from last position
    if (isShiftPressed && x !== null && y !== null) {
      // Get the starting point - either last release point or current position
      const startPoint = lastReleasePoint || { x, y };
      let endX = x;
      let endY = y;
      
      // Check if Ctrl key is pressed
      const isCtrlPressed = event.ctrlKey || currentKeyboardKey === "ControlLeft";
      
      // If Ctrl is pressed, constrain the line direction
      if (isCtrlPressed) {
        const dx = Math.abs(endX - startPoint.x);
        const dy = Math.abs(endY - startPoint.y);
        
        // Constrain to horizontal, vertical, or 45° diagonal
        if (dx > dy) {
          // Horizontal line
          endY = startPoint.y;
        } else if (dy > dx) {
          // Vertical line
          endX = startPoint.x;
        } else {
          // Diagonal (45 degree)
          const signX = endX > startPoint.x ? 1 : -1;
          const signY = endY > startPoint.y ? 1 : -1;
          const min = Math.min(dx, dy);
          endX = startPoint.x + signX * min;
          endY = startPoint.y + signY * min;
        }
      }
      
      // Get current matrix before modification
      const currentMatrix = props.oledMatrix.find(obj => obj.key === currentMatrixKey);
      if (!currentMatrix) return;
      
      // Save current state for history ONLY ONCE before making changes
      if (props.onStrokeEnd) {
        props.onStrokeEnd(structuredClone(currentMatrix.matrix));
      }
      
      // Draw the line (rest of the existing code)
      props.setOledMatrix((prev) => {
        const newMatrix = structuredClone(prev);
        const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
        if (!matrixObj) return prev;
        
        // Draw the line
        drawInterpolatedLine(
          matrixObj.matrix, 
          startPoint.x, 
          startPoint.y, 
          endX, 
          endY, 
          !isErasing
        );
        
        return newMatrix;
      });
      
      // Update for next line segment
      setLastReleasePoint({ x: endX, y: endY });
      return;
    }
    
    // Normal drawing mode - no changes needed here
    setIsDrawing(true);
    
    // Initial point for normal drawing
    if (x !== null && y !== null) {
      props.setOledMatrix((prev) => {
        const newMatrix = structuredClone(prev);
        const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
        if (!matrixObj) return prev;
        
        drawBrush(matrixObj.matrix, x, y, !isErasing);
        return newMatrix;
      });
      
      prevMousePosRef.current = { x, y };
    }
  };

  function drawBrush(matrix, x, y, value) {
    const half = Math.floor(brushSize / 2);
    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
          matrix[ny][nx] = value;
        }
      }
    }
  }

  function drawInterpolatedLine(matrix, x0, y0, x1, y1, value) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (x0 >= 0 && x0 < WIDTH && y0 >= 0 && y0 < HEIGHT) {
        drawBrush(matrix, x0, y0, value);
      }

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  const handleCanvasMouseMove = (event) => {
    const { x, y } = getMousePosition(event);
    setCursorPos({ x, y });

    // If shift is pressed, we'll draw a line from last release point or last drawn point
    if (isShiftPressed && (lastReleasePoint || prevMousePosRef.current.x !== null)) {
      // We're just updating the cursor - actual drawing happens on mouse down or up
      return;
    }

    if (!isDrawing) return;
    didDragRef.current = true;

    const { x: prevX, y: prevY } = prevMousePosRef.current;

    if (x === null || y === null) return;

    props.setOledMatrix((prev) => {
      const newMatrix = structuredClone(prev);
      const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
      if (!matrixObj) return prev;

      if (prevX !== null && prevY !== null) {
        drawInterpolatedLine(matrixObj.matrix, prevX, prevY, x, y, !isErasing);
      } else {
        drawBrush(matrixObj.matrix, x, y, !isErasing);
      }

      return newMatrix;
    });

    prevMousePosRef.current = { x, y };
  };

  const handleCanvasMouseLeave = () => {
    setIsCursorOver(false);
    setCursorPos({ x: null, y: null });
  };

  const handleCanvasMouseEnter = () => {
    setIsCursorOver(true);
  };

  const getMousePosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX / pixelSize);
    const y = Math.floor((event.clientY - rect.top) * scaleY / pixelSize);
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return { x: null, y: null };
    return { x, y };
  };

  useEffect(() => {
    if (currentKeyboardKey === "KeyD") {
      setIsErasing(true);
      return
    }
    setIsErasing(false);
  }, [currentKeyboardKey])

  const handleCanvasClick = (event) => {
    if (didDragRef.current) {
      // Ignore click if it was a drag
      didDragRef.current = false;
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);

    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      props.setOledMatrix((prev) => {
        const newMatrix = structuredClone(prev);
        const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
        matrixObj.matrix[y][x] = !matrixObj.matrix[y][x];
        return newMatrix;
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
        setLineStartPoint(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Look for the drawStamp function or similar and update it:

  const drawStamp = (x, y, symbol) => {
    if (!symbol) return;
    
    let matrix;
    
    // If it's a key in PIXEL_FONT_7x7 (including our icon stamps)
    if (PIXEL_FONT_7x7[symbol] && PIXEL_FONT_7x7[symbol].matrix) {
      matrix = PIXEL_FONT_7x7[symbol].matrix;
    } 
    // If it's an array directly (matrix passed directly)
    else if (Array.isArray(symbol) && symbol.length > 0) {
      matrix = symbol;
    }
    // If nothing worked, exit early
    if (!matrix || !Array.isArray(matrix) || !matrix.length) {
      return;
    }

    // Now draw the matrix
    const h = matrix.length;
    const w = matrix[0].length;
    
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        if (matrix[i][j]) {
          drawPixel(x + j, y + i);
        }
      }
    }
  };

  return (
    <>
      <div style={{ position: "relative", width: WIDTH * pixelSize, height: HEIGHT * pixelSize }}>
        <canvas
          ref={canvasRef}
          width={WIDTH * pixelSize}
          height={HEIGHT * pixelSize}
          style={{ display: "block" }}
          className="border border-slate-700 cursor-none"
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          onMouseEnter={handleCanvasMouseEnter}
          onMouseDown={handleCanvasMouseDown}
        />
        {/* Cursor indicator */}
        {isCursorOver && cursorPos.x !== null && cursorPos.y !== null && (
          props.stampSymbol ? (
            (() => {
              let matrix = null;

              // If it's a key in PIXEL_FONT_7x7 (including our icon stamps)
              if (props.stampSymbol && PIXEL_FONT_7x7[props.stampSymbol] && PIXEL_FONT_7x7[props.stampSymbol].matrix) {
                matrix = PIXEL_FONT_7x7[props.stampSymbol].matrix;
              } 
              // If it's an array directly (matrix passed directly)
              else if (Array.isArray(props.stampSymbol) && props.stampSymbol.length > 0) {
                matrix = props.stampSymbol;
              }
              // Fallback for regular characters
              else if (typeof props.stampSymbol === 'string' && /^[A-Za-z0-9.]$/.test(props.stampSymbol)) {
                // Render to 7x7 canvas and threshold for alphanumerics
                const size = 7;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, size, size);
                ctx.font = "normal 7px Arial, monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#06b6d4";
                ctx.fillText(props.stampSymbol, size / 2, size / 2 + 0.5);

                const data = ctx.getImageData(0, 0, size, size).data;
                matrix = [];
                for (let y = 0; y < size; y++) {
                  const row = [];
                  for (let x = 0; x < size; x++) {
                    row.push(data[(y * size + x) * 4 + 3] > 120);
                  }
                  matrix.push(row);
                }
              } 
              // Default fallback - single pixel
              else {
                matrix = Array(7).fill(0).map(() => Array(7).fill(0));
                matrix[3][3] = 1;
              }

              // Safety check
              if (!matrix || !Array.isArray(matrix)) {
                matrix = Array(7).fill(0).map(() => Array(7).fill(0));
                matrix[3][3] = 1;
              }

              const rows = matrix.length;
              const cols = matrix[0].length;

              return (
                <div
                  style={{
                    position: "absolute",
                    pointerEvents: "none",
                    left: (cursorPos.x - Math.floor(cols / 2)) * pixelSize,
                    top: (cursorPos.y - Math.floor(rows / 2)) * pixelSize,
                    width: cols * pixelSize,
                    height: rows * pixelSize,
                    zIndex: 20,
                    display: "grid",
                    gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
                    gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
                    background: "rgba(0,0,0,0.08)",
                  }}
                >
                  {matrix.flat().map((on, i) => (
                    <div
                      key={i}
                      style={{
                        width: pixelSize,
                        height: pixelSize,
                        background: on ? "#06b6d4" : "transparent",
                      }}
                    />
                  ))}
                </div>
              );
            })()
          ) : (
            <div
              style={{
                position: "absolute",
                pointerEvents: "none",
                left: (cursorPos.x - Math.floor(brushSize / 2)) * pixelSize,
                top: (cursorPos.y - Math.floor(brushSize / 2)) * pixelSize,
                width: brushSize * pixelSize + 1,
                height: brushSize * pixelSize + 1,
                border: "2px solid #55c7f4",
                background: "rgba(59, 130, 246, 0.15)",
                boxSizing: "border-box",
                zIndex: 10,
              }}
            />
          )
        )}
      </div>
    </>
  );
}