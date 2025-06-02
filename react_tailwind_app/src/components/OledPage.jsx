import React from 'react'



// import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";
// import { MdAddCircle } from "react-icons/md";

import PinSelector from './PinSelector';

// import { PiArrowsLeftRightBold } from "react-icons/pi";
// import { TbFlipHorizontal } from "react-icons/tb";
import { RxRotateCounterClockwise } from "react-icons/rx";
import FrameDurationInput from './FrameDurationInput';
// import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { LuCopy } from "react-icons/lu";
import { setFrameDuration } from '../reducers/frameDurationSlice';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { BsPlayFill, BsFillEraserFill } from "react-icons/bs";
import { LuClipboardCopy, LuCopyPlus } from "react-icons/lu";
import { PiFlipHorizontalFill, PiFlipVerticalFill } from "react-icons/pi";
import { TiMediaStop } from "react-icons/ti";
import { MdAdd, MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft, MdOutlineResetTv } from "react-icons/md";
import { GrRotateLeft, GrRotateRight } from "react-icons/gr";
import { MdDeleteForever } from "react-icons/md";
import { FaClipboardCheck } from "react-icons/fa6";

import OledFrame from "./OledFrame"
import Oled128x64 from "./Oled128x64"
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToKeyboardKey } from '../reducers/currentKeyboardKey';
import { setCurrentMatrixByKey } from '../reducers/currentMatrixSlice';
import generateMostEfficientCppArray from "./CppArrayFunctions"
import generate_oled_template from "./generatedCodeTemplates"
import { setToPlaying, setToStopped } from '../reducers/isAnimationPlaying';
import { ToastContainer, toast } from 'react-toastify';
import { notifyUser } from "./toastifyFunctions"

