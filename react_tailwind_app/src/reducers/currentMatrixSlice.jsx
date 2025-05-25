import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: Math.random().toString(36).substr(2, 9) }

const currentMatrixSlice = createSlice({
    name: 'currentMatrix',
    initialState,
    reducers: {

        setToFrame: (state, action) => {
            state.value = action.payload
        }
    }
})

export const { setToFrame } = currentMatrixSlice.actions
export default currentMatrixSlice.reducer