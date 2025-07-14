import React from "react";
import FrameDurationInput from "./FrameDurationInput";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { BsPlayFill, BsFillEraserFill } from "react-icons/bs";
import { LuClipboardCopy, LuCopyPlus } from "react-icons/lu";
import VisitorCounter from "./VisitorCounter"
import { TiMediaStop } from "react-icons/ti";
import {
  MdAdd,
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
} from "react-icons/md";

import { PiFlipHorizontalFill, PiFlipVerticalFill } from "react-icons/pi";
import { GrRotateLeft, GrRotateRight } from "react-icons/gr";
import { FaHireAHelper } from "react-icons/fa6";
import { TiArrowUpOutline } from "react-icons/ti";
import { TiArrowDownOutline } from "react-icons/ti";

import { MdDeleteForever } from "react-icons/md";
import { GrHelpBook } from "react-icons/gr";
import { BsExclamationCircle } from "react-icons/bs";

import OledFrame from "./OledFrame";
import Oled128x64 from "./Oled128x64";
import { FaClipboardCheck } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setToKeyboardKey } from "../reducers/currentKeyboardKey";
import { setCurrentMatrixByKey } from "../reducers/currentMatrixSlice";
import generateMostEfficientCppArray from "./CppArrayFunctions";
import {
  generate_oled_template,
  generate_oled_template_SPI,
} from "./generatedCodeTemplates";
import { setToPlaying, setToStopped } from "../reducers/isAnimationPlaying";
import { ToastContainer } from "react-toastify";
import ToolMainFrame from "./ToolMainFrame";
import { MdOutlineHelpCenter } from "react-icons/md";
import { CgScreen } from "react-icons/cg";
import WiringGuide from "./WiringGuide";
import Tool from "./Tool";
import { notifyUser } from "./toastifyFunctions";
import { TbNavigationQuestion } from "react-icons/tb";
import { BsPatchQuestion } from "react-icons/bs";
import { toast } from "react-toastify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import PinSelector from "./PinSelector";
import { useLocation } from "react-router-dom";
import { Tooltip as ReactTooltip } from "react-tooltip";
import AnimateText from "./AnimateText";
import { SiArduino } from "react-icons/si";
import StampPicker from "./StampPicker";
import { FaStamp } from "react-icons/fa6";
import { FaRegPenToSquare } from "react-icons/fa6";

import { TbPencilMinus } from "react-icons/tb";

import { TbPencilPlus } from "react-icons/tb";
import CurrentFrameToolBar from "./CurrentFrameToolBar";
import CoffeeButton from "./CoffeeButton";


