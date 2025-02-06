import React from 'react';
import './App.css';
import Max7219IC from './components/Max7219IC';
import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";
import { MdAddCircle } from "react-icons/md";
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import PinSelector from './components/PinSelector';
import { PiArrowFatRightDuotone } from "react-icons/pi";
import { PiArrowFatLeftDuotone } from "react-icons/pi";
import { BsPlayFill } from "react-icons/bs";
import { LuClipboardCopy } from "react-icons/lu";
function App() {

 
 /*
 
// Define control pins for MAX7219
const int DIN = 12;
const int CLK = 11;
const int CS = 10;

// Define the frame data (matrix list)
const int numFrames = 3; // Number of frames in the list
const bool frames[numFrames][8][8] = {
  {
    {false, false, false, false, false, false, false, false},
    {false, false, false, false, true,  true,  false, false},
    {false, false, false, true,  true,  true,  false, false},
    {false, false, true,  true,  true,  true,  true,  false},
    {false, true,  true,  true,  true,  true,  true,  true},
    {false, false, false, false, false, false, false, false},
    {false, false, false, false, false, false, false, false},
    {false, false, false, false, false, false, false, false},
  },
  {
    {false, false, false, false, false, false, false, false},
    {false, false, false, true,  true,  true,  false, false},
    {false, false, true,  true,  true,  true,  true,  false},
    {false, true,  true,  true,  true,  true,  true,  true},
    {true,  true,  true,  true,  true,  true,  true,  true},
    {false, true,  true,  true,  true,  true,  true,  false},
    {false, false, true,  true,  true,  true,  true,  false},
    {false, false, false, true,  true,  true,  false, false},
  },
  {
    {true,  true,  true,  true,  true,  true,  true,  true},
    {true,  false, false, false, false, false, false, true},
    {true,  false, true,  true,  true,  true,  false, true},
    {true,  false, true,  false, false, true,  false, true},
    {true,  false, true,  false, false, true,  false, true},
    {true,  false, true,  true,  true,  true,  false, true},
    {true,  false, false, false, false, false, false, true},
    {true,  true,  true,  true,  true,  true,  true,  true},
  }
};

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
    delay(500); // Delay between frames (adjust as needed)
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
}

 
 */


  const [pinCS, setPinCS] = React.useState(false);
  const [pinCLK, setPinCLK] = React.useState(false);
  const [pinDIN, setPinDIN] = React.useState(false);
  let [test, setTest] = React.useState(0);

  let pinCSRef = React.useRef(null)
  let pinCLKRef = React.useRef(null)
  let pinDINRef = React.useRef(null)
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [downKey, setDownKey] = React.useState(false);

  function repeatFunction(func, delay, repeat) {
    func(dotMatrixDivs[0].key);
    let counter = 1;
    
    let interval = setInterval(() => {
  
      if (repeat !== counter) {
        func(dotMatrixDivs[counter].key);
        //console.log(dotMatrixDivs[counter].key)
        counter++;
      } else {
        clearInterval(interval)
      }
    }, delay);
  
  }
  
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
        key: 1, dotmatrix: [
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false],
        ]
      },

      // {
      //   key: 2, dotmatrix: [
      //     [false, false, false, false, false, false, false, false],
      //     [false, false, false, false, false, false, false, false],
      //     [false, false, false, false, false, false, false, false],
      //     [false, false, false, false, false, false, false, false],
      //     [false, false, false, false, false, false, false, false],
      //     [false, false, false, false, false, false, false, false],
      //     [false, false, false, false, false, false, false, false],
      //     [false, false, false, false, false, false, false, false],
      //   ]
      // }
    ]

  )
  const framesRef = React.useRef([]);
  const timelineRef = React.useRef(null);
  const [currentMatrix, setCurrentMatrix] = React.useState(1);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedDivs = Array.from(dotMatrixDivs);
    const [removed] = reorderedDivs.splice(source.index, 1);
    reorderedDivs.splice(destination.index, 0, removed);
    setDotMatrixDivs(reorderedDivs);
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

  return (
    <div className="w-screen text-center flex justify-center flex-col items-center ">
    
      <DragDropContext onDragEnd={onDragEnd}>

        <Droppable direction="horizontal" droppableId="dotMatrixDivs" type="MATRIX">

          {(provided) => (

            <div
              className="md:min-w-[30em]  lg:min-w-[30em]  outline-green-800 rounded-md outline-2 outline bg-gray-900 max-h-[150px] overflow-y-hidden gap-2 m-5 p-3 max-w-[50%] overflow-x-auto scroll-content shadow-lg relative"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className='flex justify-between '>

                {/* <PiArrowFatLeftDuotone className='text-green-400'
                  onClick={() => {
                    if (currentMatrix === 1) return
                      setCurrentMatrix(prev=>prev-1)
                  }
                  }
                ></PiArrowFatLeftDuotone> */}
                {/* <PiArrowFatRightDuotone className='text-green-400'
                  onClick={() => {
                    if (currentMatrix ===dotMatrixDivs.length) return
                      setCurrentMatrix(prev=>prev+1)
                  }
                  }
                ></PiArrowFatRightDuotone> */}
                  <div className='cursor-pointer bg-green-400 size-5 rounded-full text-lg  flex justify-center items-center'>
              <MdAddCircle onClick={() => {
                const newMat = {
                  key: dotMatrixDivs.length + 1,
                  dotmatrix: newMatrix.dotmatrix.map(row => [...row])
                };


                setDotMatrixDivs(prev => [...prev, newMat])
              }} />
            </div>
                <BsPlayFill className='text-green-400' 
                onClick={()=>repeatFunction(setCurrentMatrix,400,dotMatrixDivs.length)}
                />
              </div>
              {/* <div className={`w-[6em] h-4 bg-green-600  absolute  top-0`}
                style={{ left: test + "px" }}
                ref={timelineRef}
              ></div> */}
              <div className='flex mt-3 '>
                {dotMatrixDivs.map((matrix, index) => (
                  <Draggable key={matrix.key} draggableId={String(matrix.key)} index={index}>
                    {(provided) => (<>

                      <div
                        data-frame={matrix.key}
                        ref={(el) => {
                          provided.innerRef(el); // Attach the draggable's ref
                          framesRef.current[index] = el; // Also add it to frameRefs

                        }}
                        // ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={currentMatrix === matrix.key ?
                          "outline-red-700 outline-2 outline-dashed relative p-2" :
                          "outline-slate-700 hover:outline-2 hover:outline-dashed relative p-2"
                        }
                        onClick={() => setCurrentMatrix(matrix.key)}

                      >

                        {/* <div className="flex justify-between">
                        <RiArrowLeftSFill
                          className="text-slate-600 text-[1.2rem]"
                          onClick={() => {
                            if (index === 0) return;
                            const newOrder = [...dotMatrixDivs];
                            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                            setDotMatrixDivs(newOrder);
                          }}
                        />
                        <RiArrowRightSFill
                          className="text-slate-600 text-[1.2rem]"
                          onClick={() => {
                            if (index === dotMatrixDivs.length - 1) return;
                            const newOrder = [...dotMatrixDivs];
                            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                            setDotMatrixDivs(newOrder);
                          }}
                        />
                      </div> */}
                        {matrix.dotmatrix.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex gap-1 mt-[0.2rem]">
                            {row.map((e, colIndex) => (
                              <div
                                key={colIndex}
                                className={`rounded-full size-[0.3em] ${e ? 'bg-[#ff0000] shadow-ld shadow-[#ff0000]' : 'bg-gray-500'
                                  }`}
                              ></div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                    )

                    }
                  </Draggable>
                ))}
              </div>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* Other parts of your app */}
      <div className='flex shadow-xl shadow-[#282828]'>

        <div className=' relative 
      shadow-sm max-sm:w-[85%] w-[13em] max-h-[40em] bg-[#093710] flex flex-col justify-center items-center pt-5'
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}

        // onDragStart={handleDrag}
        // onDrag={handleDrag}
        // onDragOver={handleDrag}
        // draggable="false"

        >


          <div className=' w-[11em]  bg-gray-900 p-3'
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}

          // onDragStart={handleDrag}
          // onDrag={handleDrag}
          // onDragOver={handleDrag}
          // draggable="false"
          >

            {dotMatrixDivs.find(obj => obj.key === currentMatrix).dotmatrix.map((row, rowIndex) => (

              <div key={rowIndex} className="flex gap-1 mt-1"
              // onDragStart={handleDrag}
              // onDrag={handleDrag}
              // onDragOver={handleDrag}
              // draggable="false"
              >
                {row.map((e, colIndex) => (
                  <div
                    key={colIndex}
                    className={` rounded-full size-[1em] ${e ? 'bg-[#ff0000] shadow-ld shadow-[#ff0000]' : 'bg-gray-500'}`}
                    onClick={() => {
                      console.log("f")
                      let old_state = structuredClone(dotMatrixDivs)

                      // old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex]=true

                      old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex] = !old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex]
                      setDotMatrixDivs(old_state)
                    }}

                    onMouseDown={() => setIsMouseDown(true)}
                    onMouseUp={() => setIsMouseDown(false)}
                    onMouseEnter={(e) => {
                      if (isMouseDown) {
                        let old_state = structuredClone(dotMatrixDivs)
                        old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex] = downKey === "d" ? false : true
                        setDotMatrixDivs(old_state)
                      }




                    }}

                  >


                  </div>
                ))}
              </div>

            ))}
          </div>

          <Max7219IC />
          <div className='bg-slate-900 w-[30%] h-2 mt-5 flex justify-evenly'>

            <div className='w-[0.2rem] h-6 bg-gray-400  shadow-sm'></div>
            <div className='w-[0.2rem] h-6 bg-gray-400  shadow-sm'></div>
            <div ref={pinDINRef} className={`w-[0.2rem] h-6 bg-gray-400  shadow-sm pin-din ${pinDIN ? "hovered" : ""} `}></div>
            <div ref={pinCSRef} className={`w-[0.2rem] h-6 bg-gray-400  shadow-sm pin-cs ${pinCS ? "hovered" : ""} `}></div>
            <div ref={pinCLKRef} className={`w-[0.2rem] h-6 bg-gray-400  shadow-sm pin-clk ${pinCLK ? "hovered" : ""} `}></div>
          </div>


        </div>
        <div className='flex flex-col'>
          <form class="max-w-sm mx-auto  bg-[#093710] p-4 relative">
          
            <PinSelector label="Selection Arduino Pin For DIN:" pinSetter={setPinDIN}></PinSelector>
            <PinSelector label="Selection Arduino Pin For CS:" pinSetter={setPinCS}></PinSelector>
            <PinSelector label="Selection Arduino Pin For CLK:" pinSetter={setPinCLK}></PinSelector>
            {/* <label for="small" class="block mb-2 text-start text-sm font-medium text-gray-900 dark:text-white">Selection Arduino Pin For DIN:</label>
            <select

              onFocus={() => {

                pinDINRef.current.style.backgroundColor = "red";
                pinDINRef.current.style.transform = "scale(1.3)";
                setPinDIN(true)


              }}
              onBlur={() => {
                pinDINRef.current.style.backgroundColor = "#9ca3af";
                pinDINRef.current.style.transform = "scale(1)"
                setPinDIN(false)

              }}

              id="small" class=" block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option selected>Pick Arduino Pin:</option>
              <option value="D2">D2 Pin</option>
              <option value="D3">D3 Pin</option>
              <option value="D4">D4 Pin</option>
              <option value="D5">D5 Pin</option>
              <option value="D6">D6 Pin</option>
              <option value="D7">D7 Pin</option>
              <option value="D8">D8 Pin</option>
              <option value="D9">D9 Pin</option>
              <option value="D10">D10 Pin</option>
              <option value="D11">D11 Pin</option>
              <option value="D12">D12 Pin</option>
              <option value="D13">D13 Pin</option>
            </select>
            <label for="default" class=" text-start block mb-2 text-sm font-medium text-gray-900 dark:text-white">Selection Arduino Pin For CS:</label>
            <select
              onFocus={() => {
                pinCSRef.current.style.backgroundColor = "red";
                pinCSRef.current.style.transform = "scale(1.3)"
                setPinCS(true)
              }}
              onBlur={() => {
                pinCSRef.current.style.backgroundColor = "#9ca3af";
                pinCSRef.current.style.transform = "scale(1)"
                setPinCS(false)
              }}

              id="default" class="bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option selected>Pick Arduino Pin:</option>
              <option value="D2">D2 Pin</option>
              <option value="D3">D3 Pin</option>
              <option value="D4">D4 Pin</option>
              <option value="D5">D5 Pin</option>
              <option value="D6">D6 Pin</option>
              <option value="D7">D7 Pin</option>
              <option value="D8">D8 Pin</option>
              <option value="D9">D9 Pin</option>
              <option value="D10">D10 Pin</option>
              <option value="D11">D11 Pin</option>
              <option value="D12">D12 Pin</option>
              <option value="D13">D13 Pin</option>
            </select>
            <label for="large" class="  text-start block mb-2 text-base font-medium text-gray-900 dark:text-white">Selection Arduino Pin For CLK:</label>
            <select
              onFocus={() => {
                pinCLKRef.current.style.backgroundColor = "red";
                pinCLKRef.current.style.transform = "scale(1.3)"
                setPinCLK(true)
              }}
              onBlur={() => {
                pinCLKRef.current.style.backgroundColor = "#9ca3af";
                pinCLKRef.current.style.transform = "scale(1)"
                setPinCLK(false)
              }}

              id="large" class="block w-full px-4 py-2 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option selected>Pick Arduino Pin:</option>
              <option value="D2">D2 Pin</option>
              <option value="D3">D3 Pin</option>
              <option value="D4">D4 Pin</option>
              <option value="D5">D5 Pin</option>
              <option value="D6">D6 Pin</option>
              <option value="D7">D7 Pin</option>
              <option value="D8">D8 Pin</option>
              <option value="D9">D9 Pin</option>
              <option value="D10">D10 Pin</option>
              <option value="D11">D11 Pin</option>
              <option value="D12">D12 Pin</option>
              <option value="D13">D13 Pin</option>
            </select> */}
          </form>
        </div>
      </div>
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
      }}
      class="mt-10 w-[95%]  rounded-lg outline outline-2 outline-green-700 shadow-2xl shadow-black"
    >
    <button className='ml-auto flex justify-between items-center hover:scale-110 font-semibold  outline outline-2 outline-green-600 rounded-md m-3 p-2 text-green-300 shadow-lg shadow-[#191919]'>
      <span >Cody Code</span>
      <LuClipboardCopy class="m-1 size-5"></LuClipboardCopy>      
      </button>
      <code>{`
    
const int DIN = 12;
const int CLK = 11;
const int CS = 10;

// Define the frame data (matrix list)
const int numFrames = 3; // Number of frames in the list
const bool frames[numFrames][8][8] = {
  {
    {false, false, false, false, false, false, false, false},
    {false, false, false, false, true,  true,  false, false},
    {false, false, false, true,  true,  true,  false, false},
    {false, false, true,  true,  true,  true,  true,  false},
    {false, true,  true,  true,  true,  true,  true,  true},
    {false, false, false, false, false, false, false, false},
    {false, false, false, false, false, false, false, false},
    {false, false, false, false, false, false, false, false},
  },
  {
    {false, false, false, false, false, false, false, false},
    {false, false, false, true,  true,  true,  false, false},
    {false, false, true,  true,  true,  true,  true,  false},
    {false, true,  true,  true,  true,  true,  true,  true},
    {true,  true,  true,  true,  true,  true,  true,  true},
    {false, true,  true,  true,  true,  true,  true,  false},
    {false, false, true,  true,  true,  true,  true,  false},
    {false, false, false, true,  true,  true,  false, false},
  },
  {
    {true,  true,  true,  true,  true,  true,  true,  true},
    {true,  false, false, false, false, false, false, true},
    {true,  false, true,  true,  true,  true,  false, true},
    {true,  false, true,  false, false, true,  false, true},
    {true,  false, true,  false, false, true,  false, true},
    {true,  false, true,  true,  true,  true,  false, true},
    {true,  false, false, false, false, false, false, true},
    {true,  true,  true,  true,  true,  true,  true,  true},
  }
};

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
    delay(500); // Delay between frames (adjust as needed)
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
}`}</code>
    </pre>
  
    </div>
    
  );
}

export default App;
