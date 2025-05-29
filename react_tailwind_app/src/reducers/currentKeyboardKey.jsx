import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: "l" }

const currentKeyboardKeySlice = createSlice({
    name: 'currentKeyboardKey',
    initialState,
    reducers: {

        setToKeyboardKey: (state, action) => {  
            console.log(action.payload)
            state.value = action.payload
        }
    }
})

export const { setToKeyboardKey } = currentKeyboardKeySlice.actions
export default currentKeyboardKeySlice.reducer