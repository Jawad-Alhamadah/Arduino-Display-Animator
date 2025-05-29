import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: Math.random().toString(36).substr(2, 9) }

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