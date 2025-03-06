import React, { useState } from "react";

const ExampleMatrix = () => {
    const [matrix, setMatrix] = useState(
        Array(64)
            .fill()
            .map(() => Array(128).fill(false))
    );

    // Calculate the size of each div
    const divSize = Math.floor(300 / 128); // ~2.34px, rounded down to 2px
    const containerWidth = divSize * 128; // Total width of the matrix
    const containerHeight = divSize * 64; // Total height of the matrix

    // Function to handle div clicks
    const handleClick = (row, col) => {
        const newMatrix = matrix.map((r, rIdx) =>
            r.map((cell, cIdx) => (rIdx === row && cIdx === col ? !cell : cell))
        );
        setMatrix(newMatrix);
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(128, ${divSize}px)`,
                gridTemplateRows: `repeat(64, ${divSize}px)`,
                width: `${containerWidth}px`,
                height: `${containerHeight}px`,
                border: "1px solid black",
            }}
        >
            {matrix.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleClick(rowIndex, colIndex)}
                        style={{
                            width: `${divSize}px`,
                            height: `${divSize}px`,
                            backgroundColor: cell ? "black" : "white",
                            
                            cursor: "pointer",
                        }}
                    />
                ))
            )}
     
        </div>
    );
};

export default ExampleMatrix;