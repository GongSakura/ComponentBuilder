
import { configureStore } from "@reduxjs/toolkit"
import interactStageReducer from './reducers/interactStage'
export const  store =  configureStore({reducer:{
	interactStage:interactStageReducer
}})

export type RootState = ReturnType<typeof store.getState>
export type AppDispath = typeof store.dispatch