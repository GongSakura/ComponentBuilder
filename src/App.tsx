
import React, { ReactNode, Component, ReactElement, ChangeEvent } from 'react'
import InteractItem from './components/interactItem'
import InteractSetup from './components/interactSetup'
import { connect, ConnectedProps } from 'react-redux'

import {setStageScale} from './store/reducers/interactStage'
import './App.less'
import {Button} from 'antd'


const ConnectedApp = connect(null, {setStageScale})

interface AppState{
  interactElements:Array<ReactElement>
  stageScale:number
  stageWidth:number
  stageHeight:number
  stagePosition:{
    x:number
    y:number
  }
}
type AppProps = ConnectedProps<typeof ConnectedApp>


class App extends Component<AppProps, AppState> {
   
  interactElementNumber=0
  interactBoard!:HTMLElement
  interactStage!:HTMLElement
  scaleSmallStep=0.025
  scaleLargeStep=0.1
  scaleUpperBound=3
  scaleLowerBound=0.5
  mouseInBoard=false
  grabInBoard=false
  moveInBoard=false
  mousePosition={
  	x:0,
  	y:0,
  }

  constructor (props:AppProps) {
  	super(props)
  	this.state = {
  		interactElements:[],
  		stageScale:1,
  		stageWidth:100,
  		stageHeight:100,
  		stagePosition:{
  			x:0,
  			y:0
  		}
  	}
  	this.addInteractElement = this.addInteractElement.bind(this)
  	this.handleScaleStageEvent = this.handleScaleStageEvent.bind(this)
  	this.handleResizeStageEvent = this.handleResizeStageEvent.bind(this)
  	this.handleKeyDownEvent = this.handleKeyDownEvent.bind(this)
  	this.handleKeyUpEvent = this.handleKeyUpEvent.bind(this)
  	this.handleMouseEvent = this.handleMouseEvent.bind(this)

  }
 
  addInteractElement (event: React.MouseEvent):void{
    	event.preventDefault()
    	const interactProps = {
    		draggable:true,
    		dropzone:true,
    		resizable:true,
  			id:'i-' + this.interactElementNumber
    	}
    	const updateInteractElements:Array<ReactElement> = [...this.state.interactElements]
    	updateInteractElements.push(<InteractItem key={this.interactElementNumber} {...interactProps}><div>test-dom</div></InteractItem>)
    	this.setState({
    		interactElements:updateInteractElements
    	})   
    	this.interactElementNumber++
  }
  handleSelectItemEvent (event:MouseEvent):void {
  
  	document.querySelectorAll('.interact-item.selected').forEach(e=>e.classList.remove('selected'))
  	const target:HTMLElement = event.target as HTMLElement
  	if(target.classList.contains('interact-item')) {
  		target.classList.add('selected')
  	}
  }
  handleScaleStageEvent (event:WheelEvent):void {
  
  	if(event.metaKey || event.altKey) {
  		event.preventDefault()
  		const oldStageScale = this.state.stageScale
  		let newStageScale = oldStageScale
  		if(event.deltaY > 0 && oldStageScale > this.scaleLowerBound) {
  			// scale down
  			oldStageScale < 1 ? newStageScale -= this.scaleSmallStep : newStageScale -= this.scaleLargeStep
  		}else if(event.deltaY < 0 && oldStageScale < this.scaleUpperBound) {
  			oldStageScale < 1 ? newStageScale += this.scaleSmallStep : newStageScale += this.scaleLargeStep
  		}
  		if(newStageScale !== oldStageScale) {
  			this.props.setStageScale(newStageScale)
  			this.setState({
  				stageScale:newStageScale,
  			})

  			const rect = this.interactBoard.getBoundingClientRect()
  			const pointer = {
  				x:event.clientX - rect.x,
  				y:event.clientY - rect.y
  			}
  			const mousePointTo = {
  				x:(pointer.x - this.state.stagePosition.x) / oldStageScale,
  				y:(pointer.y - this.state.stagePosition.y) / oldStageScale
  			}

  			this.setState({
  				stagePosition:{
  					x:pointer.x - mousePointTo.x * newStageScale,
  					y:pointer.y - mousePointTo.y * newStageScale,
  				}
  			})
  		}
      
  	}
  }
  handleResizeStageEvent (event:ChangeEvent):void {

	  
  	const target = event.currentTarget as HTMLInputElement
  	if(target.classList.contains('stage-width')) {
  		const value = parseInt(target.value) || 0
  		this.setState({stageWidth:value})
  	}else if(target.classList.contains('stage-height')) {
  		const value = parseInt(target.value) || 0
  		this.setState({stageHeight:value})
  	}
  }
  handleMouseEvent (event:MouseEvent):void {
  	switch (event.type) {
  	case 'mouseenter':
  		this.mouseInBoard = true
  		break
  	case 'mouseleave':
  		this.mouseInBoard = false
  		break
  	case 'mousemove':
  		if(this.grabInBoard && this.moveInBoard) {
  			const n_x = this.state.stagePosition.x + event.clientX - this.mousePosition.x
  			const n_y = this.state.stagePosition.y + event.clientY - this.mousePosition.y
  			this.setState({
  				stagePosition:{
  					x:n_x,
  					y:n_y
  				}
  			})
  			this.mousePosition.x = event.clientX
  			this.mousePosition.y = event.clientY
  		}
  		break
  	case 'mousedown':
  		if(this.grabInBoard) {
  			this.moveInBoard = true
  			this.mousePosition.x = event.clientX
  			this.mousePosition.y = event.clientY
  		}
  		break
  	case 'mouseup': 
  		this.moveInBoard = false
  		break

  	}
  }
  handleKeyDownEvent (event:KeyboardEvent):void {
	  
  	if(event.code === 'Space' && this.mouseInBoard) {
  		event.preventDefault()
  		this.interactBoard.style.cursor = 'grab'
  		this.grabInBoard = true
  	}
  }
  handleKeyUpEvent (event:KeyboardEvent):void {    
  	if(event.code === 'Space') {
		  	event.preventDefault()
  		this.interactBoard.style.cursor = ''
  		this.grabInBoard = false
  	}
  }

