import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setToKey } from '../reducers/currentKey'

function EightByEightMain(props) {





    const currentMatrix = useSelector((state) => state.currentMatrix.value)
    let currentKey = useSelector((state) => state.currentKey.value)

    //const [downKey, setDownKey] = React.useState("l");
    return (
        // props.dotMatrixDivs.find(obj => obj.key === props.currentMatrix).dotmatrix.map((row, rowIndex) => (

        props.dotMatrixDivs.find(obj => obj.key === currentMatrix).dotmatrix.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 mt-1"
                onMouseDown={e => e.preventDefault()}
            >
                {row.map((e, colIndex) => (
                    <div

                        key={colIndex}
                        className={` rounded-full size-[1em] ${e ? 'bg-[#ff0000] shadow-ld shadow-[#ff0000]' : 'bg-gray-500'}`}
                        onClick={() => {
                            console.log("f")
                            let old_state = structuredClone(props.dotMatrixDivs)

                            // old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex]=true

                            //old_state.find(obj => obj.key === props.currentMatrix).dotmatrix[rowIndex][colIndex] = !old_state.find(obj => obj.key === props.currentMatrix).dotmatrix[rowIndex][colIndex]
                            old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex] = !old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex]
                            props.setDotMatrixDivs(old_state)
                        }}

                        // onMouseDown={(e) =>{ 
                        //     e.preventDefault()
                        //     let old_state = structuredClone(props.dotMatrixDivs)
                        //     old_state.find(obj => obj.key === props.currentMatrix).dotmatrix[rowIndex][colIndex] = downKey === "d" ? false : true
                        //     props.setDotMatrixDivs(old_state)
                        //     setIsMouseDown(true)}}
                        // onMouseUp={() => setIsMouseDown(false)}
                        onMouseEnter={(e) => {

                           
                            if (props.isDragging) {
                                let old_state = structuredClone(props.dotMatrixDivs)
                                //old_state.find(obj => obj.key === props.currentMatrix).dotmatrix[rowIndex][colIndex] = downKey === "d" ? false : true
                                old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex] = currentKey === "KeyD" ? false : true
                                props.setDotMatrixDivs(old_state)
                            }

                        }}

                        onMouseDown={(e) => {

                            let old_state = structuredClone(props.dotMatrixDivs)
                            old_state.find(obj => obj.key === props.currentMatrix).dotmatrix[rowIndex][colIndex] = currentKey === "KeyD" ? false : true
                            old_state.find(obj => obj.key === currentMatrix).dotmatrix[rowIndex][colIndex] = currentKey === "KeyD" ? false : true
                            props.setDotMatrixDivs(old_state)

                        }}

                    >

                    </div>
                ))}
            </div>
        )))
}

export default EightByEightMain
