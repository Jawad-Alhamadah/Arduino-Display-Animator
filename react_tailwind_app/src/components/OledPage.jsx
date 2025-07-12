import React, { useEffect, useState, useCallback } from 'react'
import FrameDurationInput from './FrameDurationInput';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { BsPlayFill, BsFillEraserFill } from "react-icons/bs";
import { LuClipboardCopy, LuCopyPlus } from "react-icons/lu";
import { PiFlipHorizontalFill, PiFlipVerticalFill } from "react-icons/pi";
import { TiMediaStop } from "react-icons/ti";
import { MdAdd, MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { GrRotateLeft, GrRotateRight } from "react-icons/gr";
import { MdDeleteForever } from "react-icons/md";
import { GrHelpBook } from "react-icons/gr";
import { BsExclamationCircle } from "react-icons/bs";
import { FaHireAHelper } from "react-icons/fa6";
import { TiArrowUpOutline } from "react-icons/ti";
import { TiArrowDownOutline } from "react-icons/ti";
import OledFrame from "./OledFrame"
import Oled128x64 from "./Oled128x64"
import { FaClipboardCheck } from "react-icons/fa6";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToKeyboardKey } from '../reducers/currentKeyboardKey';
import { setCurrentMatrixByKey } from '../reducers/currentMatrixSlice';
import generateMostEfficientCppArray from "./CppArrayFunctions"
import { generate_oled_template, generate_oled_template_SPI } from "./generatedCodeTemplates"
import { setToPlaying, setToStopped } from '../reducers/isAnimationPlaying';
import { ToastContainer } from 'react-toastify';
import ToolMainFrame from "./ToolMainFrame"
import { MdOutlineHelpCenter } from "react-icons/md";
import { CgScreen } from "react-icons/cg";
import WiringGuide from './wiringGuide';
import Tool from './Tool';
import { notifyUser } from './toastifyFunctions';
import { TbNavigationQuestion } from "react-icons/tb";
import { BsPatchQuestion } from "react-icons/bs";
import { toast } from 'react-toastify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PinSelector from './PinSelector';
import { useLocation } from 'react-router-dom';
import { Tooltip as ReactTooltip } from "react-tooltip";
import AnimateText from './AnimateText';
import { SiArduino } from "react-icons/si";
import StampPicker from "./StampPicker";
import { FaStamp } from "react-icons/fa6";
import { FaRegPenToSquare } from "react-icons/fa6";

import { TbPencilMinus } from "react-icons/tb";
import { LZMA } from 'lzma-web'
import { TbPencilPlus } from "react-icons/tb";
import pako from 'pako'; // For compression (install with: npm install pako)
import { debounce } from 'lodash';