  componentDidMount () {
  	this.interactBoard = document.querySelector('#interact-board') as HTMLElement
  	this.interactStage = document.querySelector('#interact-stage') as HTMLElement

  	this.interactBoard?.addEventListener('click', this.handleSelectItemEvent)
  	this.interactBoard?.addEventListener('mousemove', this.handleMouseEvent)
  	this.interactBoard?.addEventListener('mousedown', this.handleMouseEvent)
  	this.interactBoard?.addEventListener('mouseup', this.handleMouseEvent)
  	this.interactBoard?.addEventListener('mouseenter', this.handleMouseEvent)
  	this.interactBoard?.addEventListener('mouseleave', this.handleMouseEvent)

  	document.addEventListener('keydown', this.handleKeyDownEvent)
  	document.addEventListener('keyup', this.handleKeyUpEvent)
  	this.interactStage?.addEventListener('wheel', this.handleScaleStageEvent)
  }
  componentWillUnmount () {
  	this.interactBoard?.removeEventListener('click', this.handleSelectItemEvent)
  	this.interactBoard?.removeEventListener('mousemove', this.handleMouseEvent)
  	this.interactBoard?.removeEventListener('mousedown', this.handleMouseEvent)
  	this.interactBoard?.removeEventListener('mouseup', this.handleMouseEvent)
  	this.interactBoard?.removeEventListener('mouseenter', this.handleMouseEvent)
  	this.interactBoard?.removeEventListener('mouseleave', this.handleMouseEvent)

  	document.removeEventListener('keydown', this.handleKeyDownEvent)
  	document.removeEventListener('keyup', this.handleKeyUpEvent)

  	this.interactStage?.removeEventListener('wheel', this.handleScaleStageEvent)
  }

  componentDidUpdate(){
	  console.log(this.state.interactElements[0])
	  
  }
  render (): ReactNode { 
	 const dom = document.createElement('div')
	 dom.innerText = 'text'
  	return <>
	
	  <div id='interact-toolbar'>
		   
  			<Button  onClick={this.addInteractElement}>DIV</Button>
			  
  			<div id='interact-controller'>
  				<span>Width</span>
  				<input className='stage-width'  type="text"  defaultValue={this.state.stageWidth}  onChange={this.handleResizeStageEvent}/>
  				<span>Height</span>
  				<input className='stage-height' type="text"  defaultValue={this.state.stageHeight}  onChange={this.handleResizeStageEvent}/>
  				<span>SclaeRatio: {this.state.stageScale.toFixed(2)}</span>
	
  			</div>
  		</div>
  		<div id='interact-board'>
  			<div id='interact-stage' style={
  				{transform:`scale(${this.state.stageScale})`,
  					minWidth:this.state.stageWidth + '%',
  					minHeight:this.state.stageHeight + '%',
  					left:this.state.stagePosition.x + 'px',
  					top:this.state.stagePosition.y + 'px'}}> 
  				{this.state.interactElements}
  			</div>
			 
  		</div> 
  	</>
  }
}
 

export default ConnectedApp(App)