import Tool from './Tool';
function OledPage() {
  const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value)
  let currentKeyboardKey = useSelector((state) => state.currentKeyboardKey.value)
  let isAnimationPlaying = useSelector((state) => state.isAnimationPlaying.value)


  let pinCSRef = React.useRef(null)
  let pinCLKRef = React.useRef(null)
  let pinDINRef = React.useRef(null)
  const framesRef = React.useRef([]);
  const timelineRef = React.useRef(null);

  const [isMouseDown, setIsMouseDown] = React.useState(false);
  // const [downKey, setDownKey] = React.useState("l");
  const [generatedCode, setGeneratedCode] = React.useState("");
  const repeatInterval = React.useRef(null);
  // const [csPinHighlight, setCsPinHighlight] = React.useState(false);
  // const [clkPinHighlight, setClkPinHighlight] = React.useState(false);
  // const [dinPinHighlight, setDinPinHighlight] = React.useState(false);
  const [pinCS, setPinCS] = React.useState('none');
  const [pinCLK, setPinCLK] = React.useState('none');
  const [pinDIN, setPinDIN] = React.useState('none');
  // const [frameDuration, setFrameDuration] = React.useState(200);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isGenerateDisabled, setIsGenerateDisabled] = React.useState(false);
  const [isCodeGenerated, setIsCodeGenerated] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);



  let frameDuration = useSelector((state) => state.frameDuration.value)
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const WIDTH = 128;
  const HEIGHT = 64;
  // const [currentMatrix, setCurrentMatrix] = React.useState(1);
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

  // React.useEffect(() => {
  //   // Global mouseup listener to reset dragging state
  //   const handleMouseUp = () => {
  //     setIsDragging(false);
  //   };

  //   const handleMouseDown = () => {
  //     setIsDragging(true);
  //   };

  //   document.addEventListener("mouseup", handleMouseUp);
  //   document.addEventListener("mousedown", handleMouseDown);

  //   return () => {
  //     document.removeEventListener("mouseup", handleMouseUp);
  //     document.removeEventListener("mousedown", handleMouseDown);
  //   };
  // }, []);


  React.useEffect(() => {
    // Global mouseup listener to reset dragging state
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseDown = () => {
      setIsDragging(true);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    const handleKeyDown = (event) => {

      dispatch(setToKeyboardKey(event.code))

    };

    const handleKeyUp = (event) => {

      dispatch(setToKeyboardKey("KeyNone"))


    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      // Cleanup listener on unmount
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousedown", handleKeyUp);
    };



  }, []);


  // let [test, setTest] = React.useState(0);


  // React.useEffect(() => {
  //   console.log("re")
  //   console.log(pinCS)
  //   console.log(pinCLK)
  //   console.log(pinDIN)
  //   if (pinCS != "none" && pinCLK != "none" && pinDIN != "none") {
  //     console.log("inside")
  //     setIsGenerateDisabled(false)
  //   }
  //   else {
  //     setIsGenerateDisabled(true)
  //   }
  // }, [pinDIN, pinCLK, pinCS])


  // function flipAll() {
  //   let reversedMatrix = [[], [], [], [], [], [], [], []];
  //   let rMatrices = [];
  //   for (let i = 0; i < dotMatrixDivs.length; i++) {
  //     for (let j = 0; j < dotMatrixDivs[i].dotmatrix.length; j++) {
  //       for (let k = 0; k < dotMatrixDivs[i].dotmatrix[j].length; k++) {
  //         // console.log(dotMatrixDivs[i].dotmatrix[j])
  //         reversedMatrix[k].push(dotMatrixDivs[i].dotmatrix[j][k]);
  //         console.log(dotMatrixDivs[i].dotmatrix[j].length);
  //       }

  //     }
  //     rMatrices.push({ key: dotMatrixDivs[i].key, dotmatrix: reversedMatrix });

  //     reversedMatrix = [[], [], [], [], [], [], [], []];

  //   }
  //   //setDotMatrixDivs(rMatrices)
  //   return rMatrices;
  // }

  // function flipOneLeft(key) {
  //   setDotMatrixDivs((prevDivs) =>
  //     prevDivs.map((div) => {
  //       if (div.key !== key) return div;

  //       let originalMatrix = div.dotmatrix;
  //       let rotatedMatrix = Array.from({ length: 8 }, () => Array(8).fill(false));

  //       for (let row = 0; row < 8; row++) {
  //         for (let col = 0; col < 8; col++) {
  //           rotatedMatrix[row][col] = originalMatrix[col][7 - row];
  //         }
  //       }

  //       return { ...div, dotmatrix: rotatedMatrix };
  //     })
  //   );
  // }

  // function flipOneRight(key) {
  //   setDotMatrixDivs((prevDivs) =>
  //     prevDivs.map((div) => {
  //       if (div.key !== key) return div;

  //       let originalMatrix = div.dotmatrix;
  //       let rotatedMatrix = Array.from({ length: 8 }, () => Array(8).fill(false));

  //       for (let row = 0; row < 8; row++) {
  //         for (let col = 0; col < 8; col++) {
  //           rotatedMatrix[row][col] = originalMatrix[7 - col][row];
  //         }
  //       }

  //       return { ...div, dotmatrix: rotatedMatrix };
  //     })
  //   );
  // }

  // function flipVertical(key) {
  //   setDotMatrixDivs((prevDivs) =>
  //     prevDivs.map((div) =>
  //       div.key === key
  //         ? {
  //           ...div,
  //           dotmatrix: [...div.dotmatrix].reverse(), // Reverse row order (top ↔ bottom)
  //         }
  //         : div
  //     )
  //   );
  // }

  // function flipHorizontal(key) {
  //   setDotMatrixDivs((prevDivs) =>
  //     prevDivs.map((div) =>
  //       div.key === key
  //         ? {
  //           ...div,
  //           dotmatrix: div.dotmatrix.map((row) => [...row].reverse()), // Reverse each row (left ↔ right)
  //         }
  //         : div
  //     )
  //   );
  // }

  // function Duplicate() {
  //   let currMatrixIndex = oledMatrix.findIndex((matrix) => matrix.key == currentMatrix) //dotMatrixDivs
  //   if (currMatrixIndex === -1) {
  //     console.error("Matrix not found!");
  //     return;
  //   }

  //   console.log(currMatrixIndex)
  //   let newMatrix = {
  //     key: oledMatrix.length + 1,
  //     oledmatrix: oledMatrix[currMatrixIndex].oledmatrix.map(row => [...row])
  //   }
  //   setOledMatrix(prev => {
  //     let newState = [...prev];
  //     newState.splice(currMatrixIndex + 1, 0, newMatrix)
  //     console.log(newState)
  //     return newState
  //   })
  //   setCurrentMatrix(newMatrix.key)

  // }


  // Rotate 90 degrees clockwise (right)

const OUTER_SIZE = 128;
const DISPLAY_WIDTH = 128;
const DISPLAY_HEIGHT = 64;

/**
 * Ensures a 128x128 outer matrix with the original content centered.
 */
function expandToOuterMatrix(matrix) {
  const outer = Array.from({ length: OUTER_SIZE }, () =>
    Array(OUTER_SIZE).fill(0)
  );

  const height = matrix.length;
  const width = matrix[0].length;
  const yOffset = Math.floor((OUTER_SIZE - height) / 2);
  const xOffset = Math.floor((OUTER_SIZE - width) / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      outer[y + yOffset][x + xOffset] = matrix[y][x];
    }
  }

  return outer;
}

