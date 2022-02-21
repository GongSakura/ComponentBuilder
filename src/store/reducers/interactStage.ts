import { createSlice } from "@reduxjs/toolkit"
import type {PayloadAction} from '@reduxjs/toolkit'

interface stageElement{
	tag:keyof HTMLElementTagNameMap
	events:Array<EventListener>
	methods:Array<(...args:any)=>void>
	style:object

}
export interface interactStageState{
    stageScale:number
	stageWidth:number
	stageHeight:number,
	styleUnitType:'rem'|'px'|'%'
	stageChildren:Array<stageElement>
}
const initialState:interactStageState = {
	stageScale:1
	
}
export const interactStageSlice =  createSlice({
	name:'interactStage',
	initialState:initialState,
	reducers:{
		setStageScale:(state, action:PayloadAction<number>)=>{
			console.log(action.payload)
			state.stageScale = action.payload
		}
	}
})

// export action creators 
export const {setStageScale}  = interactStageSlice.actions
 
export default interactStageSlice.reducer


//reducer state, action
// dispatch({})