function OledPage() {
  const location = useLocation();
  const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value);
  let currentKeyboardKey = useSelector(
    (state) => state.currentKeyboardKey.value
  );
  let isAnimationPlaying = useSelector(
    (state) => state.isAnimationPlaying.value
  );
  const [oledHistory, setOledHistory] = React.useState({}); // { [frameKey]: [matrix, ...] }
  const [copiedFrame, setCopiedFrame] = React.useState(null);

  const [codeCopied, setCodeCopied] = React.useState(false);

  const currentKeyboardKeyRef = React.useRef(currentKeyboardKey);
  React.useEffect(() => {
    currentKeyboardKeyRef.current = currentKeyboardKey;
  }, [currentKeyboardKey]);

  const framesRef = React.useRef([]);

  const [isMouseDown, setIsMouseDown] = React.useState(false);

  const [generatedCode, setGeneratedCode] = React.useState("");
  const repeatInterval = React.useRef(null);

  const [brushSize, setBrushSize] = React.useState(1);
  const [pinDC, setPinDC] = React.useState("none");
  const [pinReset, setPinReset] = React.useState("none");
  const [pinCS, setPinCS] = React.useState("none");
  const [board, setBoard] = React.useState("nano");
  const [oledType, setOledType] = React.useState("I2C");

  const [display, setDisplay] = React.useState("");
  // const [frameDuration, setFrameDuration] = React.useState(200);
  const [isGenerateDisabled, setIsGenerateDisabled] = React.useState(false);
  const [isCodeGenerated, setIsCodeGenerated] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const [isWarningActive, setIsWarningActive] = React.useState(() => {
    // getting stored value
    const saved = localStorage.getItem("warnActive");
    const initialValue = JSON.parse(saved);
    return initialValue || "";
  });

  const currentMatrixKeyRef = React.useRef(currentMatrixKey);
  React.useEffect(() => {
    currentMatrixKeyRef.current = currentMatrixKey;
  }, [currentMatrixKey]);

  const currentAnimationPlayingRef = React.useRef(isAnimationPlaying);
  React.useEffect(() => {
    currentAnimationPlayingRef.current = isAnimationPlaying;
  }, [isAnimationPlaying]);

  function handleBoardChange(event) {
    console.log(event);
    setBoard(event.target.value);
  }
  let frameDuration = useSelector((state) => state.frameDuration.value);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const WIDTH = 128;
  const HEIGHT = 64;

  const newMatrix = {
    key: 0,
    matrix: [
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
    ],
  };

  const [oledMatrix, setOledMatrix] = React.useState([
    {
      key: currentMatrixKey,
      matrix: Array.from({ length: 64 }, () => Array(128).fill(false)),
    },
  ]);

  const oledMatrixCurrentRef = React.useRef(oledMatrix);

  React.useEffect(() => {
    oledMatrixCurrentRef.current = oledMatrix;
  }, [oledMatrix]);


  React.useEffect(() => {
    setDisplay(location.pathname);

    let cs = localStorage.getItem("CS");
    let dc = localStorage.getItem("DC");
    let reset = localStorage.getItem("Reset");

    if (cs) setPinCS(cs);
    if (dc) setPinDC(dc);
    if (reset) setPinReset(reset);
  }, []);

  React.useEffect(() => {
    // Global mouseup listener to reset dragging state

    currentKeyboardKeyRef.current = currentKeyboardKey;
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseDown = () => {
      setIsDragging(true);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    const handleKeyDown = (event) => {
      dispatch(setToKeyboardKey(event.code));
    };

    const handleKeyUp = (event) => {
      dispatch(setToKeyboardKey("KeyNone"));
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      // Cleanup listener on unmount
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousedown", handleKeyUp);
    };
  }, []);

  function deleteFrame() {
    const oled = oledMatrixCurrentRef.current;
    if (oled.length <= 1) return;

    const filteredMatrix = oled.filter(
      (matrix) => matrix.key !== currentMatrixKeyRef.current
    );
    if (filteredMatrix.length > 0) {
      dispatch(
        setCurrentMatrixByKey(filteredMatrix[filteredMatrix.length - 1].key)
      );
    }
    setOledMatrix(filteredMatrix);
  }
  // Updated history function to store complete frame state
  function pushHistory(frameKey, matrix, outerMatrix = undefined) {
    setOledHistory((prev) => {
      const prevArr = prev[frameKey] || [];
      const newEntry = {
        matrix: structuredClone(matrix),
        outerMatrix: outerMatrix ? structuredClone(outerMatrix) : undefined,
        timestamp: Date.now()
      };
      
      // Only push if different from last entry
      if (prevArr.length > 0) {
        const lastEntry = prevArr[prevArr.length - 1];
        if (JSON.stringify(lastEntry.matrix) === JSON.stringify(matrix)) {
          return prev;
        }
      }
      
      return {
        ...prev,
        [frameKey]: [...prevArr, newEntry].slice(-50), // limit to 50
      };
    });
  }

  // Updated undo function to restore complete frame state
  React.useEffect(() => {
    const handleUndo = (e) => {
      if (e.ctrlKey && e.key === "z") {
        setOledHistory((prev) => {
          const arr = prev[currentMatrixKey] || [];
          if (arr.length < 2) return prev;
          
          const newArr = arr.slice(0, -1);
          const prevEntry = newArr[newArr.length - 1];
          
          setOledMatrix((matrices) =>
            matrices.map((frame) => {
              if (frame.key !== currentMatrixKey) return frame;
              
              return {
                ...frame,
                matrix: structuredClone(prevEntry.matrix),
                outerMatrix: prevEntry.outerMatrix ? structuredClone(prevEntry.outerMatrix) : undefined
              };
            })
          );
          
          return { ...prev, [currentMatrixKey]: newArr };
        });
      }
    };
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, [currentMatrixKey]);

  const OUTER_SIZE = 128;
  const DISPLAY_WIDTH = 128;
  const DISPLAY_HEIGHT = 64;

  /**
   * Ensures a 128x128 outer matrix with the original content centered.
   */


  /**
   * Clips a 128x128 matrix back to the central 128x64 area.
   */
  React.useEffect(() => {
    const handleUndo = (e) => {
      if (e.ctrlKey && e.key === "z") {
        setOledHistory((prev) => {
          const arr = prev[currentMatrixKey] || [];
          if (arr.length < 2) return prev; // nothing to undo
          const newArr = arr.slice(0, -1);
          const prevMatrix = newArr[newArr.length - 1];
          
          setOledMatrix((matrices) =>
            matrices.map((frame) => {
              if (frame.key !== currentMatrixKey) return frame;
              
              return {
                ...frame, 
                matrix: structuredClone(prevMatrix),
                // Keep outerMatrix on undo - this preserves rotation data
                // outerMatrix: undefined // Remove this line
              };
            })
          );
          return { ...prev, [currentMatrixKey]: newArr };
        });
      }
    };
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, [currentMatrixKey]);

  React.useEffect(() => {
    const handleCopyPaste = (e) => {
      // Ctrl+C: Copy current frame
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        const frame = oledMatrix.find((f) => f.key === currentMatrixKey);
        if (frame) {
          setCopiedFrame(structuredClone(frame.matrix));
        }
      }
      // Ctrl+V: Paste as new frame
      if (e.ctrlKey && e.key.toLowerCase() === "v") {
        if (copiedFrame) {
          const newMat = {
            key: generateId(),
            matrix: structuredClone(copiedFrame),
          };
          setOledMatrix((prev) => [...prev, newMat]);
          dispatch(setCurrentMatrixByKey(newMat.key));
        }
      }
    };
    window.addEventListener("keydown", handleCopyPaste);
    return () => window.removeEventListener("keydown", handleCopyPaste);
  }, [oledMatrix, currentMatrixKey, copiedFrame, dispatch]);

  /**
   * Rotates the outer matrix 90° to the left.
   */
  function Duplicate(matrixToDuplicate) {
    let currMatrixIndex = matrixToDuplicate.findIndex(
      (matrix) => matrix.key == currentMatrixKey
    ); //dotMatrixDivs
    if (currMatrixIndex === -1) {
      console.error("Matrix not found!");
      return;
    }

    let newMatrix = {
      key: oledMatrix.length + 1,
      matrix: oledMatrix[currMatrixIndex].matrix.map((row) => [...row]),
    };
    setOledMatrix((prev) => {
      let newState = [...prev];
      newState.splice(currMatrixIndex + 1, 0, newMatrix);

      return newState;
    });

    dispatch(setCurrentMatrixByKey(newMatrix.key));
  }

  function startAnimation() {
    //setIsAnimating(true);
    if (currentAnimationPlayingRef.current) return stopAnimation();
    dispatch(setToPlaying());
    repeatFunction(
      (key) => dispatch(setCurrentMatrixByKey(key)),
      frameDuration,
      oledMatrixCurrentRef.current.length
    );
  }
  function repeatFunction(func, delay, repeat) {
    const oled = oledMatrixCurrentRef.current;
    console.log(oled);
    console.log(repeat);
    console.log(delay);
    func(oled[0].key); //dotMatrixDivs
    let counter = 1;

    repeatInterval.current = setInterval(() => {
      if (repeat !== counter) {
        func(oled[counter].key); //dotMatrixDivs
        counter++;
      } else {
        // setIsAnimating(false);
        dispatch(setToStopped());
        clearInterval(repeatInterval.current);
      }
    }, parseInt(delay));
  }
  function handleSelectScreen(e) {
    const value = e.target.value;
    if (!value) return;

    navigate(value);
  }

  function stopAnimation() {
    if (repeatInterval.current) {
      clearInterval(repeatInterval.current);
      repeatInterval.current = null;
      dispatch(setCurrentMatrixByKey(oledMatrixCurrentRef.current[0].key));
      // setIsAnimating(false);
      dispatch(setToStopped());
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



  function generateCode() {
    let list_of_frames = oledMatrix.map((frame, index) =>
      generateMostEfficientCppArray(frame.matrix, index)
    );

    if (oledType === "I2C") {
      setGeneratedCode(generate_oled_template(list_of_frames, frameDuration));
    }
    if (oledType === "SPI") {
      setGeneratedCode(
        generate_oled_template_SPI(
          list_of_frames,
          frameDuration,
          pinCS,
          pinReset,
          pinDC
        )
      );
    }
    //setGeneratedCode(generate_oled_template(list_of_frames, frameDuration))
    setIsCodeGenerated(true);
    setCodeCopied(false);
    notifyUser("Code Generation Sucessful!", toast.success);
  }
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  function addFrame() {
    const newMat = {
      // key: dotMatrixDivs.length + 1,
      key: generateId(),
      matrix: Array.from({ length: 64 }, () => Array(128).fill(false)),
    };
    setOledMatrix((prev) => [...prev, newMat]);

    // setCurrentMatrix(newMat.key)
    dispatch(setCurrentMatrixByKey(newMat.key));
  }

  React.useEffect(() => {
    // Ensure every frame has at least one history entry
    oledMatrix.forEach((frame) => {
      setOledHistory((prev) => {
        const arr = prev[frame.key] || [];
        if (arr.length === 0) {
          return {
            ...prev,
            [frame.key]: [structuredClone(frame.matrix)],
          };
        }
        return prev;
      });
    });
  }, [oledMatrix]);

  function clearFrame() {
    setOledMatrix((prev) => {
      const newMatrix = prev.map((frame) =>
        frame.key === currentMatrixKey
          ? {
            ...frame,
            matrix: Array.from({ length: 64 }, () => Array(128).fill(false)),
          }
          : frame
      );
      // Push to history after clearing
      pushHistory(
        currentMatrixKey,
        newMatrix.find((f) => f.key === currentMatrixKey).matrix
      );
      return newMatrix;
    });
  }

  function generateCodeOneFrame() {
    let rMatrices = flipAll(oledMatrix);
    //console.log(rMatrices.map(matrix=>matrix.dotmatrix))
    // let stringMatrices = JSON.stringify(rMatrices.map(matrix=>matrix.dotmatrix))
    let frame =
      rMatrices[
        rMatrices.findIndex((matrix) => matrix.key === currentMatrixKey)
      ].dotmatrix;
    let dotMatrixString = JSON.stringify(frame);
    let dotMatrixFormatted = dotMatrixString.replace(/[\[\]]/g, (match) =>
      match === "[" ? "{" : "}"
    );
    console.log(`const bool frame[8][8] = ${dotMatrixFormatted}`);

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
}`);
    setIsCodeGenerated(true);
  }
  const [stampSymbol, setStampSymbol] = React.useState(null);
  return (
    <div className="theme-blue w-screen text-center flex justify-center flex-col items-center ">
      <VisitorCounter></VisitorCounter>
      <ToastContainer />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          direction="horizontal"
          droppableId="oledMatrix"
          type="MATRIX"
        >
          {(provided) => (
            <div
              className=" shadow-2xl  py-3 max-500:w-[85%]  md:min-w-[80%]  lg:min-w-[70%] rounded-md  bg-gray-800 max-500:max-h-[200px] max-h-[170px] overflow-y-hidden gap-2 m-5 px-3  max-w-[90%]  scroll-content  relative"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className=" max-500:grid max-500:justify-center w-full flex flex-wrap justify-between max-sm:grid max-sm: ">
                <div className="flex gap-x-4 max-500:justify-center  ">
                  <Tool
                    Icon={MdAdd}
                    target="add"
                    onClick={addFrame}
                    tooltip={["Add Frame"]}
                  ></Tool>

                  {isAnimationPlaying ? (
                    <Tool
                      Icon={TiMediaStop}
                      target="stop"
                      onClick={stopAnimation}
                      tooltip={["Stop Animation"]}
                      classes={
                        "scale-110 hover:bg-red-600 hover:text-red-200 ring-2 ring-offset-2 ring-[#ff0000] text-[#ff0000]"
                      }
                    // shortCutKey="Space"
                    ></Tool>
                  ) : (
                    <Tool
                      Icon={BsPlayFill}
                      target="play"
                      onClick={startAnimation}
                      tooltip={["Play"]}
                      shortCutKey="Space"
                    ></Tool>
                  )}

                  <Tool
                    Icon={LuCopyPlus}
                    target="duplicate"
                    onClick={() => Duplicate(oledMatrix)}
                    tooltip={["Duplicate Frame", "ctrl + c, ctrl + v"]}
                  ></Tool>

                  <Tool
                    Icon={CgScreen}
                    target="clear"
                    onClick={clearFrame}
                    tooltip={["Clear Frame"]}
                  ></Tool>

                  <Tool
                    Icon={MdDeleteForever}
                    target="delete"
                    onClick={deleteFrame}
                    tooltip={["Delete Frame"]}
                    classes={" hover:text-red-200 rounded-full  text-red-600"}
                    shortCutKey="Delete"
                  ></Tool>
                </div>

                <div className="flex flex-wrap max-500:mt-3 ">
                  <FrameDurationInput></FrameDurationInput>
                </div>
              </div>

              <div className=" mt-3  bg-gray-900 rounded-md pb-3 overflow-x-auto pt-2 px-3 ">
                <div
                  className="flex "
                  onMouseDown={(e) => e.preventDefault()}
                  draggable="false"
                >
                  {
                    //8x8 frames

                    oledMatrix.map((matrix, index) => (
                      <Draggable
                        key={matrix.key}
                        draggableId={String(matrix.key)}
                        index={index}
                      >
                        {(provided) => (
                          <>
                            <OledFrame
                              currentMatrix={currentMatrixKey}
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
                        )}
                      </Draggable>
                    ))
                  }
                </div>
              </div>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex shadow-2xl  max-420:w-[95%] max-650:w-[80%]  max-650:grid bg-gray-800  rounded-lg pb-3 ">
        <div
          className=" relative 
      shadow-sm  w-[25em]   max-h-[40em] max-600:w-[19em] flex flex-col items-center justify-center  py-10 justify-self-center "
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
        >
          <div
            className="   bg-gray-900 p-3 shadow-md drop-shadow-sm shadow-slate-900 "
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}
          >

            <CurrentFrameToolBar
              setStampSymbol={setStampSymbol}
              setOledMatrix={setOledMatrix}
              oledMatrix={oledMatrix}
              setBrushSize={setBrushSize}
              pushHistory={pushHistory}  // Add this line
            />

            <Oled128x64
              oledMatrix={oledMatrix}
              setOledMatrix={setOledMatrix}
              brushSize={brushSize}
              onStrokeEnd={(matrix) => pushHistory(currentMatrixKey, matrix)}
              stampSymbol={stampSymbol}
            ></Oled128x64>
          </div>
        </div>
        <div className="flex flex-col ">
          <form className="max-w-sm mx-auto  p-4 relative max-500:m-0">
            <div className="flex justify-end space-x-2 pb-2  items-center">
              <div
                data-tooltip-id="tooltip_shortcuts"
                data-tooltip-place="top"
                className="flex text-[0.8em] font-bold p-1 text-iconColor items-center space-x-1 bg-slate-900 rounded-md outline outline-slate-700 cursor-pointer"
              >
                <div>Shortcuts</div>
                <BsPatchQuestion className="size-5 text-pink-700" />
              </div>

              <WiringGuide></WiringGuide>

              {isWarningActive ? (
                <BsExclamationCircle
                  onMouseEnter={() => {
                    localStorage.setItem("warnActive", false);
                    setIsWarningActive(false);
                  }}
                  data-tooltip-id="tooltip_warning"
                  className="animate-pulse text-yellow-400  size-5 "
                />
              ) : (
                <BsExclamationCircle
                  data-tooltip-id="tooltip_warning"
                  className="  text-slate-600  size-5 "
                />
              )}
            </div>

            <select
              className=" block w-full pl-2 border border-transparent px-2 py-1 rounded-md bg-slate-700 text-iconColor mb-3 
             outline-none focus:outline-none ring-0 focus:ring-0 focus:border-transparent focus:shadow-none"
              onChange={handleSelectScreen}
              value={display}
            >
              <option value="/max">Max 7219</option>
              <option value="/Oled">Oled matrix 128x64</option>
            </select>
            <select
              className=" block w-full pl-2 border border-transparent px-2 py-1 rounded-md bg-slate-700 text-iconColor mb-3 
             outline-none focus:outline-none ring-0 focus:ring-0 focus:border-transparent focus:shadow-none"
              onChange={(e) => setOledType(e.target.value)}
              value={oledType}
            >
              <option value="I2C">Type: I2C</option>
              <option value="SPI">Type: SPI</option>
            </select>

            {oledType === "SPI" && (
              <>
                <select
                  className=" block w-full pl-2 border border-transparent px-2 py-1 rounded-md bg-slate-700 text-iconColor mb-3 
             outline-none focus:outline-none ring-0 focus:ring-0 focus:border-transparent focus:shadow-none"
                  onChange={handleBoardChange}
                >
                  <option selected>Pick a Board</option>
                  <option value="nano">Nano/Uno</option>
                  <option value="mega">Mega</option>
                  <option value="micro">Leonardo/micro</option>
                  <option value="every">Every</option>
                </select>

                <div className="flex max-500:grid max-750:grid gap-1 w-full ">
                  <PinSelector
                    board={board}
                    label="CS"
                    pinSetter={setPinCS}
                  ></PinSelector>
                  <PinSelector
                    board={board}
                    label="Reset"
                    pinSetter={setPinReset}
                  ></PinSelector>
                  <PinSelector
                    board={board}
                    label="DC"
                    pinSetter={setPinDC}
                  ></PinSelector>
                </div>
              </>
            )}
            {/* <PinSelector label="DIN Pin : " pinRef={pinDINRef} pinSetter={setPinDIN} pinhighlightSetter={setDinPinHighlight}></PinSelector>
            <PinSelector label="CS Pin : " pinRef={pinCSRef} pinSetter={setPinCS} pinhighlightSetter={setCsPinHighlight}></PinSelector>
            <PinSelector label="CLK Pin : " pinRef={pinCLKRef} pinSetter={setPinCLK} pinhighlightSetter={setClkPinHighlight}></PinSelector> */}

            <div
              type="button" //Needed to prevent form page refresh
              className={
                isGenerateDisabled
                  ? "bg-slate-900 text-gray-600 outline outline-gray-600 py-1 px-2 rounded-sm"
                  : "hover:bg-[#33566bbe] hover:text-white bg-slate-900 text-accentText  py-1 px-2 rounded-sm cursor-pointer"
              }
              onClick={isGenerateDisabled ? () => { } : () => generateCode()}
            >
              Generate animation code
            </div>
          </form>
        </div>
      </div>
      <CoffeeButton></CoffeeButton>
      {isCodeGenerated ? (
        <pre
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
            boxSizing: "border-box",
          }}
          className="overflow-x-hidden mt-10 w-[85%]  rounded-lg outline outline-2 outline-iconColor shadow-2xl shadow-black"
        >
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedCode);
              setCodeCopied(true);
            }}
            className=" transition-transform duration-200 glow-on-hover relative ml-auto flex justify-between items-center hover:scale-125 font-semibold  outline outline-2 outline-iconColor rounded-md m-3 p-2 text-iconColor shadow-lg shadow-[#191919]"
          >
            {codeCopied ? (
              <>
                <span>Copied! </span>
                <FaClipboardCheck class="m-1 size-5" />
              </>
            ) : (
              <>
                <span>Copy Code</span>
                <LuClipboardCopy class="m-1 size-5"></LuClipboardCopy>
              </>
            )}
          </button>

          <code>{generatedCode}</code>
        </pre>
      ) : (
        <></>
      )}

      <ReactTooltip
        id="tooltip_shortcuts"
        place="top"
        delayShow={30}
        delayHide={45}
        portal={true}
        style={{ backgroundColor: "#374151" }}
        className="capitalize w-[25em] z-50 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs dark:bg-gray-700"
        content={
          <>
            <div className="flex flex-col space-y-1">
              <span>Copy Frame : Ctrl + C</span>
              <span>Paste Frame: Ctrl + V</span>
              <span>Undo: Ctrl + Z</span>
              <span>Draw Straight Line: Shift</span>
              <span>Draw Horizontal or Vertical Line: Shift + Ctrl</span>
              <span>Erase : D</span>
            </div>
          </>
        }
      ></ReactTooltip>

      <ReactTooltip
        id="tooltip_warning"
        place="top"
        delayShow={30}
        delayHide={45}
        style={{ backgroundColor: "#374151" }}
        portal={true}
        className="capitalize w-[25em] grid capitalize absolute z-10   py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[300ms] bg-gray-900 rounded-lg shadow-xs tooltip dark:bg-gray-700"
        content={
          <>
            <span>Oled Displays have multiple Types.</span>
            <span>If I2C Oled setting fails, try SPI and vice versa</span>
            <span>wiring Depends on the Board and Oled type.</span>
            <span className="text-yellow-400 mt-1">
              {" "}
              for Quick guide, Hover on icon on the left.
            </span>
          </>
        }
      />
    </div>
  );

  //return (<Router/>)
}

export default OledPage;
