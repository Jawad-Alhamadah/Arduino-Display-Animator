import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentMatrixByKey } from '../reducers/currentMatrixSlice';
function OledFrame(props) {
const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value)
const dispatch = useDispatch()
    const WIDTH = 128;
    const HEIGHT = 64;
    const PIXEL_SIZE = 1; // Controls how large each pixel appears
    

      const drawCanvasinit = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, WIDTH * PIXEL_SIZE, HEIGHT * PIXEL_SIZE);
     
        props.oledMatrix.find(obj => obj.key ===  props.matrix.key).matrix.forEach((row, y) => {
          row.forEach((pixel, x) => {
            if (pixel) {
              ctx.fillStyle = "#06b6d4"; // cyan-300 in Tailwind
              ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
          });
        });
      };

        React.useEffect(() => {
       
            drawCanvasinit();
       
      }, []); 
    

     React.useEffect(() => {
        if(currentMatrixKey===props.matrix.key){
            drawCanvas();
        }
        
      }, [props.oledMatrix]); // Redraw canvas when matrix changes
    
 const canvasRef = React.useRef(null);
    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, WIDTH * PIXEL_SIZE, HEIGHT * PIXEL_SIZE);
        props.oledMatrix.find(obj => obj.key === currentMatrixKey).matrix.forEach((row, y) => {
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
          
          {...props.provided.draggableProps}
          {...props.provided.dragHandleProps}
          className={props.currentMatrix === props.matrix.key ?
            "outline-red-700 outline-2 outline-dashed relative p-2" :
            "outline-slate-700 hover:outline-2 hover:outline-dashed relative p-2"
          }
          onClick={() => dispatch(setCurrentMatrixByKey(props.matrix.key))}
    
        >

            <canvas
               ref={canvasRef}
                width={props.width}
                height={props.height}
                className="border border-gray-500"
        
                />
          
        </div>
      )
}

export default OledFrame