function OledPage() {
  const location = useLocation();
  const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value)
  let currentKeyboardKey = useSelector((state) => state.currentKeyboardKey.value)
  let isAnimationPlaying = useSelector((state) => state.isAnimationPlaying.value)
  const [oledHistory, setOledHistory] = React.useState({}); // { [frameKey]: [matrix, ...] }
  const [copiedFrame, setCopiedFrame] = React.useState(null);
  const currentKeyboardKeyRef = React.useRef(currentKeyboardKey);
  const [codeCopied, setCodeCopied] = React.useState(false)
  React.useEffect(() => {
    currentKeyboardKeyRef.current = currentKeyboardKey;
  }, [currentKeyboardKey]);

  const framesRef = React.useRef([]);

  const [isMouseDown, setIsMouseDown] = React.useState(false);

  const [generatedCode, setGeneratedCode] = React.useState("");
  const repeatInterval = React.useRef(null);

  const [brushSize, setBrushSize] = React.useState(1);
  const [pinDC, setPinDC] = React.useState('none');
  const [pinReset, setPinReset] = React.useState('none');
  const [pinCS, setPinCS] = React.useState('none');
  const [board, setBoard] = React.useState('nano');
  const [oledType, setOledType] = React.useState('I2C');

  const [display, setDisplay] = React.useState('');
  // const [frameDuration, setFrameDuration] = React.useState(200);
  const [isGenerateDisabled, setIsGenerateDisabled] = React.useState(false);
  const [isCodeGenerated, setIsCodeGenerated] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const [isWarningActive, setIsWarningActive] = React.useState(() => {
    // getting stored value
    const saved = localStorage.getItem("warnActive");
    const initialValue = JSON.parse(saved);
    return initialValue || "";
  })

  const currentMatrixKeyRef = React.useRef(currentMatrixKey);
  React.useEffect(() => {
    currentMatrixKeyRef.current = currentMatrixKey;
  }, [currentMatrixKey]);


  const currentAnimationPlayingRef = React.useRef(isAnimationPlaying);
  React.useEffect(() => {
    currentAnimationPlayingRef.current = isAnimationPlaying;
  }, [isAnimationPlaying]);
  const handleRotateRight = React.useCallback(() => {

    const rotateRightFrame = (oledMatrix, currentKey) => {
      return oledMatrix.map(frame => {
        if (frame.key !== currentKey) return frame;

        const baseMatrix = frame.outerMatrix ?? expandToOuterMatrix(frame.matrix);
        const rotated = rotateMatrixRight(baseMatrix);

        return {
          ...frame,
          matrix: clipOuterMatrix(rotated),
          outerMatrix: rotated,
        };
      });
    }


    setOledMatrix(prev => rotateRightFrame(prev, currentMatrixKey))
  }, [currentMatrixKey]);


  function handleBoardChange(event) {
    console.log(event)
    setBoard(event.target.value)

  }
  let frameDuration = useSelector((state) => state.frameDuration.value)
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const WIDTH = 128;
  const HEIGHT = 64;

  const newMatrix = {
    key: 0, matrix:
      [
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
      ]

  }

  const [oledMatrix, setOledMatrix] = React.useState(
    [
      {
        key: currentMatrixKey, matrix: Array.from({ length: 64 }, () => Array(128).fill(false))
      },

    ]
  )

  const oledMatrixCurrentRef = React.useRef(oledMatrix)


   const [isSaving, setIsSaving] = React.useState(false);
  
  // Memoized compression function

  function binaryStringToBytes(binaryStr) {
  const byteCount = Math.ceil(binaryStr.length / 8);
  const bytes = new Uint8Array(byteCount);
  
  for (let i = 0; i < byteCount; i++) {
    const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
    bytes[i] = parseInt(byteStr, 2);
  }
  
  return bytes;
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

  const compressAndSave = React.useCallback(async (matrix) => {
    setIsSaving(true);
    try {
      const binary = matrixToBinaryString(matrix);
      const bytes = binaryStringToBytes(binary);
      const compressed = await LZMA.compress(bytes);
      const base64 = bytesToBase64(compressed);
      const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      window.history.replaceState({}, '', `?matrix=${urlSafe}`);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);


//   const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

// const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

const updateURL = () => {
compressToTinyURL(oledMatrix)
  .then(compressed => {
    window.history.pushState({}, '', `?matrix=${compressed}`);
  })
  .catch(error => {
    console.error("Failed to compress:", error);
  });
};

async function getCompressedURL(oledMatrix) {
  try {
    // 1. Compress the data (returns a Promise)
    const compressed = await compressToTinyURL(oledMatrix);
    
    // 2. Return the full URL string
    return `?matrix=${compressed}`;
  } catch (error) {
    console.error("Compression failed:", error);
    return ""; // Return empty string or handle error appropriately
  }
}
// Load from URL on mount
React.useEffect(() => {
    async function loadFromURL() {
      const params = new URLSearchParams(window.location.search);
      const matrixParam = params.get('matrix');
      
      if (matrixParam) {
        const decoded = await decompressFromTinyURL(matrixParam);
        if (decoded) {
          setOledMatrix(decoded);
          // Update Redux with first frame's key
          dispatch(setCurrentMatrixByKey(decoded[0].key));
        }
      }
    }
    
    loadFromURL();
  }, []);

// Load state from URL on initial render
// React.useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   const matrixParam = params.get('matrix');
  
//   console.log(matrixParam)
//   if (matrixParam) {
//     const decoded = decodeMatrixFromURL(matrixParam);
//     console.log(decoded)
//     if (decoded) setOledMatrix(decoded);
//   }
// }, []);


  React.useEffect(() => {
    oledMatrixCurrentRef.current = oledMatrix
  }, [oledMatrix])


const matrixToBinaryString = (oledMatrix) => {
  let binaryStr = '';
  for (const frame of oledMatrix) {
    for (let row of frame.matrix) {
      for (let cell of row) {
        binaryStr += cell ? '1' : '0';
      }
    }
  }
  return binaryStr;
};

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Convert to binary string
//   const binaryStr = matrixToBinaryString(oledMatrix);
  
//   // 2. Pack binary string into bytes
//   const bytes = new Uint8Array(Math.ceil(binaryStr.length / 8));
//   for (let i = 0; i < bytes.length; i++) {
//     const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
//     bytes[i] = parseInt(byteStr, 2);
//   }
  
//   // 3. Compress with zlib (great for binary data)
//   const compressed = pako.deflate(bytes);
  
//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-') // Replace URL-unsafe characters
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };



const matrixToEncodedString = (oledMatrix) => {
  let output = '';
  
  for (const frame of oledMatrix) {
    // Add frame key (with special delimiter)
    output += `[${frame.key}]`;
    
    // Add binary matrix data
    for (let row of frame.matrix) {
      for (let cell of row) {
        output += cell ? '1' : '0';
      }
    }
  }
  
  return output;
};

// Main encoding function

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Create a structured object with keys and binary data
//   const dataToEncode = {
//     frames: oledMatrix.map(frame => ({
//       key: frame.key,  // Preserve original key
//       data: frame.matrix.flatMap(row => 
//         row.map(cell => cell ? '1' : '0')).join('')
//     }))
//   };

//   // 2. Convert to JSON string
//   const jsonString = JSON.stringify(dataToEncode);

//   // 3. Compress with zlib
//   const compressed = pako.deflate(jsonString);

//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };




async function compressToTinyURL(oledMatrix) {
  try {
    // 1. Create structured data with frame keys preserved
    const structuredData = {
      version: 1,
      frameCount: oledMatrix.length,
      frames: oledMatrix.map(frame => ({
        key: frame.key,
        matrix: frame.matrix.flat().map(cell => cell ? 1 : 0)
      }))
    };

    // 2. Convert to JSON string
    const jsonString = JSON.stringify(structuredData);
    
    // 3. Convert to bytes for compression
    const bytes = new TextEncoder().encode(jsonString);
    
    // 4. LZMA compress
    const compressed = await LZMA.compress(bytes, 1);
    
    // 5. Convert to URL-safe Base64
    const base64 = btoa(String.fromCharCode(...compressed));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
  } catch (error) {
    console.error('Compression failed:', error);
    // Fallback to simpler compression
    const fallbackData = JSON.stringify(oledMatrix.map(f => ({
      key: f.key,
      data: f.matrix.flat().map(c => c ? 1 : 0)
    })));
    return btoa(fallbackData).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

// Improved decompression function
async function decompressFromTinyURL(encoded) {
  try {
    // 1. Convert from URL-safe Base64
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const compressed = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i);
    }
    
    // 2. LZMA decompress
    const decompressed = await LZMA.decompress(compressed);
    
    // 3. Convert bytes back to string
    const jsonString = new TextDecoder().decode(decompressed);
    
    // 4. Parse JSON
    const data = JSON.parse(jsonString);
    
    // 5. Reconstruct matrix format
    if (data.version === 1) {
      return data.frames.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.matrix[row * 128 + col] === 1
          )
        )
      }));
    }
    
    // Handle legacy format
    return data.map(frame => ({
      key: frame.key,
      matrix: Array.from({ length: 64 }, (_, row) =>
        Array.from({ length: 128 }, (_, col) =>
          frame.data[row * 128 + col] === 1
        )
      )
    }));
    
  } catch (error) {
    console.error('Decompression failed:', error);
    
    // Try fallback decompression
    try {
      const fallbackData = JSON.parse(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')));
      return fallbackData.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.data[row * 128 + col] === 1
          )
        )
      }));
    } catch (fallbackError) {
      console.error('Fallback decompression also failed:', fallbackError);
      return null;
    }
  }
}

