 
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentMatrixByKey } from '../reducers/currentMatrixSlice'
function EightByEightFrame(props) {

    const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value)
    const dispatch = useDispatch()

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
      // className={props.currentMatrix === props.matrix.key ?
       className={currentMatrixKey === props.matrix.key ?
        "outline-red-700 outline-2 outline-dashed relative p-2" :
        "outline-slate-700 hover:outline-2 hover:outline-dashed relative p-2"
      }
      // onClick={() => props.setCurrentMatrix(props.matrix.key)}
      onClick={() => dispatch(setCurrentMatrixByKey(props.matrix.key))}
      

    >


      {props.matrix.dotmatrix.map((row, rowIndex) => (
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
  )
}

export default EightByEightFrame
