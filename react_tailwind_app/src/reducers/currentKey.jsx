import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: "l" }

const currentKeySlice = createSlice({
    name: 'currentMatrix',
    initialState,
    reducers: {

        setToKey: (state, action) => {
            state.value = action.payload
        }
    }
})

export const { setToKey } = currentKeySlice.actions
export default currentKeySlice.reducer