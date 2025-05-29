import { configureStore } from '@reduxjs/toolkit'
import currentMatrixKeyReducer from '../reducers/currentMatrixSlice'
import currentKeyboardKeyReducer from '../reducers/currentKeyboardKey'
import isAnimationReducer from '../reducers/isAnimationPlaying'

const store = configureStore({
  reducer: {
    currentMatrixKey: currentMatrixKeyReducer,
    currentKeyboardKey:currentKeyboardKeyReducer,
    isAnimationPlaying:isAnimationReducer
  
  },
})

export default store