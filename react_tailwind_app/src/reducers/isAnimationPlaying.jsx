import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: false }

const isAnimationPlayingSlice = createSlice({
    name: 'isAnimationPlaying',
    initialState,
    reducers: {

        setToPlaying: (state) => {
            state.value = true
        },
         setToStopped: (state) => {
            state.value = false
        }
    }
})

export const { setToPlaying,setToStopped } = isAnimationPlayingSlice.actions
export default isAnimationPlayingSlice.reducer