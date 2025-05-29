// import React from 'react'

// function Oled128x64() {

//     const [oledMatrix, setOledMatrix] = React.useState(
//         [
//           {
//             key: 1, oledmatrix: Array.from({ length: 64 }, () => Array(128).fill(false))
//           },
    
//         ]
//       )
//       const [currentMatrix, setCurrentMatrix] = React.useState(1);
//       const Oledd = [
//         Array.from({ length: 64 }, () =>
//           Array.from({ length: 128 }, () => Math.random() > 0.5) // Random pixels
//         ),
//       ];
//       function generateFrameData(matrix) {
//         const packedFrames = matrix.map((frame) => {
//           let packedRuns = [];
      
//           for (let y = 0; y < frame.length; y++) {
//             let x = 0;
//             while (x < frame[y].length) {
//               if (frame[y][x]) {
//                 let xStart = x;
//                 let length = 0;
//                 while (x < frame[y].length && frame[y][x]) {
//                   length++;
//                   x++;
//                 }
                
//                 if (xStart < 64 && length < 16) { // Ensure fits in bit-packing
//                   let packed = (y << 10) | (xStart << 4) | length;
//                   packedRuns.push(`0x${packed.toString(16).toUpperCase()}`);
//                 }
//               }
//               x++;
//             }
//           }
//           console.log(packedRuns)
//           return `{ ${packedRuns.join(", ")} }`;
//         });
      
//         return `const uint16_t frameData[][50] PROGMEM = {
//         ${packedFrames.join(",\n  ")}
//       };`;
//       }
      
//       const generateProgMemString = (frames) => {
//         let progMemString = `const uint8_t frameData[][50][3] PROGMEM = {\n`;
//         frames.forEach((frame, index) => {
//           progMemString += `    { `;
//           frame.forEach((run, runIndex) => {
//             progMemString += `{${run.y}, ${run.xStart}, ${run.length}}`;
//             if (runIndex < frame.length - 1) progMemString += ", ";
//           });
//           progMemString += ` },\n`;
//         });
//         progMemString += `};`;
//         return progMemString;
//       };
//       function encodeFrame(matrix) {
//         const encodedFrame = [];
//         for (let y = 0; y < matrix.length; y++) {
//             for (let x = 0; x < matrix[y].length; x++) {
//                 if (matrix[y][x]) {
//                     // Pack y and x into a single 16-bit integer
//                     const packedValue = (y << 7) | x; // y in bits 7-12, x in bits 0-6
//                     encodedFrame.push(packedValue);
//                 }
//             }
//         }
//         return encodedFrame;
//     }
    
    
    
//   return (
//     <div className="w-full h-100">
//   {oledMatrix.map((matrix, matrixIndex) => (
//     <div key={matrixIndex} className="mb-2 ">
//       {matrix.oledmatrix.map((row, rowIndex) => (
//         <div key={rowIndex} className="flex">
//           {row.map((pixel, pixelIndex) => (
//             <div
//               key={pixelIndex}
//               className={`box-border size-[2px]  ${pixel? "bg-cyan-300" :"bg-black"} `}
//               style={{
//                 imageRendering: "pixelated", // Prevents anti-aliasing
//                 transform: "translateZ(0)",  // Forces GPU acceleration to prevent subpixel issues
                
//               }}
//               onClick={(e) => {
//                 console.log(pixel)
//                 e.preventDefault();
//                 e.stopPropagation();
//                 let old_state = structuredClone(oledMatrix)

//                 // old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex]=true

//                 old_state.find(obj => obj.key === currentMatrix).oledmatrix[rowIndex][pixelIndex] = !old_state.find(obj => obj.key === currentMatrix).oledmatrix[rowIndex][pixelIndex]
//                 setOledMatrix(old_state)
//             }}
//             ></div>
//           ))}
//         </div>
//       ))}
//     </div>
//   ))}
//   <button onClick={()=>{
// const sampleMatrix = [
//   Array(64).fill(0).map(() => Array(128).fill(false)),
//   Array(64).fill(0).map(() => Array(128).fill(false))
// ];
// sampleMatrix[0][0][0]=true;
// sampleMatrix[0][15][5]=true;
// sampleMatrix[0][25][25]=true;
// sampleMatrix[0][50][125]=true;



// const compressedFrames = encodeFrame(oledMatrix[0]);
// console.log(compressedFrames);
 
//   }}>fbgd</button>
// </div>
//   )
// }

// export default Oled128x64



import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setToKeyboardKey } from '../reducers/currentKeyboardKey';
const WIDTH = 128;
const HEIGHT = 64;
const PIXEL_SIZE = 2; // Controls how large each pixel appears

export default function Oled128x64(props) {
    const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value)
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const prevMousePosRef = useRef({ x: null, y: null });
  // const [props.oledMatrix, props.setOledMatrix] = useState(
  //   [
  //              {
  //               key: 1, oledmatrix: Array.from({ length: 64 }, () => Array(128).fill(false))
  //             },
          
  //            ]
  // );

  useEffect(()=>{
    drawCanvas()
  },[])
  useEffect(() => {
   
    drawCanvas();
  }, [props.oledMatrix]); // Redraw canvas when matrix changes

  useEffect(()=>{
    drawCanvas();
    
  },[currentMatrixKey])
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH * PIXEL_SIZE, HEIGHT * PIXEL_SIZE);

    // Draw pixels efficiently
    console.log(currentMatrixKey)
    props.oledMatrix.find(obj => obj.key === currentMatrixKey).matrix.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel) {
          console.log(pixel)
          ctx.fillStyle = "#06b6d4"; // cyan-300 in Tailwind
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      });
    });
  };

