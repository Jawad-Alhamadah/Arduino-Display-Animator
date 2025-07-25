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
import { ToastContainer, toast } from 'react-toastify';
import { notifyUser } from "./toastifyFunctions"
import ToolMainFrame from './ToolMainFrame';
import { useNavigate } from 'react-router-dom'
import Tool from "./Tool"
import FrameDurationInput from './FrameDurationInput';
import VisitorCounter from "./VisitorCounter"
import CoffeeButton from './CoffeeButton';
import SEOHead from './SEOHead';

function Max7219Page() {

  let pinCSRef = React.useRef(null)
  let pinCLKRef = React.useRef(null)
  let pinDINRef = React.useRef(null)
  const framesRef = React.useRef([]);
  const timelineRef = React.useRef(null);

  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [generatedCode, setGeneratedCode] = React.useState("");
  const repeatInterval = React.useRef(null);
  const [csPinHighlight, setCsPinHighlight] = React.useState(false);
  const [clkPinHighlight, setClkPinHighlight] = React.useState(false);
  const [dinPinHighlight, setDinPinHighlight] = React.useState(false);
  const [pinCS, setPinCS] = React.useState('none');
  const [pinCLK, setPinCLK] = React.useState('none');
  const [pinDIN, setPinDIN] = React.useState('none');
  let [board, setBoard] = React.useState("")

  const [isGenerateDisabled, setIsGenerateDisabled] = React.useState(true);
  const [isCodeGenerated, setIsCodeGenerated] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [codeCopied, setCodeCopied] = React.useState(false)


  const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value)
  let currentKeyboardKey = useSelector((state) => state.currentKeyboardKey.value)
  let isAnimationPlaying = useSelector((state) => state.isAnimationPlaying.value)
  let frameDuration = useSelector((state) => state.frameDuration.value)
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


  function handleBoardChange(event) {
    setBoard(event.target.value)

  }
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



  React.useEffect(() => {
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

  function flipAll() {
    let reversedMatrix = [[], [], [], [], [], [], [], []];
    let rMatrices = [];
    for (let i = 0; i < dotMatrixDivs.length; i++) {
      for (let j = 0; j < dotMatrixDivs[i].dotmatrix.length; j++) {
        for (let k = 0; k < dotMatrixDivs[i].dotmatrix[j].length; k++) {

          reversedMatrix[k].push(dotMatrixDivs[i].dotmatrix[j][k]);
        }

      }
      rMatrices.push({ key: dotMatrixDivs[i].key, dotmatrix: reversedMatrix });

      reversedMatrix = [[], [], [], [], [], [], [], []];

    }

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
            dotmatrix: [...matrix.dotmatrix].reverse(), 
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
            dotmatrix: matrix.dotmatrix.map((row) => [...row].reverse()), 
          }
          : matrix
      )
    );
  }

  function Duplicate() {
    let currMatrixIndex = dotMatrixDivs.findIndex((matrix) => matrix.key == currentMatrixKey) 
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
    dispatch(setCurrentMatrixByKey(newMatrix.key))
  }

  function addFrame() {

    const newMat = {
      key: generateId(),
      dotmatrix: newMatrix.dotmatrix.map(row => [...row])
    };
    setDotMatrixDivs(prev => [...prev, newMat])
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

  function startAnimation() {
    dispatch(setToPlaying())
    repeatFunction((key) => dispatch(setCurrentMatrixByKey(key)), frameDuration, dotMatrixDivs.length)
  }
  function repeatFunction(func, delay, repeat,) {

    func(dotMatrixDivs[0].key); 
    let counter = 1;

    repeatInterval.current = setInterval(() => {

      if (repeat !== counter) {
        func(dotMatrixDivs[counter].key);
        counter++;
      } else {
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
      dispatch(setToStopped())
    }
  }


  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedDivs = Array.from(dotMatrixDivs); 
    const [removed] = reorderedDivs.splice(source.index, 1);
    reorderedDivs.splice(destination.index, 0, removed);
    setDotMatrixDivs(reorderedDivs);
  };


  function generateCode() {
    if (!validatePins()) {
      return; 
    }

    let rMatrices = flipAll(dotMatrixDivs);
    let dotMatrixString = JSON.stringify(rMatrices.map(matrix => matrix.dotmatrix))
    let dotMatrixFormatted = dotMatrixString.replace(/[\[\]]/g, match => match === "[" ? "{" : "}")

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
}`);
    setIsCodeGenerated(true);
    setCodeCopied(false);
    notifyUser("Code Generation Successful!", toast.success);
  }

  
  function validatePins() {
    const pins = [
      { name: "DIN", value: pinDIN },
      { name: "CS", value: pinCS },
      { name: "CLK", value: pinCLK }
    ];

    // Check for required pins not selected (all pins are required for Max7219)
    const missingPins = pins.filter(pin =>
      !pin.value ||
      pin.value === "Pick a Pin" ||
      pin.value === "none" ||
      pin.value === ""
    );

    if (missingPins.length > 0) {
      const missingNames = missingPins.map(pin => pin.name).join(", ");
      notifyUser(`Please select pins for: ${missingNames}`, toast.warning);
      return false;
    }

 
    const selectedPins = pins.filter(pin =>
      pin.value &&
      pin.value !== "Pick a Pin" &&
      pin.value !== "none" &&
      pin.value !== ""
    );

    const pinValues = selectedPins.map(pin => pin.value);
    const duplicates = pinValues.filter((value, index) => pinValues.indexOf(value) !== index);

    if (duplicates.length > 0) {
      const duplicateNames = selectedPins
        .filter(pin => duplicates.includes(pin.value))
        .map(pin => pin.name)
        .join(", ");
      notifyUser(`Duplicate pins detected: ${duplicateNames} cannot use the same pin`, toast.warning);
      return false;
    }

    return true;
  }

 
  function generateCodeOneFrame() {
    if (!validatePins()) {
      return; 
    }

    let rMatrices = flipAll(dotMatrixDivs);
    let frame = rMatrices[
      rMatrices.findIndex((matrix) => matrix.key === currentMatrixKey)
    ].dotmatrix;
    let dotMatrixString = JSON.stringify(frame);
    let dotMatrixFormatted = dotMatrixString.replace(/[\[\]]/g, (match) =>
      match === "[" ? "{" : "}"
    );

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
    setCodeCopied(false);
    notifyUser("Code Generation Successful!", toast.success);
  }


  React.useEffect(() => {

    const savedDIN = localStorage.getItem("DIN");
    const savedCS = localStorage.getItem("CS");
    const savedCLK = localStorage.getItem("CLK");

    if (savedDIN) setPinDIN(savedDIN);
    if (savedCS) setPinCS(savedCS);
    if (savedCLK) setPinCLK(savedCLK);
  }, []);


  React.useEffect(() => {
    const allPinsSelected = pinCS !== "none" && pinCLK !== "none" && pinDIN !== "none" &&
      pinCS !== "" && pinCLK !== "" && pinDIN !== "" &&
      pinCS !== "Pick a Pin" && pinCLK !== "Pick a Pin" && pinDIN !== "Pick a Pin" &&
      pinCS && pinCLK && pinDIN;

    if (allPinsSelected) {
      setIsGenerateDisabled(false);
    } else {
      setIsGenerateDisabled(true);
    }
  }, [pinDIN, pinCLK, pinCS]);
  return (
    <div className="theme-green w-screen text-center flex justify-center flex-col items-center">
      <SEOHead
        title="MAX7219 8x8 LED Matrix Code Generator - Arduino Screen Converter"
        description="Generate Arduino code for MAX7219 LED matrix displays. Create 8x8 animations and get instant C++ code."
        path="/max7219"
        keywords="Arduino MAX7219, LED matrix, 8x8 display, dot matrix"
      />
      <VisitorCounter></VisitorCounter>
      <ToastContainer />


      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable direction="horizontal" droppableId="dotMatrixDivs" type="MATRIX">
          {(provided) => (
            <div
              className="md:min-w-[30em]  lg:min-w-[50em]  outline-green-800 rounded-md outline-2 outline bg-gray-800 max-500:max-h-[260px] max-h-[160px] overflow-y-hidden gap-2 m-5 p-3 max-w-[90%] overflow-x-auto scroll-content shadow-lg relative"
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


                  <FrameDurationInput></FrameDurationInput>
                </div>
              </div>


              <div className=' mt-3 bg-gray-900 rounded-md pb-3 overflow-x-auto pt-2 px-3 '>


                <div className='flex'
                  onMouseDown={e => e.preventDefault()}
                  draggable="false"
                >

                  {
                   
                    dotMatrixDivs.map((matrix, index) => (
                      <Draggable key={matrix.key} draggableId={String(matrix.key)} index={index}>
                        {(provided) => (<>

                          <EightByEightFrame

                            matrix={matrix}
                            provided={provided}
                            framesRef={framesRef}

                            index={index}

                          ></EightByEightFrame>


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

      <div className='flex shadow-xl shadow-[#1a1a1a] bg-[#093710] max-500:w-[95%] max-750:w-[85%] md:w-[80%] lg:w-[35em] justify-between'>

        <div className=' relative 
      shadow-sm max-sm:w-[85%] w-[70%] lg:w-[25em] max-h-[40em] bg-[#093710] flex flex-col justify-center items-center pt-5'
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
                tooltip={["shift Right", "Press `Ctrl` for No Wrap shift"]}

              ></ToolMainFrame>




            </div>

            <EightByEightMain


              dotMatrixDivs={dotMatrixDivs}

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
        <div className='flex w-[60%] '>
          <form class="w-full  bg-[#093710] p-4 flex flex-col ">

            <select className="block  self-center max-500:w-full w-[90%] border border-transparent  ring-0 focus:ring-0 focus:border-transparent outline-none focus:outline-none justify-self-center pl-2 border rounded px-2 py-1 rounded-md bg-slate-700 text-white mb-3"
              onChange={handleSelectScreen}
            >
              <option selected value="/max">Max 7219</option>
              <option value="/Oled">Olex matrix 128x64</option>

            </select>

            <select className=" block self-center max-500:w-full w-[90%]  border border-transparent ring-0 focus:ring-0 focus:border-transparent outline-none focus:outline-none justify-self-center pl-2 border rounded px-2 py-1 rounded-md bg-slate-700 text-white mb-3"
              onChange={handleBoardChange}
            >

              <option selected

              >Pick a Board</option>
              <option value="nano">Nano/Uno</option>
              <option value="mega">Mega</option>
              <option value="micro">Leonardo/micro</option>
              <option value="every">Every</option>

            </select>
            <div className='flex max-500:grid max-750:grid gap-1 w-full '>

              <PinSelector
                label="DIN"
                pinRef={pinDINRef}
                pinSetter={setPinDIN}
                pinhighlightSetter={setDinPinHighlight}
                value={pinDIN}
                board={board}
              />
              <PinSelector
                label="CS"
                pinRef={pinCSRef}
                pinSetter={setPinCS}
                pinhighlightSetter={setCsPinHighlight}
                value={pinCS}
                board={board}
              />
              <PinSelector
                label="CLK"
                pinRef={pinCLKRef}
                pinSetter={setPinCLK}
                pinhighlightSetter={setClkPinHighlight}
                value={pinCLK}
                board={board}
              />

            </div>

            <div className='flex flex-col mt-auto space-y-1'>
              <div
                type="button"

                className={

                  'bg-slate-900 text-green-600  py-1 px-2 rounded-sm cursor-pointer flex justify-center align-middle items-center'
                }
                onClick={

                  () => generateCode()}>Generate animation

              </div>



            </div>

          </form>
        </div>
      </div>
      <CoffeeButton></CoffeeButton>
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

        {/* {isCodeGenerated && (
          // <SyntaxHighlighter
          //   language="cpp"
          //   style={vscDarkPlus}
          //   customStyle={{
          //     backgroundColor: "#282c34",
          //     borderRadius: "0.5rem",
          //     fontSize: "0.9rem",
          //     padding: "1rem",
          //     marginTop: "2rem",
          //     width: "95%",
          //     textAlign: "left"
          //   }}
          // >
          //   {generatedCode}
          // </SyntaxHighlighter>
          {generatedCode}
        )} */}
        {generatedCode}
      </pre> : <></>}


    </div>

  );


}


export default Max7219Page
