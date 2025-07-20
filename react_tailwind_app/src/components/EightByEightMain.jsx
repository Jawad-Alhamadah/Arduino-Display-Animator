import React from 'react'
import { useSelector } from 'react-redux'

function EightByEightMain(props) {

    const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value)
    let currentKeyboardKey = useSelector((state) => state.currentKeyboardKey.value)

    return (
        props.dotMatrixDivs.find(obj => obj.key === currentMatrixKey).dotmatrix.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 mt-1"
                onMouseDown={e => e.preventDefault()}
            >
                {row.map((e, colIndex) => (
                    <div

                        key={colIndex}
                        className={` rounded-full size-[1em] ${e ? 'bg-[#ff0000] shadow-ld shadow-[#ff0000]' : 'bg-gray-500'}`}
                        onClick={() => {
                            let old_state = structuredClone(props.dotMatrixDivs)
                            old_state.find(obj => obj.key === currentMatrixKey).dotmatrix[rowIndex][colIndex] = !old_state.find(obj => obj.key === currentMatrixKey).dotmatrix[rowIndex][colIndex]
                            props.setDotMatrixDivs(old_state)
                        }}

                        onMouseEnter={(e) => {

                            if (props.isDragging) {
                                let old_state = structuredClone(props.dotMatrixDivs)
                                old_state.find(obj => obj.key === currentMatrixKey).dotmatrix[rowIndex][colIndex] = currentKeyboardKey === "KeyD" ? false : true
                                props.setDotMatrixDivs(old_state)
                            }

                        }}

                        onMouseDown={(e) => {

                            let old_state = structuredClone(props.dotMatrixDivs)
                            old_state.find(obj => obj.key === props.currentMatrix).dotmatrix[rowIndex][colIndex] = currentKeyboardKey === "KeyD" ? false : true
                            old_state.find(obj => obj.key === currentMatrixKey).dotmatrix[rowIndex][colIndex] = currentKeyboardKey === "KeyD" ? false : true
                            props.setDotMatrixDivs(old_state)

                        }}

                    >
                    </div>
                ))}
            </div>
        )))
}

export default EightByEightMain
