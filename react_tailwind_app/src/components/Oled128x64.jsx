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
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

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
    const handleGlobalMouseUp = () => {
      setIsDrawing(false);
      prevMousePosRef.current = { x: null, y: null };
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

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

    prevMousePosRef.current = { x, y };
    setIsDrawing(true);

    props.setOledMatrix((prev) => {
      const newMatrix = structuredClone(prev);
      const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
      if (!matrixObj) return prev;

      matrixObj.matrix[y][x] = !isErasing;
      return newMatrix;
    });
  };

  function drawInterpolatedLine(matrix, x0, y0, x1, y1, value) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (x0 >= 0 && x0 < 128 && y0 >= 0 && y0 < 64) {
        matrix[y0][x0] = value;
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
    if (!isDrawing) return;

    const { x, y } = getMousePosition(event);
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

  const getMousePosition = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);

    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return { x: null, y: null };
    return { x, y };
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === "d") {
        setIsErasing(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key.toLowerCase() === "d") {
        setIsErasing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleCanvasClick = (event) => {
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
      <canvas
        ref={canvasRef}
        width={WIDTH * PIXEL_SIZE}
        height={HEIGHT * PIXEL_SIZE}
        className="border border-gray-500"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
      />
    </>
  );
}