/**
 * Clips a 128x128 matrix back to the central 128x64 area.
 */
function clipOuterMatrix(matrix) {
  const yOffset = Math.floor((OUTER_SIZE - DISPLAY_HEIGHT) / 2);
  return matrix.slice(yOffset, yOffset + DISPLAY_HEIGHT);
}

/**
 * Rotates the outer matrix 90° to the right.
 */
function rotateMatrixRight(matrix) {
  const height = matrix.length;
  const width = matrix[0].length;
  const rotated = Array.from({ length: width }, () => Array(height).fill(0));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      rotated[x][height - 1 - y] = matrix[y][x];
    }
  }

  return rotated;
}

/**
 * Rotates the outer matrix 90° to the left.
 */
function rotateMatrixLeft(matrix) {
  const height = matrix.length;
  const width = matrix[0].length;
  const rotated = Array.from({ length: width }, () => Array(height).fill(0));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      rotated[width - 1 - x][y] = matrix[y][x];
    }
  }

  return rotated;
}

/**
 * Rotates the selected frame right.
 */
function rotateRightFrame(oledMatrix, currentKey) {
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

/**
 * Rotates the selected frame left.
 */
function rotateLeftFrame(oledMatrix, currentKey) {
  return oledMatrix.map(frame => {
    if (frame.key !== currentKey) return frame;

    const baseMatrix = frame.outerMatrix ?? expandToOuterMatrix(frame.matrix);
    const rotated = rotateMatrixLeft(baseMatrix);

    return {
      ...frame,
      matrix: clipOuterMatrix(rotated),
      outerMatrix: rotated,
    };
  });
}

/**
 * Flips the selected frame horizontally.
 * Destroys outerMatrix.
 */
function flipHorizontalFrame(oledMatrix, currentKey) {
  return oledMatrix.map(frame => {
    if (frame.key !== currentKey) return frame;

    const matrix = frame.matrix.map(row => [...row].reverse());
    return { ...frame, matrix, outerMatrix: undefined };
  });
}

/**
 * Flips the selected frame vertically.
 * Destroys outerMatrix.
 */
function flipVerticalFrame(oledMatrix, currentKey) {
  return oledMatrix.map(frame => {
    if (frame.key !== currentKey) return frame;

    const matrix = [...frame.matrix].reverse();
    return { ...frame, matrix, outerMatrix: undefined };
  });
}

/**
 * Any non-rotation action should reset the outer matrix.
 */
function clearOuterMatrix(oledMatrix) {
  return oledMatrix.map(frame => ({
    ...frame,
    outerMatrix: undefined,
  }));
}

  
  function Duplicate(matrixToDuplicate) {
    let currMatrixIndex = matrixToDuplicate.findIndex((matrix) => matrix.key == currentMatrixKey) //dotMatrixDivs
    if (currMatrixIndex === -1) {
      console.error("Matrix not found!");
      return;
    }

    console.log(currMatrixIndex)
    let newMatrix = {
      key: oledMatrix.length + 1,
      matrix: oledMatrix[currMatrixIndex].matrix.map(row => [...row])
    }
    setOledMatrix(prev => {
      let newState = [...prev];
      newState.splice(currMatrixIndex + 1, 0, newMatrix)
      console.log(newState)
      return newState
    })

    dispatch(setCurrentMatrixByKey(newMatrix.key))

  }



  // function repeatFunction(func, delay, repeat) {
  //   func(oledMatrix[0].key); //dotMatrixDivs
  //   let counter = 1;

  //   repeatInterval.current = setInterval(() => {

  //     if (repeat !== counter) {
  //       func(dotMatrixDivs[counter].key);//dotMatrixDivs
  //       counter++;
  //     } else {
  //       clearInterval(repeatInterval.current)
  //     }
  //   }, delay);

  // }

  function startAnimation() {
    //setIsAnimating(true);
    dispatch(setToPlaying())
    repeatFunction((key) => dispatch(setCurrentMatrixByKey(key)), frameDuration, oledMatrix.length)
  }
  function repeatFunction(func, delay, repeat,) {

    func(oledMatrix[0].key); //dotMatrixDivs
    let counter = 1;

    repeatInterval.current = setInterval(() => {

      if (repeat !== counter) {
        func(oledMatrix[counter].key);//dotMatrixDivs
        counter++;
      } else {
        // setIsAnimating(false);
        dispatch(setToStopped())
        clearInterval(repeatInterval.current)
      }
    }, delay);

  }

  function stopAnimation() {
    if (repeatInterval.current) {
      clearInterval(repeatInterval.current);
      repeatInterval.current = null;
      dispatch(setCurrentMatrixByKey(oledMatrix[0].key))
      // setIsAnimating(false);
      dispatch(setToStopped())
    }
  }


  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedDivs = Array.from(oledMatrix); //or dotMatrixDivs
    const [removed] = reorderedDivs.splice(source.index, 1);
    reorderedDivs.splice(destination.index, 0, removed);
    setOledMatrix(reorderedDivs); // or setDotMatrixDivs
  };


  // React.useEffect(() => {


  //   if (!timelineRef.current) return;

  //   const observerCallback = (entries) => {
  //     entries.forEach((entry) => {
  //       console.log("checking...")
  //       console.log(framesRef)
  //       console.log(timelineRef.current)
  //       if (entry.isIntersecting) {

  //         // When intersecting, update the active frame state
  //         // setActiveFrame(entry.target.getAttribute('data-frame'));
  //         // console.log("jh")
  //         // Check if the intersecting frame also intersects with timelineRef
  //         const frameRect = entry.target.getBoundingClientRect();
  //         const timelineRect = timelineRef.current.getBoundingClientRect();

  //         if (
  //           frameRect.left < timelineRect.right &&
  //           frameRect.right > timelineRect.left &&
  //           frameRect.top < timelineRect.bottom &&
  //           frameRect.bottom > timelineRect.top
  //         ) {
  //           console.log("Timeline is touching frame:", entry.target.getAttribute('data-frame'));
  //         }
  //       }
  //     });
  //   };

  //   const observer = new IntersectionObserver(observerCallback, {
  //     root: null,
  //     threshold: 0.01,
  //   });

  //   // Observe each frame element
  //   framesRef.current.forEach((frame) => observer.observe(frame));

  //   return () => observer.disconnect(); // Cleanup on component unmount
  // }, [test]);

  function addFrame() {

    const newMat = {
      // key: dotMatrixDivs.length + 1,
      key: generateId(),
      dotmatrix: newMatrix.dotmatrix.map(row => [...row])
    };
    setDotMatrixDivs(prev => [...prev, newMat])

    // setCurrentMatrix(newMat.key)
    dispatch(setCurrentMatrixByKey(newMat.key))

  }

  function generateCode() {

    // let matrixObject = oledMatrix.find(obj => obj.key=== currentMatrixKey)

    let list_of_frames = oledMatrix.map((frame, index) => generateMostEfficientCppArray(frame.matrix, index))
    console.log(generate_oled_template(list_of_frames, frameDuration))

    //let frames_cpp = list_of_frames.map((frame,index) =>code_generation_templates[frame.strategy](frame.cpp,index))
    //  let cpp_data = generateMostEfficientCppArray(matrixObject.matrix) 
    //  setGeneratedCode(code_generation_templates[cpp_data.strategy](cpp_data.cpp))
    // setIsCodeGenerated(true)
  }
  function generateId() {
    return Math.random().toString(36).substr(2, 9)
  }
  function addFrame() {

    const newMat = {
      // key: dotMatrixDivs.length + 1,
      key: generateId(),
      matrix: Array.from({ length: 64 }, () => Array(128).fill(false))
    };
    setOledMatrix(prev => [...prev, newMat])

    // setCurrentMatrix(newMat.key)
    dispatch(setCurrentMatrixByKey(newMat.key))

  }

  function clearFrame() {

    let newMatrix = Array.from({ length: 64 }, () => Array(128).fill(false))

    let editedStates = oledMatrix.map(matrix => {

      if (matrix.key === currentMatrixKey) return { key: matrix.key, matrix: newMatrix }
      return matrix
    })

    setOledMatrix(editedStates)

  }

  function generateCodeOneFrame() {

    let rMatrices = flipAll(oledMatrix);
    //console.log(rMatrices.map(matrix=>matrix.dotmatrix))
    // let stringMatrices = JSON.stringify(rMatrices.map(matrix=>matrix.dotmatrix))
    let frame = rMatrices[rMatrices.findIndex(matrix => matrix.key === currentMatrixKey)].dotmatrix
    let dotMatrixString = JSON.stringify(frame)
    let dotMatrixFormatted = dotMatrixString.replace(/[\[\]]/g, match => match === "[" ? "{" : "}")
    console.log(`const bool frame[8][8] = ${dotMatrixFormatted}`)

    setGeneratedCode(`
    
const int DIN = ${pinDIN};
const int CS = ${pinCS};
const int CLK = ${pinCLK};


// Define the frame data (matrix list)

const bool frame[8][8] = ${dotMatrixFormatted};

void setup() {
  // Set pin modes
  pinMode(DIN, OUTPUT);
  pinMode(CLK, OUTPUT);
  pinMode(CS, OUTPUT);

  // Initialize MAX7219
  digitalWrite(CS, HIGH);
  sendCommand(0x0F, 0x00); // Display test off
  sendCommand(0x09, 0x00); // Decode mode off
  sendCommand(0x0B, 0x07); // Scan limit = 8 LEDs
  sendCommand(0x0A, 0x08); // Brightness = medium
  sendCommand(0x0C, 0x01); // Shutdown register = normal operation
  clearDisplay();
  displayFrame(frame);
}

void loop() {
   
}

void sendCommand(byte command, byte data) {
  digitalWrite(CS, LOW);
  shiftOut(DIN, CLK, MSBFIRST, command);
  shiftOut(DIN, CLK, MSBFIRST, data);
  digitalWrite(CS, HIGH);
}

void clearDisplay() {
  for (int i = 0; i < 8; i++) {
    sendCommand(i + 1, 0);
  }
}

void displayFrame(const bool matrix[8][8]) {
  for (int row = 0; row < 8; row++) {
    byte rowData = 0;
    for (int col = 0; col < 8; col++) {
      if (matrix[row][col]) {
        rowData |= (1 << col);
      }
    }
    sendCommand(row + 1, rowData);
  }
}`)
    setIsCodeGenerated(true)
  }
  return (
    <div className="w-screen text-center flex justify-center flex-col items-center  ">
      <ToastContainer />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable direction="horizontal" droppableId="oledMatrix" type="MATRIX">
          {(provided) => (
            <div
              className="md:min-w-[30em]  lg:min-w-[50em]  outline-green-800 rounded-md outline-2 outline bg-gray-800 max-h-[160px] overflow-y-hidden gap-2 m-5 p-3 max-w-[90%] overflow-x-auto scroll-content shadow-lg relative"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className='flex flex-wrap justify-between'>
                {/* <div className='flex space-x-3'>
                  <MdAdd
                    className='bg-slate-900 cursor-pointer hover:bg-green-600 hover:text-green-200 size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500'
                    onClick={addFrame}
                
                  />

                  <TiMediaStop className='bg-slate-900  hover:bg-green-600 hover:text-green-200 cursor-pointer  size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500' onClick={() => stopRepeat()}>stop</TiMediaStop >
                

                  <button disabled={true} onClick={
                    isAnimating&& repeatFunction((key) => dispatch(setCurrentMatrixByKey(key)), frameDuration, oledMatrix.length, oledMatrix)

                  }>
                    <BsPlayFill className='bg-slate-900  hover:bg-green-600 hover:text-green-200 cursor-pointer   size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500'

                    />
                  </button>

                  <LuCopy
                    onClick={() => Duplicate(oledMatrix)}
                    className='bg-slate-900  hover:bg-green-600 hover:text-green-200 cursor-pointer  size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500' />
                </div> */}

                <div className='flex space-x-4'>

                  <Tool
                    Icon={MdAdd}
                    target="add"
                    onClick={addFrame}
                    tooltip={["Add Frame"]}
                  ></Tool>

                  {
                    isAnimationPlaying ?

                      <Tool
                        Icon={TiMediaStop}
                        target="stop"
                        onClick={stopAnimation}
                        tooltip={["Stop Animation"]}
                        classes={"scale-110 hover:bg-red-600 hover:text-red-200 ring-2 ring-offset-2 ring-[#ff0000] text-[#ff0000]"}

                      ></Tool>

                      :

                      <Tool
                        Icon={BsPlayFill}
                        target="play"
                        onClick={startAnimation}
                        tooltip={["Play"]}
                      ></Tool>
                  }

                  <Tool
                    Icon={LuCopyPlus}
                    target="duplicate"
                    onClick={() => Duplicate(oledMatrix)}
                    tooltip={["Duplicate Frame"]}
                  ></Tool>

                  <Tool
                    Icon={MdOutlineResetTv}
                    target="clear"
                    onClick={clearFrame}
                    tooltip={["Clear Frame"]}
                  ></Tool>

                  {/* <Tool
                    Icon={MdDeleteForever}
                    target="delete"
                    onClick={deleteFrame}
                    tooltip={["Delete Frame"]}
                    classes={" hover:text-red-200 size-6 rounded-full  text-red-600"}
                  ></Tool> */}

                </div>

                <div className='flex flex-wrap'>
                  <RxRotateCounterClockwise className='hover:text-teal-200 hover:cursor-pointer mx-2 size-5 rounded-full  text-green-500' onClick={()=>setOledMatrix(prev => rotateLeftFrame(prev, currentMatrixKey))}>Flip left</RxRotateCounterClockwise>
                  <RxRotateCounterClockwise className='hover:text-teal-200 hover:cursor-pointer mx-2 transform scale-x-[-1] size-5 rounded-full  text-green-400' onClick={()=>setOledMatrix(prev => rotateRightFrame(prev, currentMatrixKey))}>Flip right</RxRotateCounterClockwise>
                  <PiFlipHorizontalFill className='hover:text-teal-200 hover:cursor-pointer mx-2  size-5 rounded-full  text-green-500' onClick={()=>setOledMatrix(prev => flipHorizontalFrame(prev, currentMatrixKey))}>Flip vert</PiFlipHorizontalFill>
                  <PiFlipVerticalFill className='hover:text-teal-200 hover:cursor-pointer mx-2  size-5 rounded-full  text-green-500' onClick={()=>setOledMatrix(prev => flipVerticalFrame(prev, currentMatrixKey))}>Flip horx</PiFlipVerticalFill   >
                  {/* <div className='flex w-[15em] bg-slate-800 rounded-sm text-green-500 '>

                    <span className='text-[0.8em] px-1'>Frame duration </span>
                    <input
                      onChange={(e) => {
                        dispatch(setFrameDuration(e.target.value))
                      }}
                      maxLength={8}
                      value={frameDuration}
                      className="rounded-md  outline outline-1 outline-green-700 w-[35%] bg-slate-900  "></input>

                    <span className='text-[0.8em] px-1'>ms </span>

                  </div> */}
                  <FrameDurationInput></FrameDurationInput>
                </div>
              </div>


              <div className=' mt-3  bg-gray-900 rounded-md'>


                <div className='flex'
                  onMouseDown={e => e.preventDefault()}
                  draggable="false"
                >

                  {
                    //8x8 frames
                    oledMatrix.map((matrix, index) => (
                      <Draggable key={matrix.key} draggableId={String(matrix.key)} index={index}>
                        {(provided) => (<>


                          <OledFrame
                            currentMatrix={currentMatrixKey}
                            // setCurrentMatrix={setCurrentMatrix}
                            oledMatrix={oledMatrix}
                            setOledMatrix={setOledMatrix}
                            width={WIDTH}
                            height={HEIGHT}
                            matrix={matrix}
                            provided={provided}
                            framesRef={framesRef}
                            index={index}
                          ></OledFrame>

                        </>
                        )

                        }
                      </Draggable>
                    ))}
                </div>

              </div>

              {provided.placeholder}
            </div>

          )}

        </Droppable>

      </DragDropContext>

      {/* Other parts of your app */}

      <div className='flex shadow-xl shadow-[#282828]'>

        <div className=' relative 
      shadow-sm max-sm:w-[85%] w-[19em] max-h-[40em] bg-[#093710] flex flex-col justify-center items-center pt-5'
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}

        >


          <div className='   bg-gray-900 p-3'
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}

          >



            <Oled128x64
              oledMatrix={oledMatrix}
              setOledMatrix={setOledMatrix}

            ></Oled128x64>



          </div>



        </div>
        <div className='flex flex-col'>
          <form class="max-w-sm mx-auto  bg-[#093710] p-4 relative">

            <div
              type="button" //Needed to prevent form page refresh

              className={
                isGenerateDisabled ?
                  'bg-slate-900 text-gray-600 outline outline-gray-600 py-1 px-2 rounded-sm'
                  :
                  'bg-slate-900 text-green-600 outline outline-green-600 py-1 px-2 rounded-sm cursor-pointer'
              }
              onClick={isGenerateDisabled ? () => { } : () => generateCode()}>Generate animation code</div>

            <div
              type="button" //Needed to prevent form page refresh

              className={
                isGenerateDisabled ?
                  'bg-slate-900 text-gray-600 outline outline-gray-600 py-1 px-2 rounded-sm mt-5'
                  :
                  'bg-slate-900 text-green-600 outline outline-green-600 py-1 px-2 rounded-sm mt-5 cursor-pointer'
              }
              onClick={isGenerateDisabled ? () => { } : () => generateCodeOneFrame()}>Generate frame code</div>

          </form>
        </div>
      </div>
      {isCodeGenerated ? <pre
        style={{
          backgroundColor: "#282c34",
          color: "#f8f8f2",
          padding: "1rem",
          borderRadius: "0.5rem",
          overflowX: "auto",
          fontFamily: "monospace",
          fontSize: "0.9rem",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          textAlign: "left",
        }}
        class="mt-10 w-[95%]  rounded-lg outline outline-2 outline-green-700 shadow-2xl shadow-black"
      >
        <button
          onClick={() => {
            navigator.clipboard.writeText(generatedCode)
          }}
          className='ml-auto flex justify-between items-center hover:scale-110 font-semibold  outline outline-2 outline-green-600 rounded-md m-3 p-2 text-green-300 shadow-lg shadow-[#191919]'>

          <span >Cody Code</span>
          <LuClipboardCopy class="m-1 size-5"></LuClipboardCopy>
        </button>
        <code>{generatedCode}</code>
      </pre> : <></>}


    </div>

  );

  //return (<Router/>)
}


export default OledPage
