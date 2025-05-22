import { configureStore } from '@reduxjs/toolkit'
import currentMatrixReducer from '../reducers/currentMatrixSlice'


const store = configureStore({
  reducer: {
    currentMatrix: currentMatrixReducer,
  
  },
})

export default store