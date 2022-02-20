
import React, { ReactChild } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import interact from 'interactjs'
import type { DraggableOptions, DropzoneOptions, ResizableOptions, Interactable, DragEvent, ResizeEvent, DropEvent } from '@interactjs/types/index'

import './index.less'
import {RootState} from '../../store'

function mapStateToProps(state:RootState){
	return {
		stageScale:state.interactStage.stageScale
	}
}

const ConnectedInteractItem = connect(mapStateToProps)

export interface InteractItemProps extends ConnectedProps<typeof ConnectedInteractItem> {

    draggable: boolean
    draggableOptions?: DraggableOptions
    dropzone: boolean
    dropzoneOptions?: DropzoneOptions
    resizable: boolean
    resizableOptions?: ResizableOptions
	children:ReactChild
	id:string

}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface InteractItemState{

}



class InteractItem extends React.Component<InteractItemProps, InteractItemState> {
    node?: HTMLElement
    interact?: Interactable
    draggableOptions: DraggableOptions
    resizableOptions: ResizableOptions
	dropzoneOptions: DropzoneOptions
    mousePosition={
    	x:0,
    	y:0
    }
    itemPosition={
    	x:0,
    	y:0
    }
    itemSize={
     	width:50,
     	height:50
    }
	
    constructor (props: InteractItemProps) {
      	super(props)
      	this.draggableOptions = {
      		onstart:(event: DragEvent)=>{
      			this.mousePosition.x = event.clientX
      			this.mousePosition.y = event.clientY
      			const target:HTMLElement = event.target as HTMLElement
      			if(!target.classList.contains('dragging')) {
      				target.classList.add('dragging')
      			}
      		},
      		onmove: (event: DragEvent) => {
      			this.itemPosition.x += event.dx / (this.props.stageScale || 1)
      			this.itemPosition.y += event.dy / (this.props.stageScale  || 1)
    	

    			this.itemPosition.x < 0 ? this.itemPosition.x = 0 : this.mousePosition.x = event.clientX
    			this.itemPosition.y < 0 ? this.itemPosition.y = 0 : this.mousePosition.y = event.clientY

    			// update
    			const target = event.target as HTMLElement
    			Object.assign(target.style, {
    				top:this.itemPosition.y + 'px',
    				left:this.itemPosition.x + 'px'
    			})
				
    			// execute hook
    			if (typeof props.draggableOptions?.onmove === 'function') {
    				props.draggableOptions.onmove(event)
    			}
				

      		},

      		onend: (event: DragEvent) => {
    			console.log('onend', event)
				
      			const target = event.target as HTMLElement
      			target.classList.remove('dragging')
      			if(!target.classList.contains('selected')) {
      				target.classList.add('selected')
      			}
      		},
      		modifiers:[interact.modifiers.restrictRect({
    			restriction:"#interact-board",
      			endOnly:true
      		})]
      	}
      	this.resizableOptions = {
      		margin: 4,
      		edges: Object.assign({ bottom: true, right: true, top: true, left: true }, props.resizableOptions?.edges),
      		invert: props.resizableOptions?.invert || 'reposition',
      		onstart:(event:ResizeEvent)=>{
      			const target = event.target as HTMLElement
      			if(!target.classList.contains('selected')) {
      				target.classList.add('selected')
      			}
      		},
      		onmove: (event: ResizeEvent) => {
      			// update
    			if(event.edges?.left){
    				this.itemPosition.x += event.delta.x
    			}
    			if(event.edges?.top){
    				this.itemPosition.y += event.delta.y
    			}
    			this.itemSize.width = event.rect.width
    			this.itemSize.height = event.rect.height
    			Object.assign(this.node?.style, {
    				width:this.itemSize.width + 'px',
    				height:this.itemSize.height + 'px',
    				top:this.itemPosition.y + 'px',
    				left:this.itemPosition.x + 'px'
    			})

     			if (typeof props.resizableOptions?.onmove === 'function') {
      				props.resizableOptions.onmove(event)
      			}
               
      		},
      		modifiers:[interact.modifiers.restrictSize({
      			min:{width:12, height:12}
      		})]

      	}

    	this.dropzoneOptions = {
    		accept:'.interact-item',
    		overlap:0.25,
    		ondragenter:(event:DropEvent)=>{
    			console.log('drop entry', event)
				
    			const current = event.target as HTMLElement
    			current.classList.add('dropzone')
    			
    		},
    		ondrop:(event:DropEvent)=>{
    			console.log('on drop', event)
    			const current = event.target as HTMLElement
    			current.classList.remove('dropzone')
    		},
    		ondragleave:(event:DropEvent)=>{
    			const current = event.target as HTMLElement
    			current.classList.remove('dropzone')
    		}
    	}
      	this.setInteractions = this.setInteractions.bind(this)
    }
   
    setInteractions () {
      	this.interact?.unset()
      	this.interact = interact(this.node as HTMLElement)
      	if (this.props.draggable) {
      		this.interact?.draggable(this.draggableOptions)
      	}
      	if (this.props.resizable) {
      		this.interact?.resizable(this.resizableOptions)
      	}
		  	if (this.props.dropzone) {
      		this.interact?.dropzone(this.dropzoneOptions)
      	}
    }

    handleItemClick(event:MouseEvent){

      	const target = event.target as HTMLElement
      	if(!target.classList.contains('selected')) {
      		target.classList.add('selected')
      	}
     
    }
    componentDidMount () { 
    	console.log(this.node)
		
      	this.node?.addEventListener('click', this.handleItemClick)
      	this.setInteractions()
    }
    
    componentDidUpdate () {
      	this.setInteractions()
    }
    componentWillUnmount(){
      	this.node?.removeEventListener('click', this.handleItemClick)
      	this.interact?.unset() 
    }
    render (): React.ReactNode {
     	return (
     		<div id={ this.props.id}       ref={(node: HTMLDivElement) => this.node = node} className='interact-item'>
     			{this.props.children}
     		</div>
     	)

    }
}


export default ConnectedInteractItem(InteractItem)

