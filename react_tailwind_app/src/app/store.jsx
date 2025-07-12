import { configureStore } from '@reduxjs/toolkit'
import currentMatrixKeyReducer from '../reducers/currentMatrixSlice'
import currentKeyboardKeyReducer from '../reducers/currentKeyboardKey'
import isAnimationReducer from '../reducers/isAnimationPlaying'
import frameDurationReducer from "../reducers/frameDurationSlice"
const store = configureStore({
  reducer: {
    currentMatrixKey: currentMatrixKeyReducer,
    currentKeyboardKey:currentKeyboardKeyReducer,
    isAnimationPlaying:isAnimationReducer,
    frameDuration: frameDurationReducer
  
  },
})

export default store