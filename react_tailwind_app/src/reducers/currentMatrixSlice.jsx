import { createSlice } from '@reduxjs/toolkit'
import pako from 'pako'; // For compression (install with: npm install pako)

const decodeMatrixFromURL = (base64) => {
  try {
    // 1. Restore Base64 to compressed bytes
    const binaryStr = atob(base64
      .replace(/-/g, '+')
      .replace(/_/g, '/'));
    const compressed = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      compressed[i] = binaryStr.charCodeAt(i);
    }

    // 2. Decompress
    const jsonString = pako.inflate(compressed, { to: 'string' });

    // 3. Parse JSON
    const { frames } = JSON.parse(jsonString);

    // 4. Reconstruct oledMatrix with original keys
    return frames.map(({ key, data }) => {
      const matrix = [];
      for (let row = 0; row < 64; row++) {
        const start = row * 128;
        const rowData = data.slice(start, start + 128);
        matrix.push(Array.from(rowData).map(bit => bit === '1'));
      }
      return { key, matrix };  // Preserve original key
    });
  } catch (e) {
    console.error("Failed to decode matrix:", e);
    return null;
  }
};
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