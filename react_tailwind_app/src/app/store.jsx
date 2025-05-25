import { configureStore } from '@reduxjs/toolkit'
import currentMatrixReducer from '../reducers/currentMatrixSlice'
import currentKeyReducer from '../reducers/currentKey'

const store = configureStore({
  reducer: {
    currentMatrix: currentMatrixReducer,
    currentKey:currentKeyReducer
  
  },
})

export default store