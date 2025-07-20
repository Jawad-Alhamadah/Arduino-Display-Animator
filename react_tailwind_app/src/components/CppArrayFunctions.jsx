


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


    return {
        cpp: generateCppArrayFromBytes(pixelList,index),
        length: pixelList.length,
        strategy: "column_compress",
    };
  
};

export function generateProgmemArray(encoded) {
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
    
    const strategies = [
        generateBitPackedCppArray(pixels,index),
        generateSparseCppArray(pixels,index),
        generateRLECppArray(pixels,index),
        generateColumnCompressedCppArray(pixels,index)
    ];
   
    const best = strategies.reduce((min, curr) => curr.length < min.length ? curr : min);
    return best;
};


export default generateMostEfficientCppArray