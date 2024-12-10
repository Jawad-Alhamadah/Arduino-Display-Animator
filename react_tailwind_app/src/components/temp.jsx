import React from 'react';
import './App.css';
import Max7219IC from './components/Max7219IC';
import { RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";
import { MdAddCircle } from "react-icons/md";
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

function App() {
  const [pinCS, setPinCS] = React.useState(false);
  const [pinCLK, setPinCLK] = React.useState(false);
  const [pinDIN, setPinDIN] = React.useState(false);

  let pinCSRef = React.useRef(null)
  let pinCLKRef = React.useRef(null)
  let pinDINRef = React.useRef(null)
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [downKey, setDownKey] = React.useState(false);
  const newMatrix = {
    key: 0,
    dotmatrix: Array(8).fill(Array(8).fill(false)),
  };

  const [dotMatrixDivs, setDotMatrixDivs] = React.useState([
    { key: 1, dotmatrix: Array(8).fill(Array(8).fill(false)) },
    { key: 2, dotmatrix: Array(8).fill(Array(8).fill(false)) },
  ]);

  const [currentMatrix, setCurrentMatrix] = React.useState(1);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedDivs = Array.from(dotMatrixDivs);
    const [removed] = reorderedDivs.splice(source.index, 1);
    reorderedDivs.splice(destination.index, 0, removed);
    setDotMatrixDivs(reorderedDivs);
  };

  return (
    <div className="w-screen text-center flex justify-center flex-col items-center">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable direction="horizontal" droppableId="dotMatrixDivs" type="MATRIX">
          {(provided) => (
            <div
              className="bg-gray-900 flex gap-2 m-5 p-3 max-w-[50%] overflow-x-auto scroll-content shadow-lg"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {dotMatrixDivs.map((matrix, index) => (
                <Draggable key={matrix.key} draggableId={String(matrix.key)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="outline-slate-700 hover:outline-2 hover:outline-dashed relative p-2"
                      onClick={() => setCurrentMatrix(matrix.key)}
                    >
                      <div className="flex justify-between">
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
                      </div>
                      {matrix.dotmatrix.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-1 mt-[0.2rem]">
                          {row.map((e, colIndex) => (
                            <div
                              key={colIndex}
                              className={`rounded-full size-[0.3em] ${
                                e ? 'bg-[#ff0000] shadow-ld shadow-[#ff0000]' : 'bg-gray-500'
                              }`}
                            ></div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* Other parts of your app */}
      <div className='flex'>
        
        <div className=' relative
      shadow-sm max-sm:w-[85%] w-[13em] max-h-[40em] bg-[#093710] flex flex-col justify-center items-center pt-5'
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}

          onDragStart={handleDrag}
          onDrag={handleDrag}
          onDragOver={handleDrag}
          draggable="false"

        >

        
          <div className=' w-[11em]  bg-gray-900 p-3'
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}

            onDragStart={handleDrag}
            onDrag={handleDrag}
            onDragOver={handleDrag}
            draggable="false"
          >
          
            {dotMatrixDivs.find(obj => obj.key === currentMatrix).dotmatrix.map((row, rowIndex) => (
               
              <div key={rowIndex} className="flex gap-1 mt-1"
                onDragStart={handleDrag}
                onDrag={handleDrag}
                onDragOver={handleDrag}
                draggable="false"
              >
                {row.map((e, colIndex) => (
                  <div
                    key={colIndex}
                    className={` rounded-full size-[1em] ${e ? 'bg-[#ff0000] shadow-ld shadow-[#ff0000]' : 'bg-gray-500'}`}
                    onClick={async () => {
                      console.log("fd")
                      let old_state = await structuredClone(dotMatrixDivs)
                      console.log(old_state)
                      console.log("4")
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
          <div className='cursor-pointer bg-green-400 size-5 rounded-full text-lg absolute top-3 right-3 flex justify-center items-center'>
          <MdAddCircle onClick={()=> {
              const newMat = {
                key:dotMatrixDivs.length+1,
                dotmatrix: newMatrix.dotmatrix.map(row => [...row])
              };
          
              
              setDotMatrixDivs(prev =>[...prev,newMat])
          }} />
            </div>            
            <label for="small" class="block mb-2 text-start text-sm font-medium text-gray-900 dark:text-white">Selection Arduino Pin For DIN:</label>
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
            </select>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