//   const handleCanvasMouseDown = (event) => {
    
//     const { x, y } = getMousePosition(event);
//     if (x === null || y === null) return;
// console.log("passed x y checl")
//     props.setOledMatrix((prev) => {
//         const newMatrix = structuredClone(prev);
//         const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
//         if (!matrixObj) return prev;

//         isErasing
//             ? (matrixObj.matrix[y][x] = false)  // Erase pixel
//             : (matrixObj.matrix[y][x] = true);  // Draw pixel

//         return newMatrix;
//     });

//     setIsDrawing(true);
// };

// const handleCanvasMouseUp = () => {
//     setIsDrawing(false);
// };

// const handleCanvasMouseMove = (event) => {
//     if (!isDrawing) return;

//     const { x, y } = getMousePosition(event);
//     if (x === null || y === null) return;

//     props.setOledMatrix((prev) => {
//         const newMatrix = structuredClone(prev);
//         const matrixObj = newMatrix.find(obj => obj.key === currentMatrixKey);
//         if (!matrixObj) return prev;

//         isErasing
//             ? (matrixObj.matrix[y][x] = false)  // Erase pixel
//             : (matrixObj.matrix[y][x] = true);  // Draw pixel

//         return newMatrix;
//     });
// };


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

const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    prevMousePosRef.current = { x: null, y: null };
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

// Detect key press (for Erase Mode)
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
       // newMatrix[y][x] = !newMatrix[y][x]; // Toggle pixel state
        newMatrix.find(obj => obj.key === currentMatrixKey).matrix[y][x] = !newMatrix.find(obj => obj.key === currentMatrixKey).matrix[y][x]
        return newMatrix;
      });
    }
    console.log(props.oledMatrix)
  };


        function encodeFrame(matrix) {
        const encodedFrame = [];
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x]) {
                    // Pack y and x into a single 16-bit integer
                    const packedValue = (y << 7) | x; // y in bits 7-12, x in bits 0-6
                    encodedFrame.push(packedValue);
                }
            }
        }
        return encodedFrame;
    }

    const compressOLEDData = (pixels) => {
      let compressed = new Uint8Array(1024);
      for (let y = 0; y < 64; y++) {
          for (let x = 0; x < 128; x++) {
              let byteIndex = (y >> 3) * 128 + x;
              let bitIndex = y & 7;
              if (pixels[y][x]) {
                  compressed[byteIndex] |= (1 << bitIndex);
              }
          }
      }
      return compressed;
  };
  
  const generateCppArray = (pixels) => {
    let compressed = new Uint8Array(1024);
    for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 128; x++) {
            let byteIndex = (y >> 3) * 128 + x;
            let bitIndex = y & 7;
            if (pixels[y][x]) {
                compressed[byteIndex] |= (1 << bitIndex);
            }
        }
    }

    // Convert to C++ PROGMEM array
    let cppArray = `const uint8_t oled_buffer[1024] PROGMEM = {\n    `;
    for (let i = 0; i < compressed.length; i++) {
        cppArray += `0x${compressed[i].toString(16).padStart(2, "0")}, `;
        if ((i + 1) % 16 === 0) cppArray += `\n    `;
    }
    cppArray += `\n};`;

    return cppArray;
};

const generateSparseCppArray = (pixels) => {
  let pixelList = [];

  for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 128; x++) {
          if (pixels[y][x] === true) {
              pixelList.push(x, y); // Store only ON pixels
          }
      }
  }

  let cppArray = `const uint8_t pixelData[] PROGMEM = {\n    `;
  for (let i = 0; i < pixelList.length; i += 2) {
      cppArray += `${pixelList[i]}, ${pixelList[i + 1]}, `;
      if ((i / 2 + 1) % 5 === 0) cppArray += `\n    `; // Formatting
  }
  cppArray += `\n};\nconst uint16_t pixelCount = ${pixelList.length / 2};`;

  return cppArray;
};


const generateColumnCompressedCppArray = (pixels) => {
  let pixelList = [];

  for (let x = 0; x < 128; x++) {
      let yList = [];
      for (let y = 0; y < 64; y++) {
          if (pixels[y][x]) {
              yList.push(y);
          }
      }

      if (yList.length > 0) {
          pixelList.push(x, yList.length, ...yList);
      }
  }

  // Convert to C++ PROGMEM format
  let cppArray = `const uint8_t pixelData[] PROGMEM = {\n    `;
  for (let i = 0; i < pixelList.length; i++) {
      cppArray += `${pixelList[i]}, `;
      if ((i + 1) % 16 === 0) cppArray += `\n    `;
  }
  cppArray += `\n};\nconst uint16_t pixelCount = ${pixelList.length};`;

  return cppArray;
};

  return (
    <><button onClick={()=>{
      const sampleMatrix = [
        Array(64).fill(0).map(() => Array(128).fill(false)),
        Array(64).fill(0).map(() => Array(128).fill(false))
      ];
      sampleMatrix[0][0][0]=true;
      sampleMatrix[0][15][5]=true;
      sampleMatrix[0][25][25]=true;
      sampleMatrix[0][50][125]=true;
      
      
      
      const compressedFrames = generateColumnCompressedCppArray(props.oledMatrix[0].matrix);
      console.log(compressedFrames);
       
        }}>fbggggggggggggggggd</button>
          <canvas
      ref={canvasRef}
      width={WIDTH * PIXEL_SIZE}
      height={HEIGHT * PIXEL_SIZE}
      className="border border-gray-500"
      onMouseDown={handleCanvasMouseDown}
      onMouseUp={handleCanvasMouseUp}
      onMouseMove={handleCanvasMouseMove}
    />
        </>
  
  );
}