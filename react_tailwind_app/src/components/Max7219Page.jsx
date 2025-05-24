import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { setToFrame } from '../reducers/currentMatrixSlice'
import Max7219IC from './Max7219IC';
// import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";
// import { MdAddCircle } from "react-icons/md";
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import PinSelector from './PinSelector';
// import { PiArrowFatRightDuotone } from "react-icons/pi";
// import { PiArrowFatLeftDuotone } from "react-icons/pi";
import { BsPlayFill } from "react-icons/bs";
import { LuClipboardCopy } from "react-icons/lu";
// import { PiArrowsLeftRightBold } from "react-icons/pi";
import { PiFlipHorizontalFill } from "react-icons/pi";
import { PiFlipVerticalFill } from "react-icons/pi";
// import { TbFlipHorizontal } from "react-icons/tb";
import { RxRotateCounterClockwise } from "react-icons/rx";
import { TiMediaStop } from "react-icons/ti";
// import { AiOutlineAppstoreAdd } from "react-icons/ai";
import { MdAdd } from "react-icons/md";
import { LuCopy } from "react-icons/lu";
import EightByEightFrame from './EightByEightFrame';
import EightByEightMain from './EightByEightMain';
import { GrRotateLeft } from "react-icons/gr";
import { GrRotateRight } from "react-icons/gr";
import { LuCopyPlus } from "react-icons/lu";
import { MdDeleteForever } from "react-icons/md";
// import ExampleMatrix from './components/ExampleMatrix';

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
  const [frameDuration, setFrameDuration] = React.useState(200);
  const [isGenerateDisabled, setIsGenerateDisabled] = React.useState(true);
  const [isCodeGenerated, setIsCodeGenerated] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const WIDTH = 128;
  const HEIGHT = 64;
  // const [currentMatrix, setCurrentMatrix] = React.useState(1);

  const currentMatrix = useSelector((state) => state.currentMatrix.value)
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
        key: 1, dotmatrix: Array.from({ length: 8 }, () => Array(8).fill(false))
      },

    ]
  )
  console.log(dotMatrixDivs)

  const [oledMatrix, setOledMatrix] = React.useState(
    [
      {
        key: 1, oledmatrix: Array.from({ length: 64 }, () => Array(128).fill(false))
      },

    ]
  )

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

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);


  let [test, setTest] = React.useState(0);


  React.useEffect(() => {
    console.log("re")
    console.log(pinCS)
    console.log(pinCLK)
    console.log(pinDIN)
    if (pinCS != "none" && pinCLK != "none" && pinDIN != "none") {
      console.log("inside")
      setIsGenerateDisabled(false)
    }
    else {
      setIsGenerateDisabled(true)
    }
  }, [pinDIN, pinCLK, pinCS])


  function flipAll() {
    let reversedMatrix = [[], [], [], [], [], [], [], []];
    let rMatrices = [];
    for (let i = 0; i < dotMatrixDivs.length; i++) {
      for (let j = 0; j < dotMatrixDivs[i].dotmatrix.length; j++) {
        for (let k = 0; k < dotMatrixDivs[i].dotmatrix[j].length; k++) {
          // console.log(dotMatrixDivs[i].dotmatrix[j])
          reversedMatrix[k].push(dotMatrixDivs[i].dotmatrix[j][k]);
          console.log(dotMatrixDivs[i].dotmatrix[j].length);
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
      prevDivs.map((div) =>
        div.key === key
          ? {
            ...div,
            dotmatrix: [...div.dotmatrix].reverse(), // Reverse row order (top ↔ bottom)
          }
          : div
      )
    );
  }

  function flipHorizontal(key) {
    setDotMatrixDivs((prevDivs) =>
      prevDivs.map((div) =>
        div.key === key
          ? {
            ...div,
            dotmatrix: div.dotmatrix.map((row) => [...row].reverse()), // Reverse each row (left ↔ right)
          }
          : div
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
    let currMatrixIndex = dotMatrixDivs.findIndex((matrix) => matrix.key == currentMatrix) //dotMatrixDivs
    if (currMatrixIndex === -1) {
      console.error("Matrix not found!");
      return;
    }

    console.log(currMatrixIndex)
    let newMatrix = {
      key: dotMatrixDivs.length + 1,
      dotmatrix: dotMatrixDivs[currMatrixIndex].dotmatrix.map(row => [...row])
    }
    setDotMatrixDivs(prev => {
      let newState = [...prev];
      newState.splice(currMatrixIndex + 1, 0, newMatrix)
      console.log(newState)
      return newState
    })
    //setCurrentMatrix(newMatrix.key)
    dispatch(setToFrame(newMatrix.key))
  }

  function addFrame() {

    const newMat = {
      key: dotMatrixDivs.length + 1,
      dotmatrix: newMatrix.dotmatrix.map(row => [...row])
    };
    setDotMatrixDivs(prev => [...prev, newMat])

    // setCurrentMatrix(newMat.key)
    dispatch(setToFrame(newMat.key))

  }

  function deleteFrame(){
    let filteredMatrix = dotMatrixDivs.filter(matrix => matrix.key!==currentMatrix)

    setDotMatrixDivs(filteredMatrix)
    
    dispatch(setToFrame(filteredMatrix[filteredMatrix.length-1].key))
    
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

  function repeatFunction(func, delay, repeat,) {
    setIsAnimating(true);
    func(dotMatrixDivs[0].key); //dotMatrixDivs
    let counter = 1;

    repeatInterval.current = setInterval(() => {

      if (repeat !== counter) {
        func(dotMatrixDivs[counter].key);//dotMatrixDivs
        counter++;
      } else {
        setIsAnimating(false);
        clearInterval(repeatInterval.current)
      }
    }, delay);

  }

  function stopRepeat() {
    if (repeatInterval.current) {
      clearInterval(repeatInterval.current);
      repeatInterval.current = null;
      // setCurrentMatrix(dotMatrixDivs[0].key)
      dispatch(setToFrame(dotMatrixDivs[0].key))
      setIsAnimating(false);
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


  React.useEffect(() => {


    if (!timelineRef.current) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        console.log("checking...")
        console.log(framesRef)
        console.log(timelineRef.current)
        if (entry.isIntersecting) {

          // When intersecting, update the active frame state
          // setActiveFrame(entry.target.getAttribute('data-frame'));
          // console.log("jh")
          // Check if the intersecting frame also intersects with timelineRef
          const frameRect = entry.target.getBoundingClientRect();
          const timelineRect = timelineRef.current.getBoundingClientRect();

          if (
            frameRect.left < timelineRect.right &&
            frameRect.right > timelineRect.left &&
            frameRect.top < timelineRect.bottom &&
            frameRect.bottom > timelineRect.top
          ) {
            console.log("Timeline is touching frame:", entry.target.getAttribute('data-frame'));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      threshold: 0.01,
    });

    // Observe each frame element
    framesRef.current.forEach((frame) => observer.observe(frame));

    return () => observer.disconnect(); // Cleanup on component unmount
  }, [test]);

  function generateCode() {

    let rMatrices = flipAll(dotMatrixDivs);
    //console.log(rMatrices.map(matrix=>matrix.dotmatrix))
    // let stringMatrices = JSON.stringify(rMatrices.map(matrix=>matrix.dotmatrix))
    let dotMatrixString = JSON.stringify(rMatrices.map(matrix => matrix.dotmatrix))
    let dotMatrixFormatted = dotMatrixString.replace(/[\[\]]/g, match => match === "[" ? "{" : "}")
    console.log(`const bool frames[numFrames][8][8] = ${dotMatrixFormatted}`)

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
  }

  function generateCodeOneFrame() {

    let rMatrices = flipAll(dotMatrixDivs);
    //console.log(rMatrices.map(matrix=>matrix.dotmatrix))
    // let stringMatrices = JSON.stringify(rMatrices.map(matrix=>matrix.dotmatrix))
    let frame = rMatrices[rMatrices.findIndex(matrix => matrix.key === currentMatrix)].dotmatrix
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

      {/* <DragDropContext onDragEnd={onDragEnd}>
        <Droppable direction="horizontal" droppableId="dotMatrixDivs" type="MATRIX">
          {(provided) => (
            <div
              className="md:min-w-[30em]  lg:min-w-[50em]  outline-green-800 rounded-md outline-2 outline bg-gray-800 max-h-[160px] overflow-y-hidden gap-2 m-5 p-3 max-w-[90%] overflow-x-auto scroll-content shadow-lg relative"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className='flex flex-wrap justify-between'>
                <div className='flex space-x-3'>
                  <MdAdd
                    className='bg-slate-900 cursor-pointer hover:bg-green-600 hover:text-green-200 size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500'
                    onClick={() => {
                      const newMat = {
                        key: dotMatrixDivs.length + 1,
                        dotmatrix: newMatrix.dotmatrix.map(row => [...row])
                      };
                      setDotMatrixDivs(prev => [...prev, newMat])
                      setCurrentMatrix(newMat.key)
                    }} 

                    
                    
                    />

                  <TiMediaStop className='bg-slate-900  hover:bg-green-600 hover:text-green-200 cursor-pointer  size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500' onClick={() => stopRepeat()}>stop</TiMediaStop >
                  <BsPlayFill className='bg-slate-900 hover:bg-green-600 hover:text-green-200 cursor-pointer   size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500'
                    onClick={() => repeatFunction(setCurrentMatrix, frameDuration, dotMatrixDivs.length)}
                  />
                  <LuCopy
                    onClick={() => {
                      let currMatrixIndex = dotMatrixDivs.findIndex((matrix) => matrix.key == currentMatrix)
                      if (currMatrixIndex === -1) {
                        console.error("Matrix not found!");
                        return;
                      }

                      console.log(currMatrixIndex)
                      let newMatrix = {
                        key: dotMatrixDivs.length + 1,
                        dotmatrix: dotMatrixDivs[currMatrixIndex].dotmatrix.map(row => [...row])
                      }
                      setDotMatrixDivs(prev => {
                        let newState = [...prev];
                        newState.splice(currMatrixIndex, 0, newMatrix)
                        console.log(newState)
                        return newState
                      })

                    }}
                    className='bg-slate-900  hover:bg-green-600 hover:text-green-200 cursor-pointer  size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500' />
                </div>

                <div className='flex flex-wrap'>
                  <RxRotateCounterClockwise className='hover:text-teal-200 hover:cursor-pointer mx-2 size-5 rounded-full  text-green-500' onClick={() => flipOneLeft(currentMatrix)}>Flip left</RxRotateCounterClockwise>
                  <RxRotateCounterClockwise className='hover:text-teal-200 hover:cursor-pointer mx-2 transform scale-x-[-1] size-5 rounded-full  text-green-400' onClick={() => flipOneRight(currentMatrix)}>Flip right</RxRotateCounterClockwise>
                  <PiFlipHorizontalFill className='hover:text-teal-200 hover:cursor-pointer mx-2  size-5 rounded-full  text-green-500' onClick={() => flipHorizontal(currentMatrix)}>Flip vert</PiFlipHorizontalFill>
                  <PiFlipVerticalFill className='hover:text-teal-200 hover:cursor-pointer mx-2  size-5 rounded-full  text-green-500' onClick={() => flipVertical(currentMatrix)}>Flip horx</PiFlipVerticalFill   >
                  <div className='flex w-[15em] bg-slate-800 rounded-sm text-green-500 '>

                    <span className='text-[0.8em] px-1'>Frame duration </span>
                    <input
                      onChange={(e) => {
                        setFrameDuration(e.target.value);
                      }}
                      maxLength={8}
                      value={frameDuration}
                      className="rounded-md  outline outline-1 outline-green-700 w-[35%] bg-slate-900  "></input>

                    <span className='text-[0.8em] px-1'>ms </span>

                  </div>
                </div>
              </div>


              <div className=' mt-3  bg-gray-900 rounded-md'>
             

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
                          currentMatrix={currentMatrix}
                          setCurrentMatrix={setCurrentMatrix}
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

      </DragDropContext> */}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable direction="horizontal" droppableId="dotMatrixDivs" type="MATRIX">
          {(provided) => (
            <div
              className="md:min-w-[30em]  lg:min-w-[50em]  outline-green-800 rounded-md outline-2 outline bg-gray-800 max-h-[160px] overflow-y-hidden gap-2 m-5 p-3 max-w-[90%] overflow-x-auto scroll-content shadow-lg relative"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className='flex flex-wrap justify-between'>
                <div className='flex space-x-2'>

              <div id="tooltip-duplicate" role="tooltip" className="capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[1400ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
               Duplicate Frame
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div id="tooltip-play" role="tooltip" className="capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[1400ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                Play
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div id="tooltip-add" role="tooltip" className="capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[1400ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                Add Frame
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

           

                  <MdAdd
                  data-tooltip-target="tooltip-add"
                    className='hover:scale-125 cursor-pointer  hover:text-green-200 size-6 rounded-full  text-green-500'
                    onClick={addFrame}
                  // onClick={() => {
                  //   const newMat = {
                  //     key: oledMatrix.length + 1,
                  //     oledmatrix: Array.from({ length: 64 }, () => Array(128).fill(false))
                  //   };
                  //   setOledMatrix(prev => [...prev, newMat])
                  //   setCurrentMatrix(newMat.key)
                  // }}
                  />

                  {

                    isAnimating ?

                      <TiMediaStop className=' scale-110   hover:bg-red-600 hover:text-red-200 cursor-pointer  size-6 rounded-full outline outline-offset-2 outline-2 outline-[#ff0000] text-[#ff0000]' onClick={() => stopRepeat()}>stop</TiMediaStop >
                      :
                      <BsPlayFill 
                      data-tooltip-target="tooltip-play"
                      className='hover:scale-125   hover:text-green-200 cursor-pointer   size-6 rounded-full  text-green-500'
                        // onClick={() => repeatFunction(setCurrentMatrix, frameDuration, dotMatrixDivs.length)}
                        onClick={() => repeatFunction((key) => dispatch(setToFrame(key)), frameDuration, dotMatrixDivs.length)}

                      />
                  }

                  {/* <BsPlayFill className='bg-slate-900 hover:bg-green-600 hover:text-green-200 cursor-pointer   size-5 rounded-full outline outline-offset-2 outline-2 outline-green-500 text-green-500'
                    onClick={() => repeatFunction(setCurrentMatrix, frameDuration, oledMatrix.length)}
                  /> */}

                    {/* <MdDeleteForever className='hover:scale-125 cursor-pointer  hover:text-green-200 size-6 rounded-full  text-green-500' 
                    onClick={deleteFrame}
                    ></MdDeleteForever> */}
                  <LuCopyPlus
                    onClick={() => Duplicate()}
                    data-tooltip-target="tooltip-duplicate"
                    className='hover:scale-125  hover:text-green-200 cursor-pointer  size-6  text-green-500' />
                </div>

                <div className='flex flex-wrap'>
                  {/* <RxRotateCounterClockwise className='hover:text-teal-200 hover:cursor-pointer mx-2 size-5 rounded-full  text-green-500' onClick={() => flipOneLeft(currentMatrix)}>Flip left</RxRotateCounterClockwise>
                  <RxRotateCounterClockwise className='hover:text-teal-200 hover:cursor-pointer mx-2 transform scale-x-[-1] size-5 rounded-full  text-green-400' onClick={() => flipOneRight(currentMatrix)}>Flip right</RxRotateCounterClockwise>
                  <PiFlipHorizontalFill className='hover:text-teal-200 hover:cursor-pointer mx-2  size-5 rounded-full  text-green-500' onClick={() => flipHorizontal(currentMatrix)}>Flip vert</PiFlipHorizontalFill>
                  <PiFlipVerticalFill className='hover:text-teal-200 hover:cursor-pointer mx-2  size-5 rounded-full  text-green-500' onClick={() => flipVertical(currentMatrix)}>Flip horx</PiFlipVerticalFill   > */}
                  <div className='flex w-[15em] bg-slate-800 rounded-sm text-green-500 '>

                    <span className='text-[0.8em] px-1'>Frame duration </span>
                    <input
                      onChange={(e) => {
                        setFrameDuration(e.target.value);
                      }}
                      maxLength={8}
                      value={frameDuration}
                      className="rounded-md  outline outline-1 outline-green-700 w-[35%] bg-slate-900  "></input>

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


            <div className='flex justify-between'>

              <div id="tooltip-rotateLeft" role="tooltip" className="capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[1400ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                rotate left
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div id="tooltip-flipVertical" role="tooltip" className="capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[1400ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                Flip vertically
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div id="tooltip-flipHorizontal" role="tooltip" className="capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[1400ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                Flip horizontally
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <div id="tooltip-rotateRight" role="tooltip" className="capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[1400ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                Rotate right
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
              <GrRotateLeft data-tooltip-target="tooltip-rotateLeft" className='hover:scale-125 hover:text-teal-200 rounded-full  text-green-600 hover:cursor-pointer' onClick={() => flipOneLeft(currentMatrix)} />
              <PiFlipHorizontalFill data-tooltip-target="tooltip-flipVertical" className='hover:scale-125 hover:text-teal-200 hover:cursor-pointer  outline-green-300 outline-solid outline-1 mx-2 text-green-600' onClick={() => flipHorizontal(currentMatrix)}>Flip vert</PiFlipHorizontalFill>
              <PiFlipVerticalFill data-tooltip-target="tooltip-flipHorizontal" className='hover:scale-125 hover:text-teal-200 hover:cursor-pointer  outline-green-300 outline-solid outline-1  mx-2 text-green-600' onClick={() => flipVertical(currentMatrix)}>Flip horx</PiFlipVerticalFill   >
              <GrRotateRight data-tooltip-target="tooltip-rotateRight" className='hover:scale-125 hover:text-teal-200  text-green-600 hover:cursor-pointer' onClick={() => flipOneRight(currentMatrix)} />


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
            {/* <RxRotateCounterClockwise className=' outline-green-300 outline-solid outline-1 hover:text-teal-200 hover:cursor-pointer mx-2 size-5   text-green-500' onClick={() => flipOneLeft(currentMatrix)}>Flip left</RxRotateCounterClockwise> */}


            {/* <RxRotateCounterClockwise className=' outline-green-300 outline- outline-1 hover:text-teal-200 hover:cursor-pointer mx-2 transform scale-x-[-1] size-5   text-green-400' onClick={() => flipOneRight(currentMatrix)}>Flip right</RxRotateCounterClockwise> */}


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


export default Max7219Page