// Auto-save hook with debouncing
const useAutoSave = (oledMatrix, dispatch) => {
  const [isSaving, setIsSaving] = React.useState(false);
  
  const saveToURL = React.useCallback(async (matrix) => {
    if (!matrix || matrix.length === 0) return;
    
    setIsSaving(true);
    try {
      const compressed = await compressToTinyURL(matrix);
      const url = new URL(window.location.href);
      url.searchParams.set('matrix', compressed);
      window.history.replaceState({}, '', url);
      console.log('Auto-saved to URL');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  const debouncedSave = React.useMemo(
    () => debounce(saveToURL, 2000), // 2 second delay
    [saveToURL]
  );
  
  React.useEffect(() => {
    if (oledMatrix.length > 0) {
      debouncedSave(oledMatrix);
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [oledMatrix, debouncedSave]);
  
  return { isSaving };
};

// Load from URL function
const loadFromURL = async (dispatch) => {
  const params = new URLSearchParams(window.location.search);
  const matrixParam = params.get('matrix');
  
  if (matrixParam) {
    try {
      const decoded = await decompressFromTinyURL(matrixParam);
      if (decoded && decoded.length > 0) {
        console.log('Loaded from URL:', decoded);
        return {
          matrix: decoded,
          firstFrameKey: decoded[0].key
        };
      }
    } catch (error) {
      console.error('Failed to load from URL:', error);
    }
  }
  return null;
};

// In your main OledPage function, add this after your existing state declarations:
const { isSaving } = useAutoSave(oledMatrix, dispatch);

// Replace your existing URL loading useEffect with this:
React.useEffect(() => {
  async function initializeFromURL() {
    const urlData = await loadFromURL(dispatch);
    if (urlData) {
      setOledMatrix(urlData.matrix);
      // This is the key fix - properly sync Redux state
      dispatch(setCurrentMatrixByKey(urlData.firstFrameKey));
    }
  }
  
  initializeFromURL();
}, [dispatch]);

  const handleRotateRight = React.useCallback(() => {

    const rotateRightFrame = (oledMatrix, currentKey) => {
      return oledMatrix.map(frame => {
        if (frame.key !== currentKey) return frame;

        const baseMatrix = frame.outerMatrix ?? expandToOuterMatrix(frame.matrix);
        const rotated = rotateMatrixRight(baseMatrix);

        return {
          ...frame,
          matrix: clipOuterMatrix(rotated),
          outerMatrix: rotated,
        };
      });
    }


    setOledMatrix(prev => rotateRightFrame(prev, currentMatrixKey))
  }, [currentMatrixKey]);


  function handleBoardChange(event) {
    console.log(event)
    setBoard(event.target.value)

  }
  let frameDuration = useSelector((state) => state.frameDuration.value)
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const WIDTH = 128;
  const HEIGHT = 64;

  const newMatrix = {
    key: 0, matrix:
      [
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
      ]

  }

  const [oledMatrix, setOledMatrix] = React.useState(
    [
      {
        key: currentMatrixKey, matrix: Array.from({ length: 64 }, () => Array(128).fill(false))
      },

    ]
  )

  const oledMatrixCurrentRef = React.useRef(oledMatrix)


   const [isSaving, setIsSaving] = React.useState(false);
  
  // Memoized compression function

  function binaryStringToBytes(binaryStr) {
  const byteCount = Math.ceil(binaryStr.length / 8);
  const bytes = new Uint8Array(byteCount);
  
  for (let i = 0; i < byteCount; i++) {
    const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
    bytes[i] = parseInt(byteStr, 2);
  }
  
  return bytes;
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

  const compressAndSave = React.useCallback(async (matrix) => {
    setIsSaving(true);
    try {
      const binary = matrixToBinaryString(matrix);
      const bytes = binaryStringToBytes(binary);
      const compressed = await LZMA.compress(bytes);
      const base64 = bytesToBase64(compressed);
      const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      window.history.replaceState({}, '', `?matrix=${urlSafe}`);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);


//   const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

// const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

const updateURL = () => {
compressToTinyURL(oledMatrix)
  .then(compressed => {
    window.history.pushState({}, '', `?matrix=${compressed}`);
  })
  .catch(error => {
    console.error("Failed to compress:", error);
  });
};

async function getCompressedURL(oledMatrix) {
  try {
    // 1. Compress the data (returns a Promise)
    const compressed = await compressToTinyURL(oledMatrix);
    
    // 2. Return the full URL string
    return `?matrix=${compressed}`;
  } catch (error) {
    console.error("Compression failed:", error);
    return ""; // Return empty string or handle error appropriately
  }
}
// Load from URL on mount
React.useEffect(() => {
    async function loadFromURL() {
      const params = new URLSearchParams(window.location.search);
      const matrixParam = params.get('matrix');
      
      if (matrixParam) {
        const decoded = await decompressFromTinyURL(matrixParam);
        if (decoded) {
          setOledMatrix(decoded);
          // Update Redux with first frame's key
          dispatch(setCurrentMatrixByKey(decoded[0].key));
        }
      }
    }
    
    loadFromURL();
  }, []);

// Load state from URL on initial render
// React.useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   const matrixParam = params.get('matrix');
  
//   console.log(matrixParam)
//   if (matrixParam) {
//     const decoded = decodeMatrixFromURL(matrixParam);
//     console.log(decoded)
//     if (decoded) setOledMatrix(decoded);
//   }
// }, []);


  React.useEffect(() => {
    oledMatrixCurrentRef.current = oledMatrix
  }, [oledMatrix])


const matrixToBinaryString = (oledMatrix) => {
  let binaryStr = '';
  for (const frame of oledMatrix) {
    for (let row of frame.matrix) {
      for (let cell of row) {
        binaryStr += cell ? '1' : '0';
      }
    }
  }
  return binaryStr;
};

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Convert to binary string
//   const binaryStr = matrixToBinaryString(oledMatrix);
  
//   // 2. Pack binary string into bytes
//   const bytes = new Uint8Array(Math.ceil(binaryStr.length / 8));
//   for (let i = 0; i < bytes.length; i++) {
//     const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
//     bytes[i] = parseInt(byteStr, 2);
//   }
  
//   // 3. Compress with zlib (great for binary data)
//   const compressed = pako.deflate(bytes);
  
//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-') // Replace URL-unsafe characters
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };



const matrixToEncodedString = (oledMatrix) => {
  let output = '';
  
  for (const frame of oledMatrix) {
    // Add frame key (with special delimiter)
    output += `[${frame.key}]`;
    
    // Add binary matrix data
    for (let row of frame.matrix) {
      for (let cell of row) {
        output += cell ? '1' : '0';
      }
    }
  }
  
  return output;
};

// Main encoding function

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Create a structured object with keys and binary data
//   const dataToEncode = {
//     frames: oledMatrix.map(frame => ({
//       key: frame.key,  // Preserve original key
//       data: frame.matrix.flatMap(row => 
//         row.map(cell => cell ? '1' : '0')).join('')
//     }))
//   };

//   // 2. Convert to JSON string
//   const jsonString = JSON.stringify(dataToEncode);

//   // 3. Compress with zlib
//   const compressed = pako.deflate(jsonString);

//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };




async function compressToTinyURL(oledMatrix) {
  try {
    // 1. Create structured data with frame keys preserved
    const structuredData = {
      version: 1,
      frameCount: oledMatrix.length,
      frames: oledMatrix.map(frame => ({
        key: frame.key,
        matrix: frame.matrix.flat().map(cell => cell ? 1 : 0)
      }))
    };

    // 2. Convert to JSON string
    const jsonString = JSON.stringify(structuredData);
    
    // 3. Convert to bytes for compression
    const bytes = new TextEncoder().encode(jsonString);
    
    // 4. LZMA compress
    const compressed = await LZMA.compress(bytes, 1);
    
    // 5. Convert to URL-safe Base64
    const base64 = btoa(String.fromCharCode(...compressed));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
  } catch (error) {
    console.error('Compression failed:', error);
    // Fallback to simpler compression
    const fallbackData = JSON.stringify(oledMatrix.map(f => ({
      key: f.key,
      data: f.matrix.flat().map(c => c ? 1 : 0)
    })));
    return btoa(fallbackData).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

// Improved decompression function
async function decompressFromTinyURL(encoded) {
  try {
    // 1. Convert from URL-safe Base64
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const compressed = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i);
    }
    
    // 2. LZMA decompress
    const decompressed = await LZMA.decompress(compressed);
    
    // 3. Convert bytes back to string
    const jsonString = new TextDecoder().decode(decompressed);
    
    // 4. Parse JSON
    const data = JSON.parse(jsonString);
    
    // 5. Reconstruct matrix format
    if (data.version === 1) {
      return data.frames.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.matrix[row * 128 + col] === 1
          )
        )
      }));
    }
    
    // Handle legacy format
    return data.map(frame => ({
      key: frame.key,
      matrix: Array.from({ length: 64 }, (_, row) =>
        Array.from({ length: 128 }, (_, col) =>
          frame.data[row * 128 + col] === 1
        )
      )
    }));
    
  } catch (error) {
    console.error('Decompression failed:', error);
    
    // Try fallback decompression
    try {
      const fallbackData = JSON.parse(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')));
      return fallbackData.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.data[row * 128 + col] === 1
          )
        )
      }));
    } catch (fallbackError) {
      console.error('Fallback decompression also failed:', fallbackError);
      return null;
    }
  }
}

