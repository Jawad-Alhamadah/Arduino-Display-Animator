import React from 'react'

function OledFrame(props) {

    const WIDTH = 128;
    const HEIGHT = 64;
    const PIXEL_SIZE = 1; // Controls how large each pixel appears
    
     React.useEffect(() => {
        if(props.currentMatrix===props.matrix.key){
            drawCanvas();
        }
        
      }, [props.oledMatrix]); // Redraw canvas when matrix changes
    
 const canvasRef = React.useRef(null);
    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        //ctx.clearRect(0, 0, WIDTH * PIXEL_SIZE, HEIGHT * PIXEL_SIZE);
        console.log( "current matrix: "+props.currentMatrix+" key: "+ props.matrix.key)
        
        // Draw pixels efficiently
       
        console.log(  props.currentMatrix)
        props.oledMatrix.find(obj => obj.key === props.currentMatrix).oledmatrix.forEach((row, y) => {
          row.forEach((pixel, x) => {
            if (pixel) {
              ctx.fillStyle = "#06b6d4"; // cyan-300 in Tailwind
              ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
          });
        });
      };
    return (
        <div
          data-frame={props.matrix.key}
          ref={(el) => {
            props.provided.innerRef(el); // Attach the draggable's ref
            props.framesRef.current[props.index] = el; // Also add it to frameRefs
    
          }}
          // ref={provided.innerRef}
          {...props.provided.draggableProps}
          {...props.provided.dragHandleProps}
          className={props.currentMatrix === props.matrix.key ?
            "outline-red-700 outline-2 outline-dashed relative p-2" :
            "outline-slate-700 hover:outline-2 hover:outline-dashed relative p-2"
          }
          onClick={() => props.setCurrentMatrix(props.matrix.key)}
    
        >
    
    
          {/* {props.matrix.dotmatrix.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 mt-[0.2rem]">
              {row.map((e, colIndex) => (
                <div
                  key={colIndex}
                  className={`rounded-full size-[0.3em] ${e ? 'bg-[#ff0000] shadow-ld shadow-[#ff0000]' : 'bg-gray-500'
                    }`}
                ></div>
              ))}
            </div>
          ))} */}

            <canvas
               // ref={props.canvasRef}
               ref={canvasRef}
                width={props.width}
                height={props.height}
                className="border border-gray-500"
                // onMouseDown={handleCanvasMouseDown}
                // onMouseUp={handleCanvasMouseUp}
                // onMouseMove={handleCanvasMouseMove}
                />
          
        </div>
      )
}

export default OledFrame
