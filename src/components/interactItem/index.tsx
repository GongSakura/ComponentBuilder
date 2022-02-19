
import React, { cloneElement, ReactChild, ReactElement } from 'react'
import { connect, ConnectedProps } from 'react-redux'

import interact from 'interactjs'
import modifiers from '@interactjs/modifiers/plugin'
import type { DraggableOptions, DropzoneOptions, ResizableOptions, Interactable, DragEvent, ResizeEvent, PointerEventType } from '@interactjs/types/index'

import './index.less'
import {RootState} from '../../store'

function mapStateToProps( state:RootState ){
	console.log( "mapState", state )
	return {
		stageScale:state.interactStage.stageScale
	}
}

const ConnectedInteractItem = connect( mapStateToProps )

export interface InteractItemProps extends ConnectedProps<typeof ConnectedInteractItem> {
    draggable: boolean
    draggableOptions?: DraggableOptions
    dropzone: boolean
    dropzoneOptions?: DropzoneOptions
    resizable: boolean
    resizableOptions?: ResizableOptions
	children:ReactChild
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface InteractItemState{

}



class InteractItem extends React.Component<InteractItemProps, InteractItemState> {
    node?: HTMLElement
    interact?: Interactable
    draggableOptions: DraggableOptions
    resizableOptions: ResizableOptions
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
     temp={
     	x:0,
     	y:0
     }
     constructor ( props: InteractItemProps ) {
      	super( props )
      	this.draggableOptions = {
      		onstart:( event: DragEvent )=>{
      			this.mousePosition.x = event.clientX
      			this.mousePosition.y = event.clientY
      			const target:HTMLElement = event.target as HTMLElement
      			if( !target.classList.contains( 'dragging' ) ) {
      				target.classList.add( 'dragging' )
      			}
      		},
      		onmove: ( event: DragEvent ) => {
      			// console.log( 'onmove',event )
                 
      			this.itemPosition.x += event.dx / ( this.props.stageScale || 1 )
      			this.itemPosition.y += event.dy / ( this.props.stageScale  || 1 )
      			this.temp.x += event.dx / ( this.props.stageScale || 1 )
      			this.temp.y += event.dy / ( this.props.stageScale || 1 )
      			// update
      			const target = event.target as HTMLElement
      			Object.assign( target.style, {
      				top:this.itemPosition.y + 'px',
      				left:this.itemPosition.x + 'px'
      			} )

      			// execute hook
      			if ( typeof props.draggableOptions?.onmove === 'function' ) {
      				props.draggableOptions.onmove( event )
      			}

      			this.mousePosition.y = event.clientY
      			this.mousePosition.x = event.clientX
      		},

      		onend: ( event: DragEvent ) => {
      			console.log( 'temp', this.temp, this.props.stageScale )
                 
      			const target = event.target as HTMLElement
      			target.classList.remove( 'dragging' )
      			if( !target.classList.contains( 'selected' ) ) {
      				target.classList.add( 'selected' )
      			}
      		},
      		modifiers:[interact.modifiers.restrictRect( {
      			restriction:'parent',
      			endOnly:true
      		} )]
      	}
      	this.resizableOptions = {
      		margin: 4,
      		edges: Object.assign( { bottom: true, right: true, top: true, left: true }, props.resizableOptions?.edges ),
      		invert: props.resizableOptions?.invert || 'reposition',
      		onstart:( event:ResizeEvent )=>{
      			const target = event.target as HTMLElement
      			if( !target.classList.contains( 'selected' ) ) {
      				target.classList.add( 'selected' )
      			}
      		},
      		onmove: ( event: ResizeEvent ) => {
                
      			if ( typeof props.resizableOptions?.onmove === 'function' ) {
      				props.resizableOptions.onmove( event )
      			}
      			// update

      			const updateItemSize = {
      				width:event.rect.width,
      				height:event.rect.height
      			}

               
      		},
      		modifiers:[interact.modifiers.restrictSize( {
      			min:{width:4, height:4}
      		} )]

      	}
      	this.setInteractions = this.setInteractions.bind( this )
     }
   
     setInteractions () {
      	this.interact?.unset()
      	this.interact = interact( this.node as HTMLElement )
      	if ( this.props.draggable ) {
      		this.interact?.draggable( this.draggableOptions )
      	}
      	if ( this.props.resizable ) {
      		this.interact?.resizable( this.resizableOptions )
      	}
     }

     handleItemClick( event:MouseEvent ){

      	const target = event.target as HTMLElement
      	if( !target.classList.contains( 'selected' ) ) {
      		target.classList.add( 'selected' )
      	}
     
     }
     componentDidMount () { 
      	this.node?.addEventListener( 'click', this.handleItemClick )
      	this.setInteractions()
     }
    
     componentDidUpdate () {
      	this.setInteractions()
     }
     componentWillUnmount(){
      	this.node?.removeEventListener( 'click', this.handleItemClick )
      	this.interact?.unset() 
     }
     render (): React.ReactNode {
     	return (
     		<div ref={( node: HTMLDivElement ) => this.node = node} className='interact-item'>
     			{this.props.children}
     		</div>
     	)

     }
}


export default ConnectedInteractItem( InteractItem )