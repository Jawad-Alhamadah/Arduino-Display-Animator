import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: 1 }

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