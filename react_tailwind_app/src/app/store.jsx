import { configureStore } from '@reduxjs/toolkit'
import currentMatrixReducer from '../reducers/currentMatrixSlice'
import currentKeyReducer from '../reducers/currentKey'
import isAnimationReducer from '../reducers/isAnimationPlaying'

const store = configureStore({
  reducer: {
    currentMatrix: currentMatrixReducer,
    currentKey:currentKeyReducer,
    isAnimationPlaying:isAnimationReducer
  
  },
})

export default store