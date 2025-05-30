import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentMatrixByKey } from '../reducers/currentMatrixSlice';
import { setToKeyboardKey } from '../reducers/currentKeyboardKey';
import { setToPlaying, setToStopped } from '../reducers/isAnimationPlaying';
import EightByEightFrame from './EightByEightFrame';
import EightByEightMain from './EightByEightMain';
import Max7219IC from './Max7219IC';
import PinSelector from './PinSelector';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { BsPlayFill, BsFillEraserFill } from "react-icons/bs";
import { LuClipboardCopy, LuCopyPlus } from "react-icons/lu";
import { PiFlipHorizontalFill, PiFlipVerticalFill } from "react-icons/pi";
import { TiMediaStop } from "react-icons/ti";
import { MdAdd, MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft, MdOutlineResetTv } from "react-icons/md";
import { GrRotateLeft, GrRotateRight } from "react-icons/gr";
import { MdDeleteForever } from "react-icons/md";
import { FaClipboardCheck } from "react-icons/fa6";

import { ToastContainer, toast, Flip } from 'react-toastify';

import ToolMainFrame from './ToolMainFrame';
import { useNavigate } from 'react-router-dom'
import Tool from "./Tool"


function Max7219Page() {

  let pinCSRef = React.useRef(null)
  let pinCLKRef = React.useRef(null)
  let pinDINRef = React.useRef(null)
  const framesRef = React.useRef([]);
  const timelineRef = React.useRef(null);

  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [downKey, setDownKey] = React.useState("l");
  const [generatedCode, setGeneratedCode] = React.useState("");
  const repeatInterval = React.useRef(null);
  const [csPinHighlight, setCsPinHighlight] = React.useState(false);
  const [clkPinHighlight, setClkPinHighlight] = React.useState(false);
  const [dinPinHighlight, setDinPinHighlight] = React.useState(false);
  const [pinCS, setPinCS] = React.useState('none');
  const [pinCLK, setPinCLK] = React.useState('none');
  const [pinDIN, setPinDIN] = React.useState('none');
  const [frameDuration, setFrameDuration] = React.useState('200');
  const [isGenerateDisabled, setIsGenerateDisabled] = React.useState(true);
  const [isCodeGenerated, setIsCodeGenerated] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  //const [isAnimating, setIsAnimating] = React.useState(false);
  const [codeCopied, setCodeCopied] = React.useState(false)
  const WIDTH = 128;
  const HEIGHT = 64;
  // const [currentMatrix, setCurrentMatrix] = React.useState(1);

  const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value)
  let currentKeyboardKey = useSelector((state) => state.currentKeyboardKey.value)
  let isAnimationPlaying = useSelector((state) => state.isAnimationPlaying.value)
  const navigate = useNavigate();

  const dispatch = useDispatch()
  const newMatrix = {
    key: 0, dotmatrix:
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
  const [dotMatrixDivs, setDotMatrixDivs] = React.useState(
    [
      {
        key: currentMatrixKey, dotmatrix: Array.from({ length: 8 }, () => Array(8).fill(false))
      },

    ]
  )


  const [oledMatrix, setOledMatrix] = React.useState(
    [
      {
        key: 1, oledmatrix: Array.from({ length: 64 }, () => Array(128).fill(false))
      },

    ]
  )


  function shiftMatrixRightNoWrap(matrixKey) {
    setDotMatrixDivs(prev =>
      prev.map(matrix => {
        if (matrix.key !== matrixKey) return matrix;

        const shifted = matrix.dotmatrix.map(row => {
          return [false, ...row.slice(0, -1)];
        });

        return { ...matrix, dotmatrix: shifted };
      })
    );
  }

  function shiftMatrixLeftNoWrap(matrixKey) {
    setDotMatrixDivs(prev =>
      prev.map(matrix => {
        if (matrix.key !== matrixKey) return matrix;

        const shifted = matrix.dotmatrix.map(row => {
          return [...row.slice(1), false];
        });

        return { ...matrix, dotmatrix: shifted };
      })
    );
  }

  function shiftMatrixRight(matrixKey) {
    setDotMatrixDivs(prev =>
      prev.map(matrix => {
        if (matrix.key !== matrixKey) return matrix;

        const shifted = matrix.dotmatrix.map(row => {
          const last = row[row.length - 1];
          return [last, ...row.slice(0, -1)];
        });

        return { ...matrix, dotmatrix: shifted };
      })
    );
  }

  function shiftMatrixLeftByKey(matrixKey) {
    setDotMatrixDivs(prev =>
      prev.map(matrix => {
        if (matrix.key !== matrixKey) return matrix;

        const shifted = matrix.dotmatrix.map(row => {
          const first = row[0];
          return [...row.slice(1), first];
        });

        return { ...matrix, dotmatrix: shifted };
      })
    );
  }

  function notifyUser(message, notificationFunction) {
    notificationFunction(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Flip,
    });
  }

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



  let [test, setTest] = React.useState(0);


  React.useEffect(() => {

    if (pinCS != "none" && pinCLK != "none" && pinDIN != "none") {
      setIsGenerateDisabled(false)
    }
    else {
      setIsGenerateDisabled(true)
    }
  }, [pinDIN, pinCLK, pinCS])


  function handleSelectScreen(e) {
    const value = e.target.value;
    if (!value) return

    navigate(value)

  }
  function frameDurationBlurHandle() {

    const num = Number(frameDuration);
    if (num < 10) {
      notifyUser("Duration can't be lower than 10", toast.warning)
      setFrameDuration(10)
    }

  }
  function frameDurationChangeHandle(e) {
    let val = e.target.value
    if (/^\d*$/.test(val)) {
      setFrameDuration(val);

    }


  }
  function flipAll() {
    let reversedMatrix = [[], [], [], [], [], [], [], []];
    let rMatrices = [];
    for (let i = 0; i < dotMatrixDivs.length; i++) {
      for (let j = 0; j < dotMatrixDivs[i].dotmatrix.length; j++) {
        for (let k = 0; k < dotMatrixDivs[i].dotmatrix[j].length; k++) {
          // console.log(dotMatrixDivs[i].dotmatrix[j])
          reversedMatrix[k].push(dotMatrixDivs[i].dotmatrix[j][k]);
        }

      }
      rMatrices.push({ key: dotMatrixDivs[i].key, dotmatrix: reversedMatrix });

      reversedMatrix = [[], [], [], [], [], [], [], []];

    }
    //setDotMatrixDivs(rMatrices)
    return rMatrices;
  }

  function flipOneLeft(key) {
    setDotMatrixDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.key !== key) return div;

        let originalMatrix = div.dotmatrix;
        let rotatedMatrix = Array.from({ length: 8 }, () => Array(8).fill(false));

        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            rotatedMatrix[row][col] = originalMatrix[col][7 - row];
          }
        }

        return { ...div, dotmatrix: rotatedMatrix };
      })
    );
  }

  function flipOneRight(key) {
    setDotMatrixDivs((prevDivs) =>
      prevDivs.map((div) => {
        if (div.key !== key) return div;

        let originalMatrix = div.dotmatrix;
        let rotatedMatrix = Array.from({ length: 8 }, () => Array(8).fill(false));

        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            rotatedMatrix[row][col] = originalMatrix[7 - col][row];
          }
        }

        return { ...div, dotmatrix: rotatedMatrix };
      })
    );
  }

  function flipVertical(key) {
    setDotMatrixDivs((prevDivs) =>
      prevDivs.map((matrix) =>
        matrix.key === key
          ? {
            ...matrix,
            dotmatrix: [...matrix.dotmatrix].reverse(), // Reverse row order (top ↔ bottom)
          }
          : matrix
      )
    );
  }


  function clearFrame() {

    let newDotmatrix =
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

    let editedStates = dotMatrixDivs.map(matrix => {

      if (matrix.key === currentMatrixKey) return { key: matrix.key, dotmatrix: newDotmatrix }
      return matrix
    })

    setDotMatrixDivs(editedStates)

  }



  function flipHorizontal(key) {
    setDotMatrixDivs((prevDivs) =>
      prevDivs.map((matrix) =>
        matrix.key === key
          ? {
            ...matrix,
            dotmatrix: matrix.dotmatrix.map((row) => [...row].reverse()), // Reverse each row (left ↔ right)
          }
          : matrix
      )
    );
  }

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

  function Duplicate() {
    let currMatrixIndex = dotMatrixDivs.findIndex((matrix) => matrix.key == currentMatrixKey) //dotMatrixDivs
    if (currMatrixIndex === -1) {
      return;
    }

    let newMatrix = {
      key: dotMatrixDivs.length + 1,
      dotmatrix: dotMatrixDivs[currMatrixIndex].dotmatrix.map(row => [...row])
    }
    setDotMatrixDivs(prev => {
      let newState = [...prev];
      newState.splice(currMatrixIndex + 1, 0, newMatrix)
      return newState
    })
    //setCurrentMatrix(newMatrix.key)
    dispatch(setCurrentMatrixByKey(newMatrix.key))
  }

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

  function generateId() {
    return Math.random().toString(36).substr(2, 9)
  }
  function deleteFrame() {
    if (dotMatrixDivs.length <= 1) return

    let filteredMatrix = dotMatrixDivs.filter(matrix => matrix.key !== currentMatrixKey)

    setDotMatrixDivs(filteredMatrix)

    dispatch(setCurrentMatrixByKey(filteredMatrix[filteredMatrix.length - 1].key))

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
    repeatFunction((key) => dispatch(setCurrentMatrixByKey(key)), frameDuration, dotMatrixDivs.length)
  }
  function repeatFunction(func, delay, repeat,) {

    func(dotMatrixDivs[0].key); //dotMatrixDivs
    let counter = 1;

    repeatInterval.current = setInterval(() => {

      if (repeat !== counter) {
        func(dotMatrixDivs[counter].key);//dotMatrixDivs
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
      dispatch(setCurrentMatrixByKey(dotMatrixDivs[0].key))
      // setIsAnimating(false);
      dispatch(setToStopped())
    }
  }


  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedDivs = Array.from(dotMatrixDivs); //or dotMatrixDivs
    const [removed] = reorderedDivs.splice(source.index, 1);
    reorderedDivs.splice(destination.index, 0, removed);
    setDotMatrixDivs(reorderedDivs); // or setDotMatrixDivs
  };


  // React.useEffect(() => {


  //   if (!timelineRef.current) return;

  //   const observerCallback = (entries) => {
  //     entries.forEach((entry) => {
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
  //           // console.log("Timeline is touching frame:", entry.target.getAttribute('data-frame'));
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

  function generateCode() {

    let rMatrices = flipAll(dotMatrixDivs);
    // let stringMatrices = JSON.stringify(rMatrices.map(matrix=>matrix.dotmatrix))
    let dotMatrixString = JSON.stringify(rMatrices.map(matrix => matrix.dotmatrix))
    let dotMatrixFormatted = dotMatrixString.replace(/[\[\]]/g, match => match === "[" ? "{" : "}")

    setCodeCopied(false)
    setGeneratedCode(`
    
const int DIN = ${pinDIN};
const int CS = ${pinCS};
const int CLK = ${pinCLK};


// Define the frame data (matrix list)
const int numFrames = ${dotMatrixDivs.length}; // Number of frames in the list
const bool frames[numFrames][8][8] = ${dotMatrixFormatted};

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
}

void loop() {
  for (int frame = 0; frame < numFrames; frame++) {
    displayFrame(frames[frame]);
    delay(${frameDuration}); // Delay between frames (adjust as needed)
  }
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
    notifyUser("Code Generation Sucessful!", toast.success)
  }

  function generateCodeOneFrame() {

    let rMatrices = flipAll(dotMatrixDivs);
    // let stringMatrices = JSON.stringify(rMatrices.map(matrix=>matrix.dotmatrix))
    let frame = rMatrices[rMatrices.findIndex(matrix => matrix.key === currentMatrixKey)].dotmatrix
    let dotMatrixString = JSON.stringify(frame)
    let dotMatrixFormatted = dotMatrixString.replace(/[\[\]]/g, match => match === "[" ? "{" : "}")

    setCodeCopied(false)
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
    <div className="w-screen text-center flex justify-center flex-col items-center">
      <ToastContainer />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable direction="horizontal" droppableId="dotMatrixDivs" type="MATRIX">
          {(provided) => (
            <div
              className="md:min-w-[30em]  lg:min-w-[50em]  outline-green-800 rounded-md outline-2 outline bg-gray-800 max-h-[160px] overflow-y-hidden gap-2 m-5 p-3 max-w-[90%] overflow-x-auto scroll-content shadow-lg relative"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className='flex flex-wrap justify-between'>
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
                    onClick={Duplicate}
                    tooltip={["Duplicate Frame"]}
                  ></Tool>

                  <Tool
                    Icon={MdOutlineResetTv}
                    target="clear"
                    onClick={clearFrame}
                    tooltip={["Clear Frame"]}
                  ></Tool>

                  <Tool
                    Icon={MdDeleteForever}
                    target="delete"
                    onClick={deleteFrame}
                    tooltip={["Delete Frame"]}
                    classes={" hover:text-red-200 size-6 rounded-full  text-red-600"}
                  ></Tool>

                </div>


                <div className='flex flex-wrap'>
                  {/* <RxRotateCounterClockwise className='hover:text-teal-200 hover:cursor-pointer mx-2 size-5 rounded-full  text-green-500' onClick={() => flipOneLeft(currentMatrix)}>Flip left</RxRotateCounterClockwise>
                  <RxRotateCounterClockwise className='hover:text-teal-200 hover:cursor-pointer mx-2 transform scale-x-[-1] size-5 rounded-full  text-green-400' onClick={() => flipOneRight(currentMatrix)}>Flip right</RxRotateCounterClockwise>
                  <PiFlipHorizontalFill className='hover:text-teal-200 hover:cursor-pointer mx-2  size-5 rounded-full  text-green-500' onClick={() => flipHorizontal(currentMatrix)}>Flip vert</PiFlipHorizontalFill>
                  <PiFlipVerticalFill className='hover:text-teal-200 hover:cursor-pointer mx-2  size-5 rounded-full  text-green-500' onClick={() => flipVertical(currentMatrix)}>Flip horx</PiFlipVerticalFill   > */}
                  <div className='flex w-[15em] bg-slate-800 rounded-sm text-green-500 '>

                    <span className='text-[0.8em] px-1'>Frame duration </span>
                    <input

                      type="text"
                      min="10"
                      inputMode="numeric"
                      onChange={frameDurationChangeHandle}

                      onBlur={frameDurationBlurHandle}
                      maxLength={8}
                      value={frameDuration}
                      className="no-spinner pl-2 text-blue-400 rounded-md  outline outline-1 outline-green-700 w-[35%] bg-slate-900  "></input>

                    <span className='text-[0.8em] px-1'>ms </span>

                  </div>
                </div>
              </div>


              <div className=' mt-3  bg-gray-900 rounded-md'>
                {/* <div className='text-green-500 font-bold bg-gray-800 '>
                  <span>0</span>
                  <span>:</span>
                  <span>0</span>
                </div> */}

                <div className='flex'
                  onMouseDown={e => e.preventDefault()}
                  draggable="false"
                >

                  {
                    //8x8 frames
                    dotMatrixDivs.map((matrix, index) => (
                      <Draggable key={matrix.key} draggableId={String(matrix.key)} index={index}>
                        {(provided) => (<>

                          <EightByEightFrame

                            matrix={matrix}
                            provided={provided}
                            framesRef={framesRef}
                            // currentMatrix={currentMatrix}
                            //setCurrentMatrix={setCurrentMatrix}
                            index={index}

                          ></EightByEightFrame>
                          {/* <OledFrame
                        currentMatrix={currentMatrix}
                        setCurrentMatrix={setCurrentMatrix}
                        oledMatrix={oledMatrix}
                        setOledMatrix={setOledMatrix}
                        width={WIDTH}
                        height={HEIGHT}
                        matrix={matrix}
                        provided={provided}
                        framesRef={framesRef}
                        index={index}
                        ></OledFrame> */}

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


            <div className='flex justify-between mb-2'>


              <ToolMainFrame
                Icon={MdKeyboardDoubleArrowLeft}
                target="shiftleft"
                onClick={() =>
                  currentKeyboardKey === "ControlLeft" ? shiftMatrixLeftNoWrap(currentMatrixKey)
                    : shiftMatrixLeftByKey(currentMatrixKey)


                }
                tooltip={["shift left", "Press `Ctrl` for No Wrap shift"]}

              ></ToolMainFrame>
              <ToolMainFrame
                Icon={GrRotateLeft}
                target="rotateLeft"
                onClick={() => flipOneLeft(currentMatrixKey)}
                tooltip={["rotate left"]}

              ></ToolMainFrame>

              <ToolMainFrame
                Icon={PiFlipHorizontalFill}
                target="flipHorizontal"
                onClick={() => flipHorizontal(currentMatrixKey)}
                tooltip={["Flip horizontally"]}

              ></ToolMainFrame>


              <ToolMainFrame
                Icon={PiFlipVerticalFill}
                target="flipVertical"
                onClick={() => flipVertical(currentMatrixKey)}
                tooltip={["Flip Vertically"]}

              ></ToolMainFrame>


              {
                currentKeyboardKey === "KeyD" ?
                  <ToolMainFrame
                    Icon={BsFillEraserFill}
                    target="erase"
                    onClick={() => dispatch(setToKeyboardKey("KeyNone"))}
                    tooltip={["Erase.", "ShortCut: D"]}
                    classes={"scale-150 text-teal-300 hover:cursor-pointer  outline-green-300 outline-solid outline-1 "}

                  ></ToolMainFrame>
                  :
                  <ToolMainFrame
                    Icon={BsFillEraserFill}
                    target="erase"
                    onClick={() => dispatch(setToKeyboardKey("KeyD"))}
                    tooltip={["Erase.", "ShortCut: D"]}
                    classes={"hover:scale-125 hover:text-teal-200 hover:cursor-pointer  outline-green-300 outline-solid outline-1  text-green-600"}

                  ></ToolMainFrame>

              }

              <ToolMainFrame
                Icon={GrRotateRight}
                target="rotateRight"
                onClick={() => flipOneRight(currentMatrixKey)}
                tooltip={["rotate Right"]}

              ></ToolMainFrame>

              <ToolMainFrame
                Icon={MdKeyboardDoubleArrowRight}
                target="shiftRight"
                onClick={() =>
                  currentKeyboardKey === "ControlLeft" ? shiftMatrixRightNoWrap(currentMatrixKey)
                    : shiftMatrixRight(currentMatrixKey)}
                tooltip={["shift Right","Press `Ctrl` for No Wrap shift"]}

              ></ToolMainFrame>




            </div>

            {/* <Oled128x64 currentMatrix={currentMatrix}
            oledMatrix={oledMatrix}
            setOledMatrix={setOledMatrix}
            
            ></Oled128x64> */}
            {/* <ExampleMatrix></ExampleMatrix> */}
            <EightByEightMain

              dotMatrixDivs={dotMatrixDivs}
              // currentMatrix={currentMatrix}
              isDragging={isDragging}
              setDotMatrixDivs={setDotMatrixDivs}

            ></EightByEightMain>


          </div>
          <div className='flex mt-2'>

          </div>
          <Max7219IC />

          <div className='w-[30%] mt-auto flex font-thin text-[0.5em] justify-evenly text-white'>
            <div className="flex flex-col"><span>V</span><span>C</span><span>C</span></div>
            <div className="flex flex-col"><span>G</span><span>N</span><span>D</span></div>
            <div className="flex flex-col"><span>D</span><span>I</span><span>N</span></div>
            <div className="flex flex-col"><span>C</span><span>S</span><span></span></div>
            <div className="flex flex-col"><span>C</span><span>L</span><span>K</span></div>
          </div>
          <div className='bg-slate-900 w-[30%] h-2  flex justify-evenly '>

            <div className='w-[0.2rem] h-6 bg-gray-400  shadow-sm'></div>
            <div className='w-[0.2rem] h-6 bg-gray-400  shadow-sm'></div>
            <div ref={pinDINRef} className={`w-[0.2rem] h-6 bg-gray-400  shadow-sm pin-din ${dinPinHighlight ? "hovered" : ""} `}></div>
            <div ref={pinCSRef} className={`w-[0.2rem] h-6 bg-gray-400  shadow-sm pin-cs ${csPinHighlight ? "hovered" : ""} `}></div>
            <div ref={pinCLKRef} className={`w-[0.2rem] h-6 bg-gray-400  shadow-sm pin-clk ${clkPinHighlight ? "hovered" : ""} `}></div>
          </div>


        </div>
        <div className='flex flex-col'>
          <form class="max-w-sm mx-auto  bg-[#093710] p-4 relative">

            <select className="block w-full pl-2 border rounded px-2 py-1 rounded-md bg-slate-700 text-white mb-3"
              onChange={handleSelectScreen}
            >
              <option selected value="/">Max 7219</option>
              <option value="/Oled">Olex matrix 128x64</option>

            </select>
            <PinSelector label="DIN Pin : " pinRef={pinDINRef} pinSetter={setPinDIN} pinhighlightSetter={setDinPinHighlight}></PinSelector>
            <PinSelector label="CS Pin : " pinRef={pinCSRef} pinSetter={setPinCS} pinhighlightSetter={setCsPinHighlight}></PinSelector>
            <PinSelector label="CLK Pin : " pinRef={pinCLKRef} pinSetter={setPinCLK} pinhighlightSetter={setClkPinHighlight}></PinSelector>
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
        className="my-14 w-[90%]  rounded-lg outline outline-2 outline-green-700 shadow-2xl shadow-black"
      >
        <button
          onClick={() => {
            navigator.clipboard.writeText(generatedCode)
            setCodeCopied(true)
          }}
          className='transition-transform duration-200 glow-on-hover relative ml-auto flex justify-between items-center hover:scale-125 font-semibold  outline outline-2 outline-green-600 rounded-md m-3 p-2 text-green-300 shadow-lg shadow-[#191919]'>

          {
            codeCopied ?
              <><span>Copied! </span><FaClipboardCheck class="m-1 size-5" /></>

              :
              <><span>Copy Code</span><LuClipboardCopy class="m-1 size-5"></LuClipboardCopy></>
          }

        </button>
        <code>{generatedCode}</code>
      </pre> : <></>}


    </div>

  );

  //return (<Router/>)
}


export default Max7219Page