// Auto-save hook with debouncing
const useAutoSave = (oledMatrix, dispatch) => {
  const [isSaving, setIsSaving] = React.useState(false);
  
  const saveToURL = React.useCallback(async (matrix) => {
    if (!matrix || matrix.length === 0) return;
    
    setIsSaving(true);
    try {
      const compressed = await compressToTinyURL(matrix);
      const url = new URL(window.location.href);
      url.searchParams.set('matrix', compressed);
      window.history.replaceState({}, '', url);
      console.log('Auto-saved to URL');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  const debouncedSave = React.useMemo(
    () => debounce(saveToURL, 2000), // 2 second delay
    [saveToURL]
  );
  
  React.useEffect(() => {
    if (oledMatrix.length > 0) {
      debouncedSave(oledMatrix);
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [oledMatrix, debouncedSave]);
  
  return { isSaving };
};

// Load from URL function
const loadFromURL = async (dispatch) => {
  const params = new URLSearchParams(window.location.search);
  const matrixParam = params.get('matrix');
  
  if (matrixParam) {
    try {
      const decoded = await decompressFromTinyURL(matrixParam);
      if (decoded && decoded.length > 0) {
        console.log('Loaded from URL:', decoded);
        return {
          matrix: decoded,
          firstFrameKey: decoded[0].key
        };
      }
    } catch (error) {
      console.error('Failed to load from URL:', error);
    }
  }
  return null;
};

// In your main OledPage function, add this after your existing state declarations:
const { isSaving } = useAutoSave(oledMatrix, dispatch);

// Replace your existing URL loading useEffect with this:
React.useEffect(() => {
  async function initializeFromURL() {
    const urlData = await loadFromURL(dispatch);
    if (urlData) {
      setOledMatrix(urlData.matrix);
      // This is the key fix - properly sync Redux state
      dispatch(setCurrentMatrixByKey(urlData.firstFrameKey));
    }
  }
  
  initializeFromURL();
}, [dispatch]);

  const handleRotateRight = React.useCallback(() => {

    const rotateRightFrame = (oledMatrix, currentKey) => {
      return oledMatrix.map(frame => {
        if (frame.key !== currentKey) return frame;

        const baseMatrix = frame.outerMatrix ?? expandToOuterMatrix(frame.matrix);
        const rotated = rotateMatrixRight(baseMatrix);

        return {
          ...frame,
          matrix: clipOuterMatrix(rotated),
          outerMatrix: rotated,
        };
      });
    }


    setOledMatrix(prev => rotateRightFrame(prev, currentMatrixKey))
  }, [currentMatrixKey]);


  function handleBoardChange(event) {
    console.log(event)
    setBoard(event.target.value)

  }
  let frameDuration = useSelector((state) => state.frameDuration.value)
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const WIDTH = 128;
  const HEIGHT = 64;

  const newMatrix = {
    key: 0, matrix:
      [
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
      ]

  }

  const [oledMatrix, setOledMatrix] = React.useState(
    [
      {
        key: currentMatrixKey, matrix: Array.from({ length: 64 }, () => Array(128).fill(false))
      },

    ]
  )

  const oledMatrixCurrentRef = React.useRef(oledMatrix)


   const [isSaving, setIsSaving] = React.useState(false);
  
  // Memoized compression function

  function binaryStringToBytes(binaryStr) {
  const byteCount = Math.ceil(binaryStr.length / 8);
  const bytes = new Uint8Array(byteCount);
  
  for (let i = 0; i < byteCount; i++) {
    const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
    bytes[i] = parseInt(byteStr, 2);
  }
  
  return bytes;
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

  const compressAndSave = React.useCallback(async (matrix) => {
    setIsSaving(true);
    try {
      const binary = matrixToBinaryString(matrix);
      const bytes = binaryStringToBytes(binary);
      const compressed = await LZMA.compress(bytes);
      const base64 = bytesToBase64(compressed);
      const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      window.history.replaceState({}, '', `?matrix=${urlSafe}`);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);


//   const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

// const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

const updateURL = () => {
compressToTinyURL(oledMatrix)
  .then(compressed => {
    window.history.pushState({}, '', `?matrix=${compressed}`);
  })
  .catch(error => {
    console.error("Failed to compress:", error);
  });
};

async function getCompressedURL(oledMatrix) {
  try {
    // 1. Compress the data (returns a Promise)
    const compressed = await compressToTinyURL(oledMatrix);
    
    // 2. Return the full URL string
    return `?matrix=${compressed}`;
  } catch (error) {
    console.error("Compression failed:", error);
    return ""; // Return empty string or handle error appropriately
  }
}
// Load from URL on mount
React.useEffect(() => {
    async function loadFromURL() {
      const params = new URLSearchParams(window.location.search);
      const matrixParam = params.get('matrix');
      
      if (matrixParam) {
        const decoded = await decompressFromTinyURL(matrixParam);
        if (decoded) {
          setOledMatrix(decoded);
          // Update Redux with first frame's key
          dispatch(setCurrentMatrixByKey(decoded[0].key));
        }
      }
    }
    
    loadFromURL();
  }, []);

// Load state from URL on initial render
// React.useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   const matrixParam = params.get('matrix');
  
//   console.log(matrixParam)
//   if (matrixParam) {
//     const decoded = decodeMatrixFromURL(matrixParam);
//     console.log(decoded)
//     if (decoded) setOledMatrix(decoded);
//   }
// }, []);


  React.useEffect(() => {
    oledMatrixCurrentRef.current = oledMatrix
  }, [oledMatrix])


const matrixToBinaryString = (oledMatrix) => {
  let binaryStr = '';
  for (const frame of oledMatrix) {
    for (let row of frame.matrix) {
      for (let cell of row) {
        binaryStr += cell ? '1' : '0';
      }
    }
  }
  return binaryStr;
};

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Convert to binary string
//   const binaryStr = matrixToBinaryString(oledMatrix);
  
//   // 2. Pack binary string into bytes
//   const bytes = new Uint8Array(Math.ceil(binaryStr.length / 8));
//   for (let i = 0; i < bytes.length; i++) {
//     const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
//     bytes[i] = parseInt(byteStr, 2);
//   }
  
//   // 3. Compress with zlib (great for binary data)
//   const compressed = pako.deflate(bytes);
  
//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-') // Replace URL-unsafe characters
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };



const matrixToEncodedString = (oledMatrix) => {
  let output = '';
  
  for (const frame of oledMatrix) {
    // Add frame key (with special delimiter)
    output += `[${frame.key}]`;
    
    // Add binary matrix data
    for (let row of frame.matrix) {
      for (let cell of row) {
        output += cell ? '1' : '0';
      }
    }
  }
  
  return output;
};

// Main encoding function

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Create a structured object with keys and binary data
//   const dataToEncode = {
//     frames: oledMatrix.map(frame => ({
//       key: frame.key,  // Preserve original key
//       data: frame.matrix.flatMap(row => 
//         row.map(cell => cell ? '1' : '0')).join('')
//     }))
//   };

//   // 2. Convert to JSON string
//   const jsonString = JSON.stringify(dataToEncode);

//   // 3. Compress with zlib
//   const compressed = pako.deflate(jsonString);

//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };




async function compressToTinyURL(oledMatrix) {
  try {
    // 1. Create structured data with frame keys preserved
    const structuredData = {
      version: 1,
      frameCount: oledMatrix.length,
      frames: oledMatrix.map(frame => ({
        key: frame.key,
        matrix: frame.matrix.flat().map(cell => cell ? 1 : 0)
      }))
    };

    // 2. Convert to JSON string
    const jsonString = JSON.stringify(structuredData);
    
    // 3. Convert to bytes for compression
    const bytes = new TextEncoder().encode(jsonString);
    
    // 4. LZMA compress
    const compressed = await LZMA.compress(bytes, 1);
    
    // 5. Convert to URL-safe Base64
    const base64 = btoa(String.fromCharCode(...compressed));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
  } catch (error) {
    console.error('Compression failed:', error);
    // Fallback to simpler compression
    const fallbackData = JSON.stringify(oledMatrix.map(f => ({
      key: f.key,
      data: f.matrix.flat().map(c => c ? 1 : 0)
    })));
    return btoa(fallbackData).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

// Improved decompression function
async function decompressFromTinyURL(encoded) {
  try {
    // 1. Convert from URL-safe Base64
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const compressed = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i);
    }
    
    // 2. LZMA decompress
    const decompressed = await LZMA.decompress(compressed);
    
    // 3. Convert bytes back to string
    const jsonString = new TextDecoder().decode(decompressed);
    
    // 4. Parse JSON
    const data = JSON.parse(jsonString);
    
    // 5. Reconstruct matrix format
    if (data.version === 1) {
      return data.frames.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.matrix[row * 128 + col] === 1
          )
        )
      }));
    }
    
    // Handle legacy format
    return data.map(frame => ({
      key: frame.key,
      matrix: Array.from({ length: 64 }, (_, row) =>
        Array.from({ length: 128 }, (_, col) =>
          frame.data[row * 128 + col] === 1
        )
      )
    }));
    
  } catch (error) {
    console.error('Decompression failed:', error);
    
    // Try fallback decompression
    try {
      const fallbackData = JSON.parse(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')));
      return fallbackData.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.data[row * 128 + col] === 1
          )
        )
      }));
    } catch (fallbackError) {
      console.error('Fallback decompression also failed:', fallbackError);
      return null;
    }
  }
}

