import { createSlice } from '@reduxjs/toolkit'

const initialState = { value:"200" }

const frameDurationSlice = createSlice({
    name: 'frameDuration',
    initialState,
    reducers: {

        setFrameDuration: (state, action) => {
            state.value = action.payload
        }
    }
})

export const {setFrameDuration } = frameDurationSlice.actions
export default frameDurationSlice.reducer