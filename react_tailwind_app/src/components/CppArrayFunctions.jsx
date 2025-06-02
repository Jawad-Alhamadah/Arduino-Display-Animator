
// export function encodeFrame(matrix) {
//     const encodedFrame = [];
//     for (let y = 0; y < matrix.length; y++) {
//         for (let x = 0; x < matrix[y].length; x++) {
//             if (matrix[y][x]) {
//                 // Pack y and x into a single 16-bit integer
//                 const packedValue = (y << 7) | x; // y in bits 7-12, x in bits 0-6
//                 encodedFrame.push(packedValue);
//             }
//         }
//     }
//     return encodedFrame;
// }

// export const compressOLEDData = (pixels) => {
//     let compressed = new Uint8Array(1024);
//     for (let y = 0; y < 64; y++) {
//         for (let x = 0; x < 128; x++) {
//             let byteIndex = (y >> 3) * 128 + x;
//             let bitIndex = y & 7;
//             if (pixels[y][x]) {
//                 compressed[byteIndex] |= (1 << bitIndex);
//             }
//         }
//     }
//     return compressed;
// };


export const generateColumnCompressedCppArray = (pixels,index) => {
    let pixelList = [];

    for (let x = 0; x < 128; x++) {
        let yList = [];
        for (let y = 0; y < 64; y++) {
            if (pixels[y][x]) {
                yList.push(y);
            }
        }

        if (yList.length > 0) {
            pixelList.push(x, yList.length, ...yList);
        }
    }

    // Convert to C++ PROGMEM format
    // let cppArray = `const uint8_t imageData_${data}[] PROGMEM = {\n    `;
    // for (let i = 0; i < pixelList.length; i++) {
    //     cppArray += `${pixelList[i]}, `;
    //     if ((i + 1) % 16 === 0) cppArray += `\n    `;
    // }
    // cppArray += `\n};\nconst uint16_t imageDataLength_${data} = ${pixelList.length};`;


    return {
        cpp: generateCppArrayFromBytes(pixelList,index),
        length: pixelList.length,
        strategy: "column_compress",
    };
    //return cppArray;
};



// export function compressOledMatrix(matrix) {
//     const width = 128;
//     const height = 64;
//     const flat = [];

//     // Flatten matrix row-major
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             flat.push(matrix[y][x] ? 1 : 0);
//         }
//     }

//     // Find ranges of '1's (on pixels)
//     const runs = [];
//     let i = 0;
//     while (i < flat.length) {
//         if (flat[i] === 1) {
//             const start = i;
//             while (i < flat.length && flat[i] === 1) {
//                 i++;
//             }
//             const length = i - start;
//             runs.push({ start, length });
//         } else {
//             i++;
//         }
//     }

//     // Encode each run into 2 bytes (16 bits): 11 bits for start, 5 bits for length
//     const encoded = [];
//     for (const run of runs) {
//         if (run.length > 31) {
//             // Split long runs into chunks of 31 (max encodable in 5 bits)
//             let remaining = run.length;
//             let offset = 0;
//             while (remaining > 0) {
//                 const len = Math.min(31, remaining);
//                 const runStart = run.start + offset;
//                 const encodedValue = ((runStart & 0x7FF) << 5) | (len & 0x1F);
//                 encoded.push((encodedValue >> 8) & 0xFF, encodedValue & 0xFF);
//                 offset += len;
//                 remaining -= len;
//             }
//         } else {
//             const encodedValue = ((run.start & 0x7FF) << 5) | (run.length & 0x1F);
//             encoded.push((encodedValue >> 8) & 0xFF, encodedValue & 0xFF);
//         }
//     }

//     return encoded;
// }

// Convert to PROGMEM C++ style string
export function generateProgmemArray(encoded) {
    console.log(encoded.length)
    const hexArray = encoded.map(b => `0x${b.toString(16).padStart(2, '0')}`);
    return `const uint8_t imageData[] PROGMEM = {\n  ${hexArray.join(', ')}\n};` + `\nconst uint16_t imageDataLength = ${encoded.length};`;;
}


export const generateBitPackedCppArray = (pixels,index) => {
    const bytes = new Uint8Array(1024);
    for (let page = 0; page < 8; page++) {
        for (let x = 0; x < 128; x++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
                if (pixels[page * 8 + bit][x]) byte |= (1 << bit);
            }
            bytes[page * 128 + x] = byte;
        }
    }

    return {
        cpp: generateCppArrayFromBytes(bytes,index),
        length: 1024,
        strategy: "bitpacked",
    };
};

export const generateSparseCppArray = (pixels,index) => {
    const data = [];
    for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 128; x++) {
            if (pixels[y][x]) {
                data.push(x, y);
            }
        }
    }
    return {
        cpp: generateCppArrayFromBytes(data,index),
        length: data.length,
        strategy: "sparse",
    };
};


export function generateRLECppArray(pixels,index) {
    const rle = [];
    const flat = [];

    // Flatten the 2D matrix into a 1D stream (row-major order)
    for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 128; x++) {
            flat.push(pixels[y][x] ? 1 : 0);
        }
    }

    let current = flat[0];
    let runLength = 1;

    for (let i = 1; i < flat.length; i++) {
        if (flat[i] === current && runLength < 255) {
            runLength++;
        } else {
            rle.push(current, runLength);
            current = flat[i];
            runLength = 1;
        }
    }
    // Push last run
    rle.push(current, runLength);

    return {
        cpp: generateCppArrayFromBytes(rle,index),
        length: rle.length,
        strategy: "rle",
    };
}


export const generateCppArrayFromBytes = (data,index) => {
    let cpp = `const uint8_t imageData_${index}[] PROGMEM = {\n  `;
    for (let i = 0; i < data.length; i++) {
        cpp += data[i] + ', ';
        if ((i + 1) % 16 === 0) cpp += '\n  ';
    }
    cpp += `\n};\nconst uint16_t imageDataLength_${index} = ${data.length};`;


    
    return cpp;
};

export const generateMostEfficientCppArray = (pixels,index) => {
    console.time("heavyFunctions");
    const strategies = [
        generateBitPackedCppArray(pixels,index),
        generateSparseCppArray(pixels,index),
        generateRLECppArray(pixels,index),
        generateColumnCompressedCppArray(pixels,index)
    ];
    console.timeEnd("heavyFunctions");
    // console.log("Oled generation text")
    // console.log(strategies)
    const best = strategies.reduce((min, curr) => curr.length < min.length ? curr : min);
    console.log("Strategy selected:", best.strategy, "with length:", best.length);
    return best;
};


export default generateMostEfficientCppArray