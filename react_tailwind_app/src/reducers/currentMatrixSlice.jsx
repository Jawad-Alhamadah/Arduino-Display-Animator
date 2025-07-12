import { createSlice } from '@reduxjs/toolkit'
import pako from 'pako'; // For compression (install with: npm install pako)
// LZMA typically outperforms zlib for binary data
import { LZMA } from 'lzma-web'
; // Install: npm install lzma
// const decodeMatrixFromURL = (base64) => {
//   try {
//     // 1. Restore Base64 to compressed bytes
//     const binaryStr = atob(base64
//       .replace(/-/g, '+')
//       .replace(/_/g, '/'));
//     const compressed = new Uint8Array(binaryStr.length);
//     for (let i = 0; i < binaryStr.length; i++) {
//       compressed[i] = binaryStr.charCodeAt(i);
//     }

//     // 2. Decompress
//     const jsonString = pako.inflate(compressed, { to: 'string' });

//     // 3. Parse JSON
//     const { frames } = JSON.parse(jsonString);

//     // 4. Reconstruct oledMatrix with original keys
//     return frames.map(({ key, data }) => {
//       const matrix = [];
//       for (let row = 0; row < 64; row++) {
//         const start = row * 128;
//         const rowData = data.slice(start, start + 128);
//         matrix.push(Array.from(rowData).map(bit => bit === '1'));
//       }
//       return { key, matrix };  // Preserve original key
//     });
//   } catch (e) {
//     console.error("Failed to decode matrix:", e);
//     return null;
//   }
// };

async function decompressFromTinyURL(encoded) {
  try {
    // 1. Base64 decode
    const binaryStr = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
    const compressed = Uint8Array.from(binaryStr, c => c.charCodeAt(0));
    
    // 2. LZMA decompress
    const bytes = await LZMA.decompress(compressed);
    
    // 3. Rebuild binary string
    let binary = '';
    bytes.forEach(byte => binary += byte.toString(2).padStart(8, '0'));
    
    // 4. Parse frames
    const frames = [];
    let pos = 0;
    
    while (pos < binary.length) {
      const lengthEnd = binary.indexOf('|', pos);
      if (lengthEnd === -1) break;
      
      const keyLength = parseInt(binary.slice(pos, lengthEnd), 36);
      pos = lengthEnd + 1;
      
      const key = binary.slice(pos, pos + keyLength);
      pos += keyLength;
      
      const matrix = [];
      for (let row = 0; row < 64 && pos + 128 <= binary.length; row++) {
        const rowData = binary.slice(pos, pos + 128);
        matrix.push(Array.from(rowData, bit => bit === '1'));
        pos += 128;
      }
      
      frames.push({ key, matrix });
    }
    
    return frames;
  } catch (e) {
    console.error("Decompression failed:", e);
    return null;
  }
}


function initializeState(){


// const initialState = { value: Math.random().toString(36).substr(2, 9) }
 const params = new URLSearchParams(window.location.search);
const matrixParam = params.get('matrix');

if (!matrixParam) return { value: Math.random().toString(36).substr(2, 9) }

let firstKey = decodeMatrixFromURL(matrixParam)[0].key

if(firstKey) return  { value: firstKey }
if(!firstKey) return { value: Math.random().toString(36).substr(2, 9) }

}

let initialState = initializeState()


const currentMatrixSlice = createSlice({
    name: 'currentMatrixKey',
    initialState,
    reducers: {

        setCurrentMatrixByKey: (state, action) => {
            state.value = action.payload
        }
    }
})

export const {setCurrentMatrixByKey } = currentMatrixSlice.actions
export default currentMatrixSlice.reducer