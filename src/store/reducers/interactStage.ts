import { createSlice } from "@reduxjs/toolkit"
import type {PayloadAction} from '@reduxjs/toolkit'
export interface interactStageState{
    stageScale:number
}
const initialState:interactStageState = {
	stageScale:1
}
export const interactStageSlice =  createSlice( {
	name:'interactStage',
	initialState:initialState,
	reducers:{
		setStageScale:( state, action:PayloadAction<number> )=>{
			console.log( 'action creator' )
			console.log( action.payload )
			state.stageScale = action.payload
		}
	}
} )

// export action creators 
export const {setStageScale}  = interactStageSlice.actions
 
export default interactStageSlice.reducer