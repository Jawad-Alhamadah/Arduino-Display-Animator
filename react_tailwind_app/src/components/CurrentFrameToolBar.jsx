import { BsFillEraserFill } from "react-icons/bs";
import React, { act, useRef } from "react";
import {
    MdKeyboardDoubleArrowRight,
    MdKeyboardDoubleArrowLeft,
} from "react-icons/md";

import { PiFlipHorizontalFill, PiFlipVerticalFill } from "react-icons/pi";
import { GrRotateLeft, GrRotateRight } from "react-icons/gr";

import ToolMainFrame from "./ToolMainFrame";
import Tool from "./Tool";
import StampPicker from "./StampPicker";
import { FaRegPenToSquare } from "react-icons/fa6";
import { TbPencilMinus } from "react-icons/tb";
import { TbPencilPlus } from "react-icons/tb";

import { setToKeyboardKey } from "../reducers/currentKeyboardKey";
import { setCurrentMatrixByKey } from "../reducers/currentMatrixSlice";

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"


function CurrentFrameToolBar(props) {
    const OUTER_SIZE = 128;
    const DISPLAY_WIDTH = 128;
    const DISPLAY_HEIGHT = 64;
    const dispatch = useDispatch();
    const [activeToolsTable, setActiveToolsTable] = useState({
        "pen": true,
        "eraser": false,
        "stamb": false
    })
    const [activateToolEnum, setToolsEnum] = useState({
        pen: "pen",
        eraser: "eraser",
        stamb: "stamb"
    })

    const currentOledRef = useRef(props.oledMatrix)
    const currentMatrixKey = useSelector((state) => state.currentMatrixKey.value);
    let currentKeyboardKey = useSelector(
        (state) => state.currentKeyboardKey.value
    );

    const currentKeyboardKeyRef = React.useRef(currentKeyboardKey);
    React.useEffect(() => {
        currentKeyboardKeyRef.current = currentKeyboardKey;
    }, [currentKeyboardKey]);

    React.useEffect(() => {
        currentOledRef.current = props.oledMatrix;
    }, [props.oledMatrix]);

    // Helper function to push to history before operations
    const pushToHistory = (frameKey, matrix) => {
        if (props.pushHistory) {
            props.pushHistory(frameKey, matrix);
        }
    };

    // Helper functions for matrix operations
    function clipOuterMatrix(matrix) {
        const yOffset = Math.floor((OUTER_SIZE - DISPLAY_HEIGHT) / 2);
        return matrix.slice(yOffset, yOffset + DISPLAY_HEIGHT);
    }

    function rotateMatrixRight(matrix) {
        const height = matrix.length;
        const width = matrix[0].length;
        const rotated = Array.from({ length: width }, () => Array(height).fill(0));

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                rotated[x][height - 1 - y] = matrix[y][x];
            }
        }

        return rotated;
    }

    function rotateMatrixLeft(matrix) {
        const height = matrix.length;
        const width = matrix[0].length;
        const rotated = Array.from({ length: width }, () => Array(height).fill(0));

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                rotated[width - 1 - x][y] = matrix[y][x];
            }
        }

        return rotated;
    }

    function expandToOuterMatrix(matrix) {
        const outer = Array.from({ length: OUTER_SIZE }, () =>
            Array(OUTER_SIZE).fill(0)
        );

        const height = matrix.length;
        const width = matrix[0].length;
        const yOffset = Math.floor((OUTER_SIZE - height) / 2);
        const xOffset = Math.floor((OUTER_SIZE - width) / 2);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                outer[y + yOffset][x + xOffset] = matrix[y][x];
            }
        }

        return outer;
    }

    // USE REFS TO ENSURE WE GET CURRENT STATE
    const handleRotateRight = React.useCallback(() => {
        // Use ref to get the most current state
        const currentFrame = currentOledRef.current.find(f => f.key === currentMatrixKey);
        if (!currentFrame) return;

        // Push to history using current ref state
        pushToHistory(currentMatrixKey, currentFrame.matrix);

        props.setOledMatrix(prevMatrix => {
            return prevMatrix.map(frame => {
                if (frame.key !== currentMatrixKey) return frame;

                // Use existing outerMatrix if available, otherwise expand current matrix
                const baseMatrix = frame.outerMatrix || expandToOuterMatrix(frame.matrix);
                const rotated = rotateMatrixRight(baseMatrix);

                return {
                    ...frame,
                    matrix: clipOuterMatrix(rotated),
                    outerMatrix: rotated,
                };
            });
        });
    }, [currentMatrixKey]);

    const handleRotateLeft = React.useCallback(() => {
        // Use ref to get the most current state
        const currentFrame = currentOledRef.current.find(f => f.key === currentMatrixKey);
        if (!currentFrame) return;

        // Push to history using current ref state
        pushToHistory(currentMatrixKey, currentFrame.matrix);

        props.setOledMatrix(prevMatrix => {
            return prevMatrix.map(frame => {
                if (frame.key !== currentMatrixKey) return frame;

                // Use existing outerMatrix if available, otherwise expand current matrix
                const baseMatrix = frame.outerMatrix || expandToOuterMatrix(frame.matrix);
                const rotated = rotateMatrixLeft(baseMatrix);

                return {
                    ...frame,
                    matrix: clipOuterMatrix(rotated),
                    outerMatrix: rotated,
                };
            });
        });
    }, [currentMatrixKey]);

    const handleFlipHorizontal = React.useCallback(() => {
        // Use ref to get the most current state
        const currentFrame = currentOledRef.current.find(f => f.key === currentMatrixKey);
        if (!currentFrame) return;

        // Push to history using current ref state
        pushToHistory(currentMatrixKey, currentFrame.matrix);

        props.setOledMatrix(prevMatrix => {
            return prevMatrix.map(frame => {
                if (frame.key !== currentMatrixKey) return frame;

                const matrix = frame.matrix.map(row => [...row].reverse());
                return {
                    ...frame,
                    matrix,
                    outerMatrix: undefined // Clear cached outer matrix
                };
            });
        });
    }, [currentMatrixKey]);

    const handleFlipVertical = React.useCallback(() => {
        // Use ref to get the most current state
        const currentFrame = currentOledRef.current.find(f => f.key === currentMatrixKey);
        if (!currentFrame) return;

        // Push to history using current ref state
        pushToHistory(currentMatrixKey, currentFrame.matrix);

        props.setOledMatrix(prevMatrix => {
            return prevMatrix.map(frame => {
                if (frame.key !== currentMatrixKey) return frame;

                const matrix = [...frame.matrix].reverse();
                return {
                    ...frame,
                    matrix,
                    outerMatrix: undefined // Clear cached outer matrix
                };
            });
        });
    }, [currentMatrixKey]);

    // SHIFT FUNCTIONS ALSO USING REFS
    const shiftLeft = React.useCallback(() => {
        // Use ref to get the most current state
        const currentFrame = currentOledRef.current.find(f => f.key === currentMatrixKey);
        if (!currentFrame) return;

        // Push to history using current ref state
        pushToHistory(currentMatrixKey, currentFrame.matrix);

        props.setOledMatrix(prevMatrix => {
            return prevMatrix.map(frame => {
                if (frame.key !== currentMatrixKey) return frame;

                const newMatrix = frame.matrix.map(row => [...row]);

                for (let y = 0; y < newMatrix.length; y++) {
                    for (let x = 0; x < newMatrix[y].length - 1; x++) {
                        newMatrix[y][x] = newMatrix[y][x + 1];
                    }
                    newMatrix[y][newMatrix[y].length - 1] = false;
                }

                return { ...frame, matrix: newMatrix };
            });
        });
    }, [currentMatrixKey]);

    const shiftRight = React.useCallback(() => {
        // Use ref to get the most current state
        const currentFrame = currentOledRef.current.find(f => f.key === currentMatrixKey);
        if (!currentFrame) return;

        // Push to history using current ref state
        pushToHistory(currentMatrixKey, currentFrame.matrix);

        props.setOledMatrix(prevMatrix => {
            return prevMatrix.map(frame => {
                if (frame.key !== currentMatrixKey) return frame;

                const newMatrix = frame.matrix.map(row => [...row]);

                for (let y = 0; y < newMatrix.length; y++) {
                    for (let x = newMatrix[y].length - 1; x > 0; x--) {
                        newMatrix[y][x] = newMatrix[y][x - 1];
                    }
                    newMatrix[y][0] = false;
                }

                return { ...frame, matrix: newMatrix };
            });
        });
    }, [currentMatrixKey]);

    const shiftLeftWrapped = React.useCallback(() => {
        // Use ref to get the most current state
        const currentFrame = currentOledRef.current.find(f => f.key === currentMatrixKey);
        if (!currentFrame) return;

        // Push to history using current ref state
        pushToHistory(currentMatrixKey, currentFrame.matrix);

        props.setOledMatrix(prevMatrix => {
            return prevMatrix.map(frame => {
                if (frame.key !== currentMatrixKey) return frame;

                const newMatrix = frame.matrix.map(row => [...row]);

                for (let y = 0; y < newMatrix.length; y++) {
                    const firstPixel = newMatrix[y][0];
                    for (let x = 0; x < newMatrix[y].length - 1; x++) {
                        newMatrix[y][x] = newMatrix[y][x + 1];
                    }
                    newMatrix[y][newMatrix[y].length - 1] = firstPixel;
                }

                return { ...frame, matrix: newMatrix };
            });
        });
    }, [currentMatrixKey]);

    const shiftRightWrapped = React.useCallback(() => {
        // Use ref to get the most current state
        const currentFrame = currentOledRef.current.find(f => f.key === currentMatrixKey);
        if (!currentFrame) return;

        // Push to history using current ref state
        pushToHistory(currentMatrixKey, currentFrame.matrix);

        props.setOledMatrix(prevMatrix => {
            return prevMatrix.map(frame => {
                if (frame.key !== currentMatrixKey) return frame;

                const newMatrix = frame.matrix.map(row => [...row]);

                for (let y = 0; y < newMatrix.length; y++) {
                    const lastPixel = newMatrix[y][newMatrix[y].length - 1];
                    for (let x = newMatrix[y].length - 1; x > 0; x--) {
                        newMatrix[y][x] = newMatrix[y][x - 1];
                    }
                    newMatrix[y][0] = lastPixel;
                }

                return { ...frame, matrix: newMatrix };
            });
        });
    }, [currentMatrixKey]);

    const handleBrushSizeUp = React.useCallback(() => {
        props.setBrushSize((prev) => {
            if (prev === 1) return 2;
            if (prev === 2) return 4;
            return 4;
        });
    }, []);

    const handleBrushSizeDown = React.useCallback(() => {
        props.setBrushSize((prev) => {
            if (prev === 4) return 2;
            if (prev === 2) return 1;
            return 1;
        });
    }, []);


    function toggleTools(toolToActivate) {
        props.setStampSymbol(null);
        dispatch(setToKeyboardKey("KeyNone"))
        let table = activeToolsTable

        let newTable = Object.fromEntries(
            Object.keys(table).map(key => [key, false])
        );
        newTable[toolToActivate] = true
        console.log(newTable)
        setActiveToolsTable(newTable)
    }

    function resetToDefaultBrush() {
        toggleTools(activateToolEnum.pen)
        props.setStampSymbol(null);
    }

    return (
        <>
            <div className=" w-full flex flex-wrap  mb-2 space-x-2 ">
                <div className="flex items-center  gap-3 mb-2 max-420:w-full max-420:justify-center max-420:gap-7">
                    <ToolMainFrame
                        Icon={MdKeyboardDoubleArrowLeft}
                        target="shiftleft"
                        shortCutKey="ControlLeft"
                        toggleKey="ControlLeft"
                        onHold={() =>
                            currentKeyboardKeyRef.current === "ControlLeft"
                                ? shiftLeft()
                                : shiftLeftWrapped()
                        }
                        oledMatrix={currentOledRef.current}
                        tooltip={["shift left", "Press `Ctrl` for No Wrap shift"]}
                        classes={
                            currentKeyboardKey === "ControlLeft"
                                ? "scale-110 text-yellow-400"
                                : ""
                        }
                    />

                    <ToolMainFrame
                        Icon={GrRotateLeft}
                        target="rotateLeft"
                        onClick={handleRotateLeft}
                        tooltip={["rotate left"]}
                    />

                    <ToolMainFrame
                        Icon={PiFlipHorizontalFill}
                        target="flipHorizontal"
                        onClick={handleFlipHorizontal}
                        tooltip={["Flip horizontally"]}
                    />

                    <ToolMainFrame
                        Icon={PiFlipVerticalFill}
                        target="flipVertical"
                        onClick={handleFlipVertical}
                        tooltip={["Flip Vertically"]}
                    />

                    <ToolMainFrame
                        Icon={GrRotateRight}
                        target="rotateRight"
                        onClick={handleRotateRight}
                        tooltip={["rotate Right"]}
                    />

                    <ToolMainFrame
                        Icon={MdKeyboardDoubleArrowRight}
                        target="shiftRight"
                        onHold={() =>
                            currentKeyboardKeyRef.current === "ControlLeft"
                                ? shiftRight()
                                : shiftRightWrapped()
                        }
                        tooltip={["shift Right", "Press `Ctrl` for No Wrap shift"]}
                        classes={
                            currentKeyboardKey === "ControlLeft"
                                ? "scale-110 text-yellow-400"
                                : ""
                        }
                    />
                </div>
                <div className="flex items-center gap-3  max-420:w-full max-420:justify-center max-420:gap-7">
                    <StampPicker onSelect={props.setStampSymbol}

                        classes={
                            
                            activeToolsTable.stamb ?
                                "size-5 scale-110 text-teal-200"
                                :
                                "size-5 "
                               
                        }
                         toggleTools={toggleTools}
                         activateToolEnum={activateToolEnum}
                    />

                    {currentKeyboardKey === "KeyD" || activeToolsTable.eraser ? (
                        <ToolMainFrame
                            Icon={BsFillEraserFill}
                            target="erase"
                            onClick={
                                () => {

                                    dispatch(setToKeyboardKey("KeyNone"))
                                }

                            }
                            tooltip={["Erase.", "ShortCut: D"]}
                            classes={
                                "scale-125 text-teal-300 hover:cursor-pointer  outline-green-300 outline-solid outline-1 "
                            }
                        />
                    ) : (
                        <ToolMainFrame
                            Icon={BsFillEraserFill}
                            target="erase"
                            onClick={
                                () => {
                                    toggleTools(activateToolEnum.eraser)
                                    dispatch(setToKeyboardKey("KeyD"))
                                }
                            }
                            tooltip={["Erase.", "ShortCut: D"]}

                        />
                    )}
                    <Tool
                        Icon={FaRegPenToSquare}
                        target="resetStamp"
                        onClick={resetToDefaultBrush}
                        tooltip={["Reset to Default Brush", "Clear stamp selection"]}
                        classes={activeToolsTable.pen ? "size-5 scale-125 text-teal-300" : "size-5"}
                    />
                    <div className="">
                        <ToolMainFrame
                            Icon={TbPencilPlus}
                            target="brushUp"
                            onClick={handleBrushSizeUp}
                            shortCutKey="Equal"
                            tooltip={["Draw Size Up"]}
                            classes="size-5"
                        />

                        <ToolMainFrame
                            Icon={TbPencilMinus}
                            target="brushDown"
                            tooltip={["Draw size Down"]}
                            classes="size-5"
                            shortCutKey="Minus"
                            onClick={handleBrushSizeDown}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default CurrentFrameToolBar