// Auto-save hook with debouncing
const useAutoSave = (oledMatrix, dispatch) => {
  const [isSaving, setIsSaving] = React.useState(false);
  
  const saveToURL = React.useCallback(async (matrix) => {
    if (!matrix || matrix.length === 0) return;
    
    setIsSaving(true);
    try {
      const compressed = await compressToTinyURL(matrix);
      const url = new URL(window.location.href);
      url.searchParams.set('matrix', compressed);
      window.history.replaceState({}, '', url);
      console.log('Auto-saved to URL');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  const debouncedSave = React.useMemo(
    () => debounce(saveToURL, 2000), // 2 second delay
    [saveToURL]
  );
  
  React.useEffect(() => {
    if (oledMatrix.length > 0) {
      debouncedSave(oledMatrix);
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [oledMatrix, debouncedSave]);
  
  return { isSaving };
};

// Load from URL function
const loadFromURL = async (dispatch) => {
  const params = new URLSearchParams(window.location.search);
  const matrixParam = params.get('matrix');
  
  if (matrixParam) {
    try {
      const decoded = await decompressFromTinyURL(matrixParam);
      if (decoded && decoded.length > 0) {
        console.log('Loaded from URL:', decoded);
        return {
          matrix: decoded,
          firstFrameKey: decoded[0].key
        };
      }
    } catch (error) {
      console.error('Failed to load from URL:', error);
    }
  }
  return null;
};

// In your main OledPage function, add this after your existing state declarations:
const { isSaving } = useAutoSave(oledMatrix, dispatch);

// Replace your existing URL loading useEffect with this:
React.useEffect(() => {
  async function initializeFromURL() {
    const urlData = await loadFromURL(dispatch);
    if (urlData) {
      setOledMatrix(urlData.matrix);
      // This is the key fix - properly sync Redux state
      dispatch(setCurrentMatrixByKey(urlData.firstFrameKey));
    }
  }
  
  initializeFromURL();
}, [dispatch]);

  const handleRotateRight = React.useCallback(() => {

    const rotateRightFrame = (oledMatrix, currentKey) => {
      return oledMatrix.map(frame => {
        if (frame.key !== currentKey) return frame;

        const baseMatrix = frame.outerMatrix ?? expandToOuterMatrix(frame.matrix);
        const rotated = rotateMatrixRight(baseMatrix);

        return {
          ...frame,
          matrix: clipOuterMatrix(rotated),
          outerMatrix: rotated,
        };
      });
    }


    setOledMatrix(prev => rotateRightFrame(prev, currentMatrixKey))
  }, [currentMatrixKey]);


  function handleBoardChange(event) {
    console.log(event)
    setBoard(event.target.value)

  }
  let frameDuration = useSelector((state) => state.frameDuration.value)
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const WIDTH = 128;
  const HEIGHT = 64;

  const newMatrix = {
    key: 0, matrix:
      [
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
      ]

  }

  const [oledMatrix, setOledMatrix] = React.useState(
    [
      {
        key: currentMatrixKey, matrix: Array.from({ length: 64 }, () => Array(128).fill(false))
      },

    ]
  )

  const oledMatrixCurrentRef = React.useRef(oledMatrix)


   const [isSaving, setIsSaving] = React.useState(false);
  
  // Memoized compression function

  function binaryStringToBytes(binaryStr) {
  const byteCount = Math.ceil(binaryStr.length / 8);
  const bytes = new Uint8Array(byteCount);
  
  for (let i = 0; i < byteCount; i++) {
    const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
    bytes[i] = parseInt(byteStr, 2);
  }
  
  return bytes;
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

  const compressAndSave = React.useCallback(async (matrix) => {
    setIsSaving(true);
    try {
      const binary = matrixToBinaryString(matrix);
      const bytes = binaryStringToBytes(binary);
      const compressed = await LZMA.compress(bytes);
      const base64 = bytesToBase64(compressed);
      const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      window.history.replaceState({}, '', `?matrix=${urlSafe}`);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);


//   const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

// const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

const updateURL = () => {
compressToTinyURL(oledMatrix)
  .then(compressed => {
    window.history.pushState({}, '', `?matrix=${compressed}`);
  })
  .catch(error => {
    console.error("Failed to compress:", error);
  });
};

async function getCompressedURL(oledMatrix) {
  try {
    // 1. Compress the data (returns a Promise)
    const compressed = await compressToTinyURL(oledMatrix);
    
    // 2. Return the full URL string
    return `?matrix=${compressed}`;
  } catch (error) {
    console.error("Compression failed:", error);
    return ""; // Return empty string or handle error appropriately
  }
}
// Load from URL on mount
React.useEffect(() => {
    async function loadFromURL() {
      const params = new URLSearchParams(window.location.search);
      const matrixParam = params.get('matrix');
      
      if (matrixParam) {
        const decoded = await decompressFromTinyURL(matrixParam);
        if (decoded) {
          setOledMatrix(decoded);
          // Update Redux with first frame's key
          dispatch(setCurrentMatrixByKey(decoded[0].key));
        }
      }
    }
    
    loadFromURL();
  }, []);

// Load state from URL on initial render
// React.useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   const matrixParam = params.get('matrix');
  
//   console.log(matrixParam)
//   if (matrixParam) {
//     const decoded = decodeMatrixFromURL(matrixParam);
//     console.log(decoded)
//     if (decoded) setOledMatrix(decoded);
//   }
// }, []);


  React.useEffect(() => {
    oledMatrixCurrentRef.current = oledMatrix
  }, [oledMatrix])


const matrixToBinaryString = (oledMatrix) => {
  let binaryStr = '';
  for (const frame of oledMatrix) {
    for (let row of frame.matrix) {
      for (let cell of row) {
        binaryStr += cell ? '1' : '0';
      }
    }
  }
  return binaryStr;
};

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Convert to binary string
//   const binaryStr = matrixToBinaryString(oledMatrix);
  
//   // 2. Pack binary string into bytes
//   const bytes = new Uint8Array(Math.ceil(binaryStr.length / 8));
//   for (let i = 0; i < bytes.length; i++) {
//     const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
//     bytes[i] = parseInt(byteStr, 2);
//   }
  
//   // 3. Compress with zlib (great for binary data)
//   const compressed = pako.deflate(bytes);
  
//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-') // Replace URL-unsafe characters
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };



const matrixToEncodedString = (oledMatrix) => {
  let output = '';
  
  for (const frame of oledMatrix) {
    // Add frame key (with special delimiter)
    output += `[${frame.key}]`;
    
    // Add binary matrix data
    for (let row of frame.matrix) {
      for (let cell of row) {
        output += cell ? '1' : '0';
      }
    }
  }
  
  return output;
};

// Main encoding function

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Create a structured object with keys and binary data
//   const dataToEncode = {
//     frames: oledMatrix.map(frame => ({
//       key: frame.key,  // Preserve original key
//       data: frame.matrix.flatMap(row => 
//         row.map(cell => cell ? '1' : '0')).join('')
//     }))
//   };

//   // 2. Convert to JSON string
//   const jsonString = JSON.stringify(dataToEncode);

//   // 3. Compress with zlib
//   const compressed = pako.deflate(jsonString);

//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };




async function compressToTinyURL(oledMatrix) {
  try {
    // 1. Create structured data with frame keys preserved
    const structuredData = {
      version: 1,
      frameCount: oledMatrix.length,
      frames: oledMatrix.map(frame => ({
        key: frame.key,
        matrix: frame.matrix.flat().map(cell => cell ? 1 : 0)
      }))
    };

    // 2. Convert to JSON string
    const jsonString = JSON.stringify(structuredData);
    
    // 3. Convert to bytes for compression
    const bytes = new TextEncoder().encode(jsonString);
    
    // 4. LZMA compress
    const compressed = await LZMA.compress(bytes, 1);
    
    // 5. Convert to URL-safe Base64
    const base64 = btoa(String.fromCharCode(...compressed));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
  } catch (error) {
    console.error('Compression failed:', error);
    // Fallback to simpler compression
    const fallbackData = JSON.stringify(oledMatrix.map(f => ({
      key: f.key,
      data: f.matrix.flat().map(c => c ? 1 : 0)
    })));
    return btoa(fallbackData).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

// Improved decompression function
async function decompressFromTinyURL(encoded) {
  try {
    // 1. Convert from URL-safe Base64
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const compressed = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i);
    }
    
    // 2. LZMA decompress
    const decompressed = await LZMA.decompress(compressed);
    
    // 3. Convert bytes back to string
    const jsonString = new TextDecoder().decode(decompressed);
    
    // 4. Parse JSON
    const data = JSON.parse(jsonString);
    
    // 5. Reconstruct matrix format
    if (data.version === 1) {
      return data.frames.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.matrix[row * 128 + col] === 1
          )
        )
      }));
    }
    
    // Handle legacy format
    return data.map(frame => ({
      key: frame.key,
      matrix: Array.from({ length: 64 }, (_, row) =>
        Array.from({ length: 128 }, (_, col) =>
          frame.data[row * 128 + col] === 1
        )
      )
    }));
    
  } catch (error) {
    console.error('Decompression failed:', error);
    
    // Try fallback decompression
    try {
      const fallbackData = JSON.parse(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')));
      return fallbackData.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.data[row * 128 + col] === 1
          )
        )
      }));
    } catch (fallbackError) {
      console.error('Fallback decompression also failed:', fallbackError);
      return null;
    }
  }
}

