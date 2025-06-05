import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setToKeyboardKey } from '../reducers/currentKeyboardKey';
import { generate_oled_code_RLE } from "./generatedCodeTemplates";

const WIDTH = 128;
const HEIGHT = 64;
const PIXEL_SIZE = 2; // Controls how large each pixel appears

export default function Oled128x64(props) {
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
  }, [props.oledMatrix]);

  useEffect(() => {
    drawCanvas();
  }, [currentMatrixKey]);

  useEffect(() => {
    const handleGlobalMouseUp = (event) => {
      setIsDrawing(false);
      prevMousePosRef.current = { x: null, y: null };

      // Get mouse position at release
      if (canvasRef.current && event) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
        const y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
          setLastReleasePoint({ x, y });
        }
      }

      if (props.onStrokeEnd) {
        const matrixObj = props.oledMatrix.find(obj => obj.key === currentMatrixKey);
        if (matrixObj) {
          props.onStrokeEnd(structuredClone(matrixObj.matrix));
        }
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [props.onStrokeEnd, props.oledMatrix, currentMatrixKey]);


  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH * PIXEL_SIZE, HEIGHT * PIXEL_SIZE);

    props.oledMatrix.find(obj => obj.key === currentMatrixKey).matrix.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel) {
          ctx.fillStyle = "#06b6d4";
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      });
    });
  };

const handleCanvasMouseDown = (event) => {
  const { x, y } = getMousePosition(event);
  if (x === null || y === null) return;

  const shift = event.shiftKey;
  const ctrl = event.ctrlKey || event.metaKey;

  if (shift && lastReleasePoint) {
    let [x0, y0] = [lastReleasePoint.x, lastReleasePoint.y];
    let [x1, y1] = [x, y];
    if (ctrl) {
      [x1, y1] = constrainLine(x0, y0, x1, y1);
    }
    props.setOledMatrix((prev) => {
      const newMatrix = structuredClone(prev);
      const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
      if (!matrixObj) return prev;
      drawInterpolatedLine(matrixObj.matrix, x0, y0, x1, y1, !isErasing);
      return newMatrix;
    });
    // Optionally update lastReleasePoint to the new endpoint if you want to chain lines
    setLastReleasePoint({ x: x1, y: y1 });
  } else {
    // Normal brush
    props.setOledMatrix((prev) => {
      const newMatrix = structuredClone(prev);
      const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
      if (!matrixObj) return prev;
      drawBrush(matrixObj.matrix, x, y, !isErasing);
      return newMatrix;
    });
  }

  prevMousePosRef.current = { x, y };
  setIsDrawing(true);
  didDragRef.current = false;
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
    setCursorPos({ x, y }); // Always update cursor position

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
        matrixObj.matrix[y][x] = !isErasing;
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
    const x = Math.floor((event.clientX - rect.left) * scaleX / PIXEL_SIZE);
    const y = Math.floor((event.clientY - rect.top) * scaleY / PIXEL_SIZE);
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return { x: null, y: null };
    return { x, y };
  };
  // const getMousePosition = (event) => {
  //   const rect = canvasRef.current.getBoundingClientRect();
  //   const x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
  //   const y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);

  //   if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return { x: null, y: null };
  //   return { x, y };
  // };

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     console.log(currentKeyboardKey)
  //     if (currentKeyboardKey === "KeyD") {
  //       setIsErasing(true);
  //     }
  //   };

  //   const handleKeyUp = (event) => {

  //     setIsErasing(false);

  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   window.addEventListener("keyup", handleKeyUp);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //     window.removeEventListener("keyup", handleKeyUp);
  //   };
  // }, []);

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
    const x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);

    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      props.setOledMatrix((prev) => {
        const newMatrix = structuredClone(prev);
        const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
        matrixObj.matrix[y][x] = !matrixObj.matrix[y][x];
        return newMatrix;
      });
    }
  };



  return (
    <>
      <div style={{ position: "relative", width: WIDTH * PIXEL_SIZE, height: HEIGHT * PIXEL_SIZE }}>
        <canvas
          ref={canvasRef}
          width={WIDTH * PIXEL_SIZE}
          height={HEIGHT * PIXEL_SIZE}
          style={{ display: "block" }}
          className="border border-slate-700"
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          onMouseEnter={handleCanvasMouseEnter}
          onMouseDown={handleCanvasMouseDown}
        // onMouseUp={handleGlobalMouseUp}
        />
        {/* Cursor indicator */}
        {isCursorOver && cursorPos.x !== null && cursorPos.y !== null && (
          <div
            style={{
              position: "absolute",
              pointerEvents: "none",
              left: (cursorPos.x - Math.floor(brushSize / 2)) * PIXEL_SIZE,
              top: (cursorPos.y - Math.floor(brushSize / 2)) * PIXEL_SIZE,
              width: brushSize * PIXEL_SIZE,
              height: brushSize * PIXEL_SIZE,
              border: "2px solid #55c7f4", // blue-500
              background: "rgba(59, 130, 246, 0.15)", // semi-transparent blue
              boxSizing: "border-box",
              zIndex: 10,
            }}
          />
        )}
      </div>
    </>
  );
}