// Auto-save hook with debouncing
const useAutoSave = (oledMatrix, dispatch) => {
  const [isSaving, setIsSaving] = React.useState(false);
  
  const saveToURL = React.useCallback(async (matrix) => {
    if (!matrix || matrix.length === 0) return;
    
    setIsSaving(true);
    try {
      const compressed = await compressToTinyURL(matrix);
      const url = new URL(window.location.href);
      url.searchParams.set('matrix', compressed);
      window.history.replaceState({}, '', url);
      console.log('Auto-saved to URL');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  const debouncedSave = React.useMemo(
    () => debounce(saveToURL, 2000), // 2 second delay
    [saveToURL]
  );
  
  React.useEffect(() => {
    if (oledMatrix.length > 0) {
      debouncedSave(oledMatrix);
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [oledMatrix, debouncedSave]);
  
  return { isSaving };
};

// Load from URL function
const loadFromURL = async (dispatch) => {
  const params = new URLSearchParams(window.location.search);
  const matrixParam = params.get('matrix');
  
  if (matrixParam) {
    try {
      const decoded = await decompressFromTinyURL(matrixParam);
      if (decoded && decoded.length > 0) {
        console.log('Loaded from URL:', decoded);
        return {
          matrix: decoded,
          firstFrameKey: decoded[0].key
        };
      }
    } catch (error) {
      console.error('Failed to load from URL:', error);
    }
  }
  return null;
};

// In your main OledPage function, add this after your existing state declarations:
const { isSaving } = useAutoSave(oledMatrix, dispatch);

// Replace your existing URL loading useEffect with this:
React.useEffect(() => {
  async function initializeFromURL() {
    const urlData = await loadFromURL(dispatch);
    if (urlData) {
      setOledMatrix(urlData.matrix);
      // This is the key fix - properly sync Redux state
      dispatch(setCurrentMatrixByKey(urlData.firstFrameKey));
    }
  }
  
  initializeFromURL();
}, [dispatch]);

  const handleRotateRight = React.useCallback(() => {

    const rotateRightFrame = (oledMatrix, currentKey) => {
      return oledMatrix.map(frame => {
        if (frame.key !== currentKey) return frame;

        const baseMatrix = frame.outerMatrix ?? expandToOuterMatrix(frame.matrix);
        const rotated = rotateMatrixRight(baseMatrix);

        return {
          ...frame,
          matrix: clipOuterMatrix(rotated),
          outerMatrix: rotated,
        };
      });
    }


    setOledMatrix(prev => rotateRightFrame(prev, currentMatrixKey))
  }, [currentMatrixKey]);


  function handleBoardChange(event) {
    console.log(event)
    setBoard(event.target.value)

  }
  let frameDuration = useSelector((state) => state.frameDuration.value)
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const WIDTH = 128;
  const HEIGHT = 64;

  const newMatrix = {
    key: 0, matrix:
      [
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
      ]

  }

  const [oledMatrix, setOledMatrix] = React.useState(
    [
      {
        key: currentMatrixKey, matrix: Array.from({ length: 64 }, () => Array(128).fill(false))
      },

    ]
  )

  const oledMatrixCurrentRef = React.useRef(oledMatrix)


   const [isSaving, setIsSaving] = React.useState(false);
  
  // Memoized compression function

  function binaryStringToBytes(binaryStr) {
  const byteCount = Math.ceil(binaryStr.length / 8);
  const bytes = new Uint8Array(byteCount);
  
  for (let i = 0; i < byteCount; i++) {
    const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
    bytes[i] = parseInt(byteStr, 2);
  }
  
  return bytes;
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

  const compressAndSave = React.useCallback(async (matrix) => {
    setIsSaving(true);
    try {
      const binary = matrixToBinaryString(matrix);
      const bytes = binaryStringToBytes(binary);
      const compressed = await LZMA.compress(bytes);
      const base64 = bytesToBase64(compressed);
      const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      window.history.replaceState({}, '', `?matrix=${urlSafe}`);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);


//   const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

// const updateURL = () => {
//   const compressed = encodeMatrixForURL(oledMatrix);
//   const url = new URL(window.location.href);
//   url.searchParams.set('matrix', compressed);
//   window.history.pushState({}, '', url);
// };

const updateURL = () => {
compressToTinyURL(oledMatrix)
  .then(compressed => {
    window.history.pushState({}, '', `?matrix=${compressed}`);
  })
  .catch(error => {
    console.error("Failed to compress:", error);
  });
};

async function getCompressedURL(oledMatrix) {
  try {
    // 1. Compress the data (returns a Promise)
    const compressed = await compressToTinyURL(oledMatrix);
    
    // 2. Return the full URL string
    return `?matrix=${compressed}`;
  } catch (error) {
    console.error("Compression failed:", error);
    return ""; // Return empty string or handle error appropriately
  }
}
// Load from URL on mount
React.useEffect(() => {
    async function loadFromURL() {
      const params = new URLSearchParams(window.location.search);
      const matrixParam = params.get('matrix');
      
      if (matrixParam) {
        const decoded = await decompressFromTinyURL(matrixParam);
        if (decoded) {
          setOledMatrix(decoded);
          // Update Redux with first frame's key
          dispatch(setCurrentMatrixByKey(decoded[0].key));
        }
      }
    }
    
    loadFromURL();
  }, []);

// Load state from URL on initial render
// React.useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   const matrixParam = params.get('matrix');
  
//   console.log(matrixParam)
//   if (matrixParam) {
//     const decoded = decodeMatrixFromURL(matrixParam);
//     console.log(decoded)
//     if (decoded) setOledMatrix(decoded);
//   }
// }, []);


  React.useEffect(() => {
    oledMatrixCurrentRef.current = oledMatrix
  }, [oledMatrix])


const matrixToBinaryString = (oledMatrix) => {
  let binaryStr = '';
  for (const frame of oledMatrix) {
    for (let row of frame.matrix) {
      for (let cell of row) {
        binaryStr += cell ? '1' : '0';
      }
    }
  }
  return binaryStr;
};

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Convert to binary string
//   const binaryStr = matrixToBinaryString(oledMatrix);
  
//   // 2. Pack binary string into bytes
//   const bytes = new Uint8Array(Math.ceil(binaryStr.length / 8));
//   for (let i = 0; i < bytes.length; i++) {
//     const byteStr = binaryStr.substr(i * 8, 8).padEnd(8, '0');
//     bytes[i] = parseInt(byteStr, 2);
//   }
  
//   // 3. Compress with zlib (great for binary data)
//   const compressed = pako.deflate(bytes);
  
//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-') // Replace URL-unsafe characters
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };



const matrixToEncodedString = (oledMatrix) => {
  let output = '';
  
  for (const frame of oledMatrix) {
    // Add frame key (with special delimiter)
    output += `[${frame.key}]`;
    
    // Add binary matrix data
    for (let row of frame.matrix) {
      for (let cell of row) {
        output += cell ? '1' : '0';
      }
    }
  }
  
  return output;
};

// Main encoding function

// const encodeMatrixForURL = (oledMatrix) => {
//   // 1. Create a structured object with keys and binary data
//   const dataToEncode = {
//     frames: oledMatrix.map(frame => ({
//       key: frame.key,  // Preserve original key
//       data: frame.matrix.flatMap(row => 
//         row.map(cell => cell ? '1' : '0')).join('')
//     }))
//   };

//   // 2. Convert to JSON string
//   const jsonString = JSON.stringify(dataToEncode);

//   // 3. Compress with zlib
//   const compressed = pako.deflate(jsonString);

//   // 4. Convert to Base64 (URL-safe)
//   return btoa(String.fromCharCode(...compressed))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// };




async function compressToTinyURL(oledMatrix) {
  try {
    // 1. Create structured data with frame keys preserved
    const structuredData = {
      version: 1,
      frameCount: oledMatrix.length,
      frames: oledMatrix.map(frame => ({
        key: frame.key,
        matrix: frame.matrix.flat().map(cell => cell ? 1 : 0)
      }))
    };

    // 2. Convert to JSON string
    const jsonString = JSON.stringify(structuredData);
    
    // 3. Convert to bytes for compression
    const bytes = new TextEncoder().encode(jsonString);
    
    // 4. LZMA compress
    const compressed = await LZMA.compress(bytes, 1);
    
    // 5. Convert to URL-safe Base64
    const base64 = btoa(String.fromCharCode(...compressed));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
  } catch (error) {
    console.error('Compression failed:', error);
    // Fallback to simpler compression
    const fallbackData = JSON.stringify(oledMatrix.map(f => ({
      key: f.key,
      data: f.matrix.flat().map(c => c ? 1 : 0)
    })));
    return btoa(fallbackData).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

// Improved decompression function
async function decompressFromTinyURL(encoded) {
  try {
    // 1. Convert from URL-safe Base64
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const compressed = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i);
    }
    
    // 2. LZMA decompress
    const decompressed = await LZMA.decompress(compressed);
    
    // 3. Convert bytes back to string
    const jsonString = new TextDecoder().decode(decompressed);
    
    // 4. Parse JSON
    const data = JSON.parse(jsonString);
    
    // 5. Reconstruct matrix format
    if (data.version === 1) {
      return data.frames.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.matrix[row * 128 + col] === 1
          )
        )
      }));
    }
    
    // Handle legacy format
    return data.map(frame => ({
      key: frame.key,
      matrix: Array.from({ length: 64 }, (_, row) =>
        Array.from({ length: 128 }, (_, col) =>
          frame.data[row * 128 + col] === 1
        )
      )
    }));
    
  } catch (error) {
    console.error('Decompression failed:', error);
    
    // Try fallback decompression
    try {
      const fallbackData = JSON.parse(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')));
      return fallbackData.map(frame => ({
        key: frame.key,
        matrix: Array.from({ length: 64 }, (_, row) =>
          Array.from({ length: 128 }, (_, col) =>
            frame.data[row * 128 + col] === 1
          )
        )
      }));
    } catch (fallbackError) {
      console.error('Fallback decompression also failed:', fallbackError);
      return null;
    }
  }
}

// Auto-save hook with debouncing
const useAutoSave = (oledMatrix, dispatch) => {
  const [isSaving, setIsSaving] = React.useState(false);
  
  const saveToURL = React.useCallback(async (matrix) => {
    if (!matrix || matrix.length === 0) return;
    
    setIsSaving(true);
    try {
      const compressed = await compressToTinyURL(matrix);
      const url = new URL(window.location.href);
      url.searchParams.set('matrix', compressed);
      window.history.replaceState({}, '', url);
      console.log('Auto-saved to URL');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  const debouncedSave = React.useMemo(
    () => debounce(saveToURL, 2000), // 2 second delay
    [saveToURL]
  );
  
  React.useEffect(() => {
    if (oledMatrix.length > 0) {
      debouncedSave(oledMatrix);
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [oledMatrix, debouncedSave]);
  
  return { isSaving };
};

// Load from URL function
const loadFromURL = async (dispatch) => {
  const params = new URLSearchParams(window.location.search);
  const matrixParam = params.get('matrix');
  
  if (matrixParam) {
    try {
      const decoded = await decompressFromTinyURL(matrixParam);
      if (decoded && decoded.length > 0) {
        console.log('Loaded from URL:', decoded);
        return {
          matrix: decoded,
          firstFrameKey: decoded[0